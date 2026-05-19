import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileAdminStatus, isMissingAdminColumnError } from "@/lib/auth/admin";

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

    const adminSupabase = createAdminClient();
    const isAdmin = await getProfileAdminStatus(adminSupabase, user.id);

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Parse payload
    const body = await request.json();
    const { userId, plan, gold_balance, is_admin } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const updatePayload: {
      plan: string;
      gold_balance: number;
      is_admin?: boolean;
    } = {
      plan: typeof plan === "string" && plan.trim() ? plan.trim() : "Free",
      gold_balance: typeof gold_balance === "number" ? gold_balance : 0,
    };

    if (typeof is_admin === "boolean") {
      updatePayload.is_admin = is_admin;
    }

    let { error } = await adminSupabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId);

    if (isMissingAdminColumnError(error) && typeof is_admin === "boolean") {
      const fallbackPayload = {
        plan: is_admin ? "Admin" : updatePayload.plan.toLowerCase() === "admin" ? "Free" : updatePayload.plan,
        gold_balance: updatePayload.gold_balance,
      };

      const fallbackResult = await adminSupabase
        .from("profiles")
        .update(fallbackPayload)
        .eq("id", userId);
      error = fallbackResult.error;
    }

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
