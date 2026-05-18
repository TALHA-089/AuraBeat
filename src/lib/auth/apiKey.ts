import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ApiKeyAuthResult =
  | { userId: string; keyId: string }
  | { error: NextResponse };

export async function authenticateApiKey(
  request: NextRequest,
): Promise<ApiKeyAuthResult> {
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) {
    return {
      error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  const rawKey = header.slice(7).trim();
  if (!rawKey) {
    return {
      error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const supabase = createAdminClient();

  const { data: apiKey, error } = await supabase
    .from("api_keys")
    .select("id, user_id, is_active")
    .eq("key_hash", keyHash)
    .maybeSingle<{ id: string; user_id: string; is_active: boolean | null }>();

  if (error || !apiKey || apiKey.is_active === false) {
    return {
      error: NextResponse.json({ error: "INVALID_API_KEY" }, { status: 401 }),
    };
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", apiKey.id);

  return { userId: apiKey.user_id, keyId: apiKey.id };
}
