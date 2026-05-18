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

export async function PATCH(request: NextRequest) {
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

    // Parse payload
    const body = await request.json();
    const { userId, plan, gold_balance } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        plan: plan || "Free",
        gold_balance: typeof gold_balance === "number" ? gold_balance : 0,
        // is_admin: Boolean(is_admin), // Disabled for demo to prevent missing column error
      })
      .eq("id", userId);

    if (error) {
      console.error("Admin user update error:", error.message);
      return NextResponse.json(
        { error: "Failed to update user profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin user API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
