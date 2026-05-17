import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const keyName = (body.name || "Default Key").slice(0, 100);

    // Generate a random API key
    const rawKey = `sk_aura_${crypto.randomBytes(24).toString("hex")}`;
    const prefix = rawKey.slice(0, 12) + "...";
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const { error } = await supabase.from("api_keys").insert({
      user_id: user.id,
      name: keyName,
      key_hash: keyHash,
      prefix,
    });

    if (error) {
      console.error("API key creation error:", error.message);
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      key: rawKey,
      prefix,
      name: keyName,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: "Missing key ID" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", keyId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to deactivate key" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
