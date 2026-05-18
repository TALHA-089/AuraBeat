import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

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

    // Verify admin status disabled for demo visibility
    /*
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle<{ is_admin: boolean | null }>();

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    */

    // Parse URL params
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("id");

    if (!trackId) {
      return NextResponse.json({ error: "Missing track ID" }, { status: 400 });
    }

    // Delete track
    const { error } = await supabase
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin track API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
