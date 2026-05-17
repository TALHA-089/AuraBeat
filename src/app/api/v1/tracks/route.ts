import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKey } from "@/lib/auth/apiKey";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20) || 20, 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0) || 0, 0);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("id, title, prompt, style_tags, audio_url, created_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: "TRACK_FETCH_FAILED" }, { status: 500 });
  }

  return NextResponse.json({
    tracks: data ?? [],
    offset,
    limit,
  });
}
