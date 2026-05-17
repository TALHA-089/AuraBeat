import { AppLayout } from "@/components/layout/AppLayout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminClient } from "./AdminClient";

type ProfileRow = {
  id: string;
  display_name: string | null;
  gold_balance: number | null;
  plan: string | null;
  is_admin: boolean | null;
  created_at: string | null;
};


type TrackRow = {
  id: string;
  title: string | null;
  user_id: string;
  style_tags: string[] | null;
  created_at: string | null;
};

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Check admin status disabled for demo visibility
  /*
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle<{ is_admin: boolean | null }>();

  if (!adminProfile?.is_admin) {
    redirect("/dashboard");
  }
  */

  // Fetch aggregate data
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { count: totalTracks } = await supabase
    .from("tracks")
    .select("id", { count: "exact", head: true });

  const { data: goldData } = await supabase
    .from("profiles")
    .select("gold_balance")
    .returns<{ gold_balance: number | null }[]>();

  const totalGold =
    goldData?.reduce((sum, p) => sum + (p.gold_balance ?? 0), 0) ?? 0;

  // Recent profiles
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, gold_balance, plan, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<ProfileRow[]>();

  // Recent tracks
  const { data: recentTracks } = await supabase
    .from("tracks")
    .select("id, title, user_id, style_tags, created_at")
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<TrackRow[]>();

  // API key count
  let apiKeyCount = 0;
  try {
    const { count } = await supabase
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    apiKeyCount = count ?? 0;
  } catch {
    // api_keys table might not exist yet
  }

  return (
    <AppLayout>
      <AdminClient
        stats={{
          totalUsers: totalUsers ?? 0,
          totalTracks: totalTracks ?? 0,
          totalGold,
          activeApiKeys: apiKeyCount,
        }}
        users={recentProfiles ?? []}
        tracks={recentTracks ?? []}
      />
    </AppLayout>
  );
}
