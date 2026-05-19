import { NextResponse, type NextRequest } from "next/server";
import { removeStoredTrackAudio } from "@/lib/audio/storageCleanup";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteParams = {
  params: { id: string };
};

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  const { data: track, error: fetchError } = await adminSupabase
    .from("tracks")
    .select("id, audio_url")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string; audio_url: string | null }>();

  if (fetchError) {
    return NextResponse.json({ error: "TRACK_FETCH_FAILED" }, { status: 500 });
  }

  if (!track) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const { error: deleteError } = await adminSupabase
    .from("tracks")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: "TRACK_DELETE_FAILED" }, { status: 500 });
  }

  const storageRemoval = await removeStoredTrackAudio(
    adminSupabase,
    track.audio_url,
  );

  if (storageRemoval.attempted && !storageRemoval.removed) {
    console.warn("Track storage cleanup failed:", storageRemoval.error);
  }

  return NextResponse.json({
    success: true,
    removedStorage: storageRemoval.removed,
  });
}
