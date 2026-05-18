const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");

const DEFAULT_BASE_URLS = ["http://127.0.0.1:3000", "http://127.0.0.1:3001"];
const TIMEOUT = Number(process.env.SELENIUM_TIMEOUT_MS || 20000);

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
    throw new Error(`Missing ${name}. Add it to .env.local or export it before running Selenium.`);
  }
  return value;
}

function writeSilentWav(filePath) {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const durationSeconds = 1;
  const numSamples = sampleRate * durationSeconds;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  fs.writeFileSync(filePath, buffer);
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
      // Try the next configured local URL.
    }
  }

  throw new Error(
    `Could not reach AuraBeat. Start the app with "npm run dev" or set SELENIUM_BASE_URL. Tried: ${candidates.join(", ")}`,
  );
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
    throw new Error("Could not find a Supabase auth cookie after login/register.");
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

async function waitForBodyText(driver, text, timeout = TIMEOUT) {
  await driver.wait(
    async () => {
      const bodyText = await driver.findElement(By.css("body")).getText();
      return bodyText.includes(text);
    },
    timeout,
    `Timed out waiting for page text: ${text}`,
  );
}

async function clickByXPath(driver, xpath, timeout = TIMEOUT) {
  const element = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
  await element.click();
  return element;
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
    console.warn(`Could not delete test auth user ${userId}. Status: ${response.status}`);
  }
}

async function registerTestUser(driver, baseUrl, email, password) {
  console.log("Registering a test user");
  await driver.get(`${baseUrl}/register`);
  await driver.wait(until.elementLocated(By.id("displayName")), TIMEOUT);
  await driver.findElement(By.id("displayName")).sendKeys("Selenium Test");
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
        throw new Error(
          "Registration requires email confirmation. Disable confirmation for Selenium, or create a confirmed test user before running.",
        );
      }

      return false;
    },
    TIMEOUT,
    "Timed out waiting for registration to redirect to /dashboard",
  );
}

async function boostCredits(driver, userId) {
  console.log("Updating test profile credits");
  const result = await runBrowserFetch(
    driver,
    async (id) => {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, gold_balance: 100, plan: "Pro" }),
      });
      const body = await response.json();
      return { status: response.status, body };
    },
    userId,
  );

  if (result.error || result.status !== 200) {
    throw new Error(`Profile credit update failed: ${JSON.stringify(result)}`);
  }
}

async function createTrackFixture({ supabaseUrl, anonKey, accessToken, userId, title }) {
  const response = await supabaseRest(supabaseUrl, anonKey, accessToken, "tracks", {
    method: "POST",
    body: [
      {
        user_id: userId,
        title,
        prompt: "Automated test track insertion",
        style_tags: ["selenium", "Lo-fi"],
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        status: "completed",
      },
    ],
  });

  if (response.status !== 201 || !Array.isArray(response.body) || !response.body[0]?.id) {
    throw new Error(`Unexpected track insert response: ${JSON.stringify(response)}`);
  }

  return response.body[0];
}

async function verifyReferenceAudioUpload(driver, baseUrl, trackFile) {
  console.log("Uploading reference audio through the create page");
  await driver.get(`${baseUrl}/create`);
  await driver.wait(until.urlContains("/create"), TIMEOUT);

  await clickByXPath(driver, "//button[normalize-space()='Custom']");
  await clickByXPath(
    driver,
    "//button[.//span[contains(text(),'Advanced Parameters')] or contains(normalize-space(.),'Advanced Parameters')]",
  );

  const fileInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='file']")), TIMEOUT);
  await fileInput.sendKeys(trackFile);
  await driver.wait(
    async () => {
      const bodyText = await driver.findElement(By.css("body")).getText();
      if (bodyText.includes("Upload failed")) {
        throw new Error(bodyText);
      }
      return bodyText.includes("Ready");
    },
    TIMEOUT,
    "Timed out waiting for reference audio upload to finish",
  );
}

async function verifyLibraryPlayback(driver, baseUrl, trackTitle) {
  console.log("Reading the track in the library and starting playback");
  await driver.get(`${baseUrl}/library`);
  await driver.wait(until.urlContains("/library"), TIMEOUT);

  const listViewButton = await driver.findElement(By.css('button[aria-label="List View"]'));
  await listViewButton.click();
  await waitForBodyText(driver, trackTitle);

  const trackPlayButton = await driver.findElement(
    By.xpath(`//*[contains(text(),${JSON.stringify(trackTitle)})]/ancestor::tr//button[starts-with(@aria-label,'Play')]`),
  );
  await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", trackPlayButton);
  await trackPlayButton.click();
  await waitForBodyText(driver, "Now playing", 10000);
}

async function verifyEditorLoads(driver, baseUrl) {
  console.log("Confirming editor controls render");
  await driver.get(`${baseUrl}/editor`);
  await driver.wait(until.elementLocated(By.css('input[aria-label="Tempo"]')), TIMEOUT);
  await waitForBodyText(driver, "Music Editor");
}

async function createApiKey(driver) {
  console.log("Creating an API key");
  const response = await runBrowserFetch(
    driver,
    async () => {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Selenium CRUD ${Date.now()}` }),
      });
      const body = await response.json();
      return { status: response.status, body };
    },
  );

  if (response.error || response.status !== 200 || !response.body?.key) {
    throw new Error(`API key creation failed: ${JSON.stringify(response)}`);
  }

  return response.body.key;
}

async function verifyPublicTrackApi(baseUrl, apiKey, trackId) {
  console.log("Verifying /v1/tracks list and detail");
  const headers = { Authorization: `Bearer ${apiKey}` };

  const tracksList = await fetchJson(`${baseUrl}/v1/tracks?limit=50`, { headers });
  if (tracksList.status !== 200 || !Array.isArray(tracksList.body?.tracks)) {
    throw new Error(`Unexpected /v1/tracks response: ${JSON.stringify(tracksList)}`);
  }

  const foundTrack = tracksList.body.tracks.find((track) => track.id === trackId);
  if (!foundTrack) {
    throw new Error("Created track was not returned from /v1/tracks");
  }

  const trackDetails = await fetchJson(`${baseUrl}/v1/tracks/${trackId}`, { headers });
  if (trackDetails.status !== 200 || trackDetails.body?.track?.id !== trackId) {
    throw new Error(`Unexpected /v1/tracks/:id response: ${JSON.stringify(trackDetails)}`);
  }
}

async function verifyPublicTrackDelete(baseUrl, apiKey, trackId) {
  console.log("Deleting the track through /v1/tracks/:id");
  const headers = { Authorization: `Bearer ${apiKey}` };

  const deleteResult = await fetchJson(`${baseUrl}/v1/tracks/${trackId}`, {
    method: "DELETE",
    headers,
  });

  if (deleteResult.status !== 200 || deleteResult.body?.success !== true) {
    throw new Error(`DELETE /v1/tracks/${trackId} failed: ${JSON.stringify(deleteResult)}`);
  }

  const afterDelete = await fetchJson(`${baseUrl}/v1/tracks/${trackId}`, { headers });
  if (afterDelete.status !== 404) {
    throw new Error(`Expected deleted track to return 404, got: ${JSON.stringify(afterDelete)}`);
  }
}

async function maybeVerifyGeneration(baseUrl, apiKey) {
  if (env.SELENIUM_RUN_GENERATE !== "1") {
    console.log("Skipping /v1/generate. Set SELENIUM_RUN_GENERATE=1 to include the live AI backend.");
    return null;
  }

  console.log("Calling /v1/generate against the configured AI backend");
  const generateResponse = await fetchJson(`${baseUrl}/v1/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: "Selenium test groove with warm synths",
      styleTag: "Lo-fi",
      isInstrumental: true,
      vocalGender: "any",
      vocalTone: "warm",
    }),
    signal: AbortSignal.timeout(Number(env.SELENIUM_GENERATE_TIMEOUT_MS || 120000)),
  });

  if (generateResponse.status !== 200 || !generateResponse.body?.success) {
    throw new Error(`Unexpected /v1/generate response: ${JSON.stringify(generateResponse)}`);
  }

  return generateResponse.body.track?.id || null;
}

async function main() {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE;
  const baseUrl = await resolveBaseUrl();
  const testEmail = `selenium+${Date.now()}-${crypto.randomBytes(4).toString("hex")}@example.com`;
  const testPassword = "Test1234!";
  const trackTitle = `Selenium Smoke Track ${Date.now()}`;
  const trackFile = path.resolve(__dirname, "test-audio.wav");
  let driver = null;
  let userId = null;
  let accessToken = null;
  let apiKey = null;
  let trackId = null;
  let generatedTrackId = null;

  writeSilentWav(trackFile);

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
    console.log(`Running Selenium CRUD flow against ${baseUrl}`);
    await registerTestUser(driver, baseUrl, testEmail, testPassword);

    const session = await getSessionFromBrowser(driver, supabaseUrl, anonKey);
    userId = session.userId;
    accessToken = session.accessToken;

    await boostCredits(driver, userId);

    console.log("Creating a track fixture through Supabase REST");
    const track = await createTrackFixture({
      supabaseUrl,
      anonKey,
      accessToken,
      userId,
      title: trackTitle,
    });
    trackId = track.id;
    console.log(`Inserted test track ${trackId}`);

    await verifyReferenceAudioUpload(driver, baseUrl, trackFile);
    await verifyLibraryPlayback(driver, baseUrl, trackTitle);
    await verifyEditorLoads(driver, baseUrl);

    apiKey = await createApiKey(driver);
    await verifyPublicTrackApi(baseUrl, apiKey, trackId);
    generatedTrackId = await maybeVerifyGeneration(baseUrl, apiKey);
    await verifyPublicTrackDelete(baseUrl, apiKey, trackId);
    trackId = null;

    console.log("Selenium CRUD flow completed successfully");
  } finally {
    if (apiKey) {
      // API key rows are harmless after test user cleanup, but keeping this log helps when cleanup is disabled.
      console.log("API key fixture created for the test user");
    }

    if (trackId && accessToken) {
      await supabaseRest(supabaseUrl, anonKey, accessToken, "tracks", {
        method: "DELETE",
        query: `?id=eq.${encodeURIComponent(trackId)}`,
        headers: { Prefer: "return=minimal" },
      }).catch((error) => console.warn(`Could not cleanup track fixture: ${error.message}`));
    }

    if (generatedTrackId && accessToken) {
      await supabaseRest(supabaseUrl, anonKey, accessToken, "tracks", {
        method: "DELETE",
        query: `?id=eq.${encodeURIComponent(generatedTrackId)}`,
        headers: { Prefer: "return=minimal" },
      }).catch((error) => console.warn(`Could not cleanup generated track: ${error.message}`));
    }

    await deleteAuthUserIfPossible(supabaseUrl, serviceRoleKey, userId).catch((error) =>
      console.warn(`Could not cleanup test auth user: ${error.message}`),
    );

    if (driver) await driver.quit();
    if (fs.existsSync(trackFile)) fs.unlinkSync(trackFile);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
