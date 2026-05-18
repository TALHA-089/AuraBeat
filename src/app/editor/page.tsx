import { AppLayout } from "@/components/layout/AppLayout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditorClient } from "./EditorClient";

type TrackRow = {
  id: string;
  title: string | null;
  audio_url: string | null;
};

export default async function EditorPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, audio_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<TrackRow[]>();

  return (
    <AppLayout>
      <EditorClient tracks={tracks ?? []} />
    </AppLayout>
  );
}
