const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

const DEFAULT_BASE_URLS = ["http://127.0.0.1:3001", "http://127.0.0.1:3000"];
const TIMEOUT = Number(process.env.SELENIUM_TIMEOUT_MS || 20000);
const OUT_DIR = path.resolve("artifacts/report");
const SCREENSHOT_DIR = path.join(OUT_DIR, "screenshots");

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 900 },
  mobile: { width: 390, height: 844 },
};

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const eq = line.indexOf("=");
        if (eq === -1) return [line, ""];
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        return [key, value];
      }),
  );
}

const env = {
  ...parseEnvFile(path.resolve(".env.local")),
  ...process.env,
};

function requiredEnv(name) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local or export it.`);
  }
  return value;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: response.status, ok: response.ok, body };
}

async function resolveBaseUrl() {
  const explicit = env.SELENIUM_BASE_URL || env.AURABEAT_BASE_URL || env.BASE_URL;
  const candidates = explicit ? [explicit] : DEFAULT_BASE_URLS;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
      });
      if (response.status < 500) return candidate.replace(/\/$/, "");
    } catch {
      // Try the next local URL.
    }
  }

  throw new Error(`Could not reach AuraBeat. Tried: ${candidates.join(", ")}`);
}

function decodeStoredSession(value) {
  let raw = decodeURIComponent(value);
  if (raw.startsWith("base64-")) {
    raw = Buffer.from(raw.slice("base64-".length), "base64").toString("utf8");
  }

  const parsed = JSON.parse(raw);
  const accessToken =
    parsed?.access_token ||
    parsed?.currentSession?.access_token ||
    parsed?.session?.access_token ||
    (Array.isArray(parsed) ? parsed[0]?.access_token || parsed[0] : null);
  const userId =
    parsed?.user?.id ||
    parsed?.currentSession?.user?.id ||
    parsed?.session?.user?.id ||
    (Array.isArray(parsed) ? parsed[0]?.user?.id : null);

  return { accessToken, userId };
}

async function getSessionFromBrowser(driver, supabaseUrl, anonKey) {
  const cookies = await driver.manage().getCookies();
  const authCookies = cookies.filter((cookie) => cookie.name.includes("-auth-token"));

  if (authCookies.length === 0) {
    throw new Error("Could not find a Supabase auth cookie after registration.");
  }

  const grouped = new Map();
  for (const cookie of authCookies) {
    const match = cookie.name.match(/^(.*-auth-token)(?:\.(\d+))?$/);
    const baseName = match?.[1] || cookie.name;
    const index = match?.[2] ? Number(match[2]) : 0;
    const parts = grouped.get(baseName) || [];
    parts.push({ index, value: cookie.value });
    grouped.set(baseName, parts);
  }

  const values = [...grouped.values()].map((parts) =>
    parts
      .sort((a, b) => a.index - b.index)
      .map((part) => part.value)
      .join(""),
  );

  let lastError = null;
  for (const value of values) {
    try {
      const session = decodeStoredSession(value);
      if (!session.accessToken) continue;

      if (!session.userId) {
        const userResponse = await fetchJson(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        session.userId = userResponse.body?.id;
      }

      if (session.accessToken && session.userId) return session;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Could not decode a usable Supabase session cookie.${lastError ? ` Last error: ${lastError.message}` : ""}`,
  );
}

async function runBrowserFetch(driver, script, ...args) {
  return driver.executeAsyncScript(
    `
      const callback = arguments[arguments.length - 1];
      const args = Array.from(arguments).slice(0, -1);
      (${script})(...args)
        .then((value) => callback(value))
        .catch((error) => callback({ error: error.message || String(error) }));
    `,
    ...args,
  );
}

async function supabaseRest(supabaseUrl, anonKey, accessToken, table, options) {
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...(options.headers || {}),
  };

  return fetchJson(`${supabaseUrl}/rest/v1/${table}${options.query || ""}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

async function deleteAuthUserIfPossible(supabaseUrl, serviceRoleKey, userId) {
  if (!serviceRoleKey || !userId || env.SELENIUM_KEEP_TEST_USER === "1") return;

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    console.warn(`Could not delete screenshot auth user ${userId}. Status: ${response.status}`);
  }
}

async function waitForBodyText(driver, text, timeout = TIMEOUT) {
  const normalizedText = text.toLowerCase();
  try {
    await driver.wait(
      async () => {
        const bodyText = await driver.findElement(By.css("body")).getText();
        return bodyText.toLowerCase().includes(normalizedText);
      },
      timeout,
      `Timed out waiting for page text: ${text}`,
    );
  } catch (error) {
    const url = await driver.getCurrentUrl().catch(() => "unknown");
    const bodyText = await driver
      .findElement(By.css("body"))
      .getText()
      .catch(() => "");
    error.message = `${error.message}\nCurrent URL: ${url}\nLast body text: ${bodyText.slice(0, 1000)}`;
    throw error;
  }
}

async function waitForPage(driver) {
  await driver.wait(
    async () => driver.executeScript("return document.readyState === 'complete'"),
    TIMEOUT,
    "Timed out waiting for document.readyState complete",
  );
  await driver.sleep(500);
}

async function clickByXPath(driver, xpath, timeout = TIMEOUT) {
  const element = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
  await element.click();
  return element;
}

async function setViewport(driver, viewport) {
  await driver.manage().window().setRect({
    width: viewport.width,
    height: viewport.height,
  });
  await driver.sleep(300);
}

async function pageMetrics(driver) {
  return driver.executeScript(`
    const doc = document.documentElement;
    const body = document.body;
    return {
      scrollWidth: Math.max(doc.scrollWidth, body ? body.scrollWidth : 0),
      clientWidth: doc.clientWidth,
      scrollHeight: Math.max(doc.scrollHeight, body ? body.scrollHeight : 0),
      clientHeight: doc.clientHeight,
      url: location.href,
      title: document.title,
    };
  `);
}

async function capture(driver, captures, filename, description) {
  await waitForPage(driver);
  const metrics = await pageMetrics(driver);
  const filePath = path.join(SCREENSHOT_DIR, filename);
  const base64 = await driver.takeScreenshot();
  fs.writeFileSync(filePath, base64, "base64");
  captures.push({
    file: path.relative(process.cwd(), filePath),
    description,
    url: metrics.url,
    width: metrics.clientWidth,
    height: metrics.clientHeight,
    horizontalOverflow: metrics.scrollWidth > metrics.clientWidth + 2,
  });
  console.log(`Captured ${filename}`);
}

async function captureFullPage(driver, captures, filename, description) {
  await waitForPage(driver);
  const filePath = path.join(SCREENSHOT_DIR, filename);
  let base64 = await driver.takeScreenshot();

  if (typeof driver.sendDevToolsCommand === "function") {
    const metrics = await pageMetrics(driver);
    const width = Math.min(Math.max(metrics.scrollWidth, metrics.clientWidth), 1800);
    const height = Math.min(Math.max(metrics.scrollHeight, metrics.clientHeight), 12000);
    await driver.sendDevToolsCommand("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const screenshot =
      typeof driver.sendAndGetDevToolsCommand === "function"
        ? await driver.sendAndGetDevToolsCommand("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
          fromSurface: true,
        })
        : null;
    if (screenshot?.data) {
      base64 = screenshot.data;
    }
    await driver.sendDevToolsCommand("Emulation.clearDeviceMetricsOverride", {});
  }

  fs.writeFileSync(filePath, base64, "base64");
  const metrics = await pageMetrics(driver);
  captures.push({
    file: path.relative(process.cwd(), filePath),
    description,
    url: metrics.url,
    width: metrics.clientWidth,
    height: metrics.clientHeight,
    horizontalOverflow: metrics.scrollWidth > metrics.clientWidth + 2,
  });
  console.log(`Captured ${filename}`);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createConsoleEvidenceHtml() {
  const files = [
    ["Lint output", "lint-output.txt"],
    ["Build output", "build-output.txt"],
    ["Selenium CRUD output", "selenium-output.txt"],
  ];

  const sections = files
    .map(([title, file]) => {
      const outputPath = path.join(OUT_DIR, file);
      const output = fs.existsSync(outputPath)
        ? fs.readFileSync(outputPath, "utf8")
        : `Missing ${file}. Run the verification command first.`;
      return `<section><h2>${escapeHtml(title)}</h2><pre>${escapeHtml(output)}</pre></section>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>AuraBeat verification evidence</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        background: #0d0d1a;
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main { padding: 32px; max-width: 1180px; margin: 0 auto; }
      h1 { margin: 0 0 20px; font-size: 28px; }
      h2 { margin: 28px 0 10px; font-size: 16px; color: #c4b5fd; }
      section { page-break-inside: avoid; }
      pre {
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        background: #05050b;
        padding: 18px;
        color: #d4d4d8;
        line-height: 1.5;
        font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>AuraBeat Verification Evidence</h1>
      ${sections}
    </main>
  </body>
</html>`;

  const htmlPath = path.join(OUT_DIR, "verification-evidence.html");
  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

async function registerTestUser(driver, baseUrl, email, password) {
  console.log("Registering screenshot demo user");
  await driver.get(`${baseUrl}/register`);
  await driver.wait(until.elementLocated(By.id("displayName")), TIMEOUT);
  await driver.findElement(By.id("displayName")).sendKeys("AuraBeat Viva Demo");
  await driver.findElement(By.id("email")).sendKeys(email);
  await driver.findElement(By.css('input[name="new-password"]')).sendKeys(password);
  await driver.findElement(By.css('input[name="confirm-password"]')).sendKeys(password);
  await driver.findElement(By.css('input[type="checkbox"]')).click();
  await driver.findElement(By.css('button[type="submit"]')).click();

  await driver.wait(
    async () => {
      const url = await driver.getCurrentUrl();
      if (url.includes("/dashboard")) return true;

      const bodyText = await driver.findElement(By.css("body")).getText();
      if (bodyText.includes("Please check your email")) {
        throw new Error("Registration requires email confirmation.");
      }
      return false;
    },
    TIMEOUT,
    "Timed out waiting for registration to redirect to /dashboard",
  );
}

async function updateScreenshotProfile({ supabaseUrl, serviceRoleKey, userId }) {
  console.log("Updating screenshot profile credits");

  if (!serviceRoleKey) {
    throw new Error("Missing service role key. Screenshot fixtures require service-role setup.");
  }

  const profile = {
    gold_balance: 250,
    plan: "Admin",
    is_admin: true,
  };
  const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`;
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  let result = await fetchJson(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(profile),
  });

  const missingAdminColumn =
    result.body?.code === "42703" ||
    result.body?.code === "PGRST204" ||
    String(result.body?.message ?? "").includes("is_admin");

  if (result.status !== 204 && missingAdminColumn) {
    result = await fetchJson(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        gold_balance: profile.gold_balance,
        plan: profile.plan,
      }),
    });
  }

  if (result.status !== 204) {
    throw new Error(`Profile update failed: ${JSON.stringify(result)}`);
  }
}

async function createTrackFixtures({ supabaseUrl, anonKey, accessToken, userId }) {
  console.log("Creating screenshot track fixtures");
  const tags = ["Lo-fi", "Pop", "Ambient", "Electronic", "Jazz", "R&B"];
  const tracks = tags.map((tag, index) => ({
    user_id: userId,
    title: `Viva Demo Track ${index + 1}`,
    prompt: `Presentation-ready ${tag.toLowerCase()} track generated for AuraBeat demo screenshots.`,
    style_tags: [tag, "demo"],
    audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index + 1}.mp3`,
    duration_seconds: 180 + index * 12,
    status: "completed",
  }));

  const response = await supabaseRest(supabaseUrl, anonKey, accessToken, "tracks", {
    method: "POST",
    body: tracks,
  });

  if (response.status !== 201 || !Array.isArray(response.body)) {
    throw new Error(`Unexpected fixture insert response: ${JSON.stringify(response)}`);
  }

  return response.body;
}

async function cleanupFixtures({ supabaseUrl, anonKey, accessToken, serviceRoleKey, userId }) {
  if (userId && accessToken) {
    await supabaseRest(supabaseUrl, anonKey, accessToken, "tracks", {
      method: "DELETE",
      query: `?user_id=eq.${encodeURIComponent(userId)}`,
      headers: { Prefer: "return=minimal" },
    }).catch((error) => console.warn(`Could not cleanup screenshot tracks: ${error.message}`));
  }

  await deleteAuthUserIfPossible(supabaseUrl, serviceRoleKey, userId).catch((error) =>
    console.warn(`Could not cleanup screenshot auth user: ${error.message}`),
  );
}

async function captureResponsiveSmoke(driver, baseUrl) {
  const pages = [
    ["/dashboard", "Welcome back"],
    ["/create", "Create Music"],
    ["/library", "Library"],
    ["/editor", "Music Editor"],
    ["/profile", "Profile"],
    ["/api-platform", "API Platform"],
    ["/admin", "Admin Dashboard"],
  ];
  const results = [];

  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    await setViewport(driver, viewport);
    for (const [route, text] of pages) {
      await driver.get(`${baseUrl}${route}`);
      await waitForBodyText(driver, text);
      await waitForPage(driver);
      const metrics = await pageMetrics(driver);
      results.push({
        viewport: name,
        route,
        width: metrics.clientWidth,
        height: metrics.clientHeight,
        horizontalOverflow: metrics.scrollWidth > metrics.clientWidth + 2,
      });
    }
  }

  const smokePath = path.join(OUT_DIR, "responsive-smoke.json");
  fs.writeFileSync(smokePath, JSON.stringify(results, null, 2));
  console.log(`Wrote ${path.relative(process.cwd(), smokePath)}`);
  return results;
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE;
  const baseUrl = await resolveBaseUrl();
  const captures = [];
  const testEmail = `screenshots+${Date.now()}-${crypto.randomBytes(4).toString("hex")}@example.com`;
  const testPassword = "Test1234!";
  let driver = null;
  let userId = null;
  let accessToken = null;

  const options = new chrome.Options();
  if (env.SELENIUM_HEADLESS !== "0") {
    options.addArguments("--headless=new");
  }
  options.addArguments(
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1440,900",
    "--autoplay-policy=no-user-gesture-required",
  );

  driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();

  try {
    console.log(`Capturing report screenshots against ${baseUrl}`);

    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`${baseUrl}/login`);
    await driver.wait(until.elementLocated(By.id("email")), TIMEOUT);
    await capture(driver, captures, "01-login-desktop.png", "Login page at desktop width");

    await setViewport(driver, VIEWPORTS.mobile);
    await driver.get(`${baseUrl}/login`);
    await driver.wait(until.elementLocated(By.id("email")), TIMEOUT);
    await capture(driver, captures, "02-login-mobile.png", "Login page at mobile width");

    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`${baseUrl}/register`);
    await driver.wait(until.elementLocated(By.id("displayName")), TIMEOUT);
    await capture(driver, captures, "03-register-desktop.png", "Register page at desktop width");

    await registerTestUser(driver, baseUrl, testEmail, testPassword);
    const session = await getSessionFromBrowser(driver, supabaseUrl, anonKey);
    userId = session.userId;
    accessToken = session.accessToken;
    await updateScreenshotProfile({ supabaseUrl, serviceRoleKey, userId });
    await createTrackFixtures({ supabaseUrl, anonKey, accessToken, userId });

    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      await setViewport(driver, viewport);
      await driver.get(`${baseUrl}/dashboard`);
      await waitForBodyText(driver, "Welcome back");
      await capture(driver, captures, `04-dashboard-${name}.png`, `Dashboard at ${name} width`);
    }

    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`${baseUrl}/create`);
    await waitForBodyText(driver, "Create Music");
    await capture(driver, captures, "05-create-desktop.png", "Create Music page at desktop width");

    await setViewport(driver, VIEWPORTS.tablet);
    await driver.get(`${baseUrl}/create`);
    await waitForBodyText(driver, "Create Music");
    await capture(driver, captures, "05-create-tablet.png", "Create Music page at tablet width");

    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`${baseUrl}/create`);
    await waitForBodyText(driver, "Create Music");
    await clickByXPath(
      driver,
      "//button[.//span[contains(text(),'Advanced Parameters')] or contains(normalize-space(.),'Advanced Parameters')]",
    );
    await waitForBodyText(driver, "+ Reference Audio");
    const uploadSection = await driver.findElement(By.xpath("//*[contains(text(), '+ Reference Audio')]"));
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", uploadSection);
    await capture(driver, captures, "06-create-advanced-upload.png", "Create Music advanced upload controls");

    await driver.get(`${baseUrl}/library`);
    await waitForBodyText(driver, "Viva Demo Track");
    await capture(driver, captures, "07-library-grid.png", "Library grid view with seeded tracks");

    await setViewport(driver, VIEWPORTS.tablet);
    await driver.get(`${baseUrl}/library`);
    await waitForBodyText(driver, "Viva Demo Track");
    await capture(driver, captures, "07-library-tablet.png", "Library grid view at tablet width");

    await setViewport(driver, VIEWPORTS.mobile);
    await driver.get(`${baseUrl}/library`);
    await waitForBodyText(driver, "Viva Demo Track");
    await driver.executeScript(`
      const scroller = Array.from(document.querySelectorAll('.custom-scrollbar'))
        .find((el) => el.scrollHeight > el.clientHeight && el.textContent.includes('Viva Demo Track'));
      if (scroller) scroller.scrollTop = 420;
    `);
    await capture(driver, captures, "07-library-mobile.png", "Library grid view at mobile width");

    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`${baseUrl}/library`);
    await waitForBodyText(driver, "Viva Demo Track");
    await driver.findElement(By.css('button[aria-label="List View"]')).click();
    await waitForBodyText(driver, "Genre");
    await capture(driver, captures, "08-library-list.png", "Library list view with CRUD actions");

    const playButton = await driver.findElement(By.xpath("//button[starts-with(@aria-label,'Play Viva Demo Track')]"));
    await driver.executeScript("arguments[0].click();", playButton);
    await waitForBodyText(driver, "Now playing");
    await capture(driver, captures, "09-audio-player-active.png", "Persistent audio player after starting playback");

    const editButton = await driver.findElement(By.xpath("//button[starts-with(@aria-label,'Edit Viva Demo Track')]"));
    await driver.executeScript("arguments[0].click();", editButton);
    await waitForBodyText(driver, "Edit track");
    await capture(driver, captures, "10-edit-track-modal.png", "Library edit track modal");

    await driver.get(`${baseUrl}/editor`);
    await waitForBodyText(driver, "Music Editor");
    await setViewport(driver, VIEWPORTS.desktop);
    await capture(driver, captures, "11-editor-desktop.png", "Editor page at desktop width");
    await setViewport(driver, VIEWPORTS.tablet);
    await capture(driver, captures, "12-editor-tablet.png", "Editor page at tablet width");

    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`${baseUrl}/profile`);
    await waitForBodyText(driver, "Manage your AuraBeat account");
    await capture(driver, captures, "13-profile.png", "Profile page");

    await driver.get(`${baseUrl}/api-platform`);
    await waitForBodyText(driver, "API Platform");
    await capture(driver, captures, "14-api-platform.png", "API Platform page");

    await setViewport(driver, VIEWPORTS.tablet);
    await driver.get(`${baseUrl}/api-platform`);
    await waitForBodyText(driver, "API Platform");
    await capture(driver, captures, "14-api-platform-tablet.png", "API Platform page at tablet width");

    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`${baseUrl}/api-platform`);
    await waitForBodyText(driver, "API Platform");
    await clickByXPath(driver, "//button[normalize-space()='Create Key']");
    await waitForBodyText(driver, "Create API Key");
    await capture(driver, captures, "15-api-key-modal.png", "API key creation modal before revealing a secret key");

    await driver.get(`${baseUrl}/admin`);
    await waitForBodyText(driver, "Admin Dashboard");
    await capture(driver, captures, "16-admin-dashboard.png", "Admin dashboard");

    const evidencePath = createConsoleEvidenceHtml();
    await setViewport(driver, VIEWPORTS.desktop);
    await driver.get(`file://${evidencePath}`);
    await captureFullPage(driver, captures, "17-verification-output.png", "Lint, build, and Selenium output evidence");

    const responsiveSmoke = await captureResponsiveSmoke(driver, baseUrl);
    const manifestPath = path.join(OUT_DIR, "screenshot-manifest.json");
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          baseUrl,
          capturedAt: new Date().toISOString(),
          screenshots: captures,
          responsiveSmoke,
        },
        null,
        2,
      ),
    );
    console.log(`Wrote ${path.relative(process.cwd(), manifestPath)}`);
  } finally {
    if (driver) await driver.quit();
    await cleanupFixtures({ supabaseUrl, anonKey, accessToken, serviceRoleKey, userId });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
