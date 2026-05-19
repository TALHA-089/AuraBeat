import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileAdminStatus } from "@/lib/auth/admin";
import { removeStoredTrackAudio } from "@/lib/audio/storageCleanup";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase env vars");
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may not allow setting cookies.
        }
      },
    },
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase();
    
    // Authenticate the user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const isAdmin = await getProfileAdminStatus(adminSupabase, user.id);

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Parse URL params
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("id");

    if (!trackId) {
      return NextResponse.json({ error: "Missing track ID" }, { status: 400 });
    }

    const { data: track, error: fetchError } = await adminSupabase
      .from("tracks")
      .select("audio_url")
      .eq("id", trackId)
      .maybeSingle<{ audio_url: string | null }>();

    if (fetchError) {
      console.error("Admin track fetch error:", fetchError.message);
      return NextResponse.json(
        { error: "Failed to fetch track." },
        { status: 500 }
      );
    }

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const { error } = await adminSupabase
      .from("tracks")
      .delete()
      .eq("id", trackId);

    if (error) {
      console.error("Admin track deletion error:", error.message);
      return NextResponse.json(
        { error: "Failed to delete track." },
        { status: 500 }
      );
    }

    const storageRemoval = await removeStoredTrackAudio(
      adminSupabase,
      track.audio_url,
    );

    if (storageRemoval.attempted && !storageRemoval.removed) {
      console.warn("Admin track storage cleanup failed:", storageRemoval.error);
    }

    return NextResponse.json({
      success: true,
      removedStorage: storageRemoval.removed,
    });
  } catch (err) {
    console.error("Admin track API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
