import { createServerClient } from "@supabase/ssr";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  const key = serviceKey || anonKey;

  if (!supabaseUrl || !key) {
    throw new Error("Missing Supabase env vars for admin client");
  }

  return createServerClient(supabaseUrl, key, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op for service client.
      },
    },
  });
}
