import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { LibraryClient, type LibraryTrack } from "@/app/library/LibraryClient";

export default async function LibraryPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tracks, error } = await supabase
    .from("tracks")
    .select("id, title, prompt, style_tags, audio_url, duration_seconds, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Library fetch error:", error.message);
  }

  return (
    <AppLayout>
      <LibraryClient tracks={(tracks ?? []) as LibraryTrack[]} />
    </AppLayout>
  );
}
