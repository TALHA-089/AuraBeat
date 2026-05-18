import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKey } from "@/lib/auth/apiKey";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteParams = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiKey(request);
  if ("error" in auth) return auth.error;

  const supabase = createAdminClient();
  const { data: track, error } = await supabase
    .from("tracks")
    .select("id, title, prompt, style_tags, audio_url, created_at")
    .eq("id", params.id)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "TRACK_FETCH_FAILED" }, { status: 500 });
  }

  if (!track) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ track });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiKey(request);
  if ("error" in auth) return auth.error;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tracks")
    .delete()
    .eq("id", params.id)
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "TRACK_DELETE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
