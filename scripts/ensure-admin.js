const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const LOCAL_ADMIN_FILE = path.resolve(".admin.local.json");
const ADMIN_SUMMARY_FILE = path.resolve("artifacts/report/admin-seed-result.json");
const ADMIN_SQL = `
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists profiles_is_admin_idx
  on public.profiles (is_admin)
  where is_admin = true;

comment on column public.profiles.is_admin is
  'Controls access to the AuraBeat admin dashboard and internal admin API routes.';
`;

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

function readLocalAdminFile() {
  if (!fs.existsSync(LOCAL_ADMIN_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(LOCAL_ADMIN_FILE, "utf8"));
  } catch {
    return {};
  }
}

const localAdmin = readLocalAdminFile();
const env = {
  ...parseEnvFile(path.resolve(".env.local")),
  ...process.env,
};

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE;
const adminEmail =
  env.AURABEAT_ADMIN_EMAIL ||
  env.ADMIN_EMAIL ||
  localAdmin.email ||
  "admin@aurabeat.local";
const providedPassword =
  env.AURABEAT_ADMIN_PASSWORD || env.ADMIN_PASSWORD || localAdmin.password || "";

function required(value, name) {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function jsonFetch(url, options = {}) {
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
  return { response, body };
}

function serviceHeaders(extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function isMissingAdminColumn(body) {
  const message = String(body?.message ?? "");
  return (
    body?.code === "42703" ||
    body?.code === "PGRST204" ||
    message.includes("profiles.is_admin") ||
    (message.includes("is_admin") && message.includes("profiles"))
  );
}

async function tryApplyAdminSchema() {
  const attempts = [
    ["exec_sql", { sql: ADMIN_SQL }],
    ["exec_sql", { query: ADMIN_SQL }],
    ["execute_sql", { sql: ADMIN_SQL }],
    ["execute_sql", { query: ADMIN_SQL }],
  ];

  for (const [fn, payload] of attempts) {
    const { response } = await jsonFetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: serviceHeaders(),
      body: JSON.stringify(payload),
    });
    if (response.ok) return true;
  }

  return false;
}

async function adminColumnExists() {
  const { response, body } = await jsonFetch(
    `${supabaseUrl}/rest/v1/profiles?select=id,is_admin&limit=1`,
    { headers: serviceHeaders() },
  );

  if (response.ok) return true;
  if (isMissingAdminColumn(body)) return false;
  throw new Error(`Could not inspect profiles.is_admin: ${JSON.stringify(body)}`);
}

async function findExistingAdmin(hasIsAdminColumn) {
  const query = hasIsAdminColumn
    ? "select=id,display_name,plan,is_admin&is_admin=eq.true&limit=1"
    : "select=id,display_name,plan&plan=ilike.admin&limit=1";
  const { response, body } = await jsonFetch(`${supabaseUrl}/rest/v1/profiles?${query}`, {
    headers: serviceHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Could not check existing admin profile: ${JSON.stringify(body)}`);
  }

  return Array.isArray(body) && body.length > 0 ? body[0] : null;
}

async function listAuthUsers() {
  const users = [];
  let page = 1;

  while (page < 20) {
    const { response, body } = await jsonFetch(
      `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=100`,
      { headers: serviceHeaders() },
    );

    if (!response.ok) {
      throw new Error(`Could not list auth users: ${JSON.stringify(body)}`);
    }

    const pageUsers = Array.isArray(body?.users) ? body.users : [];
    users.push(...pageUsers);
    if (pageUsers.length < 100) break;
    page += 1;
  }

  return users;
}

async function createAuthUser(email, password) {
  const { response, body } = await jsonFetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: serviceHeaders(),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "AuraBeat Admin" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not create admin auth user: ${JSON.stringify(body)}`);
  }

  return body;
}

async function upsertAdminProfile(userId, hasIsAdminColumn) {
  const profile = {
    id: userId,
    display_name: "AuraBeat Admin",
    gold_balance: 1000,
    plan: "Admin",
    ...(hasIsAdminColumn ? { is_admin: true } : {}),
  };

  const { response, body } = await jsonFetch(
    `${supabaseUrl}/rest/v1/profiles?on_conflict=id`,
    {
      method: "POST",
      headers: serviceHeaders({ Prefer: "resolution=merge-duplicates,return=representation" }),
      body: JSON.stringify(profile),
    },
  );

  if (!response.ok) {
    throw new Error(`Could not upsert admin profile: ${JSON.stringify(body)}`);
  }

  return Array.isArray(body) ? body[0] : body;
}

function makePassword() {
  return `${crypto.randomBytes(18).toString("base64url")}A1!`;
}

function writeLocalAdminCredentials(email, password) {
  fs.writeFileSync(
    LOCAL_ADMIN_FILE,
    JSON.stringify(
      {
        email,
        password,
        note: "Local AuraBeat demo admin credentials. This file is gitignored.",
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

function writeSummary(summary) {
  fs.mkdirSync(path.dirname(ADMIN_SUMMARY_FILE), { recursive: true });
  fs.writeFileSync(ADMIN_SUMMARY_FILE, JSON.stringify(summary, null, 2));
}

async function main() {
  required(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");
  required(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE");

  let schemaAppliedByRpc = false;
  let hasIsAdminColumn = await adminColumnExists();
  if (!hasIsAdminColumn) {
    schemaAppliedByRpc = await tryApplyAdminSchema();
    hasIsAdminColumn = await adminColumnExists();
  }

  const existingAdmin = await findExistingAdmin(hasIsAdminColumn);
  if (existingAdmin) {
    const summary = {
      status: "exists",
      checkedAt: new Date().toISOString(),
      adminModel: hasIsAdminColumn ? "profiles.is_admin" : "profiles.plan=Admin fallback",
      schemaAppliedByRpc,
      adminUserId: existingAdmin.id,
      message: "An admin profile already exists; no new admin was created.",
    };
    writeSummary(summary);
    console.log(JSON.stringify(summary));
    return;
  }

  const users = await listAuthUsers();
  let authUser = users.find(
    (user) => String(user.email ?? "").toLowerCase() === adminEmail.toLowerCase(),
  );
  let createdAuthUser = false;
  let generatedPassword = false;
  const password = providedPassword || makePassword();

  if (!providedPassword) {
    generatedPassword = true;
    writeLocalAdminCredentials(adminEmail, password);
  }

  if (!authUser) {
    authUser = await createAuthUser(adminEmail, password);
    createdAuthUser = true;
  }

  await upsertAdminProfile(authUser.id, hasIsAdminColumn);

  const summary = {
    status: "seeded",
    checkedAt: new Date().toISOString(),
    adminModel: hasIsAdminColumn ? "profiles.is_admin" : "profiles.plan=Admin fallback",
    schemaAppliedByRpc,
    createdAuthUser,
    generatedPassword,
    adminEmail,
    adminUserId: authUser.id,
    credentialFile: generatedPassword ? path.relative(process.cwd(), LOCAL_ADMIN_FILE) : null,
    message: generatedPassword
      ? "Admin was seeded. Generated credentials were written to the gitignored credential file."
      : "Admin was seeded using the configured admin password.",
  };
  writeSummary(summary);
  console.log(JSON.stringify(summary));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
