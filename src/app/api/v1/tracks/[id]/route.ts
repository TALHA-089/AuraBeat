import { NextResponse, type NextRequest } from "next/server";
import { authenticateApiKey } from "@/lib/auth/apiKey";
import { removeStoredTrackAudio } from "@/lib/audio/storageCleanup";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteParams = {
  params: { id: string };
};

type PatchBody = {
  title?: unknown;
  prompt?: unknown;
  style_tags?: unknown;
  status?: unknown;
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiKey(request);
  if ("error" in auth) return auth.error;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const updates: {
    title?: string;
    prompt?: string;
    style_tags?: string[];
    status?: string;
  } = {};

  if (typeof body.title === "string") {
    const title = body.title.trim().slice(0, 120);
    if (!title) {
      return NextResponse.json({ error: "TITLE_REQUIRED" }, { status: 400 });
    }
    updates.title = title;
  }

  if (typeof body.prompt === "string") {
    updates.prompt = body.prompt.trim().slice(0, 500);
  }

  if (Array.isArray(body.style_tags)) {
    updates.style_tags = body.style_tags
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  if (typeof body.status === "string") {
    updates.status = body.status.trim().slice(0, 40);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "NO_UPDATES" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: track, error } = await supabase
    .from("tracks")
    .update(updates)
    .eq("id", params.id)
    .eq("user_id", auth.userId)
    .select("id, title, prompt, style_tags, audio_url, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "TRACK_UPDATE_FAILED" }, { status: 500 });
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

  const { data: track } = await supabase
    .from("tracks")
    .select("audio_url")
    .eq("id", params.id)
    .eq("user_id", auth.userId)
    .maybeSingle<{ audio_url: string | null }>();

  const { error } = await supabase
    .from("tracks")
    .delete()
    .eq("id", params.id)
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: "TRACK_DELETE_FAILED" }, { status: 500 });
  }

  const storageRemoval = await removeStoredTrackAudio(supabase, track?.audio_url);
  if (storageRemoval.attempted && !storageRemoval.removed) {
    console.warn("Track storage cleanup failed:", storageRemoval.error);
  }

  return NextResponse.json({
    success: true,
    removedStorage: storageRemoval.removed,
  });
}
