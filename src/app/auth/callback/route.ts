import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login", origin));
    }

    return NextResponse.redirect(new URL(next, origin));
  } catch {
    return NextResponse.redirect(new URL("/login", origin));
  }
}
