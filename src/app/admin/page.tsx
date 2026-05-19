import { AppLayout } from "@/components/layout/AppLayout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileAdminStatus, isMissingAdminColumnError } from "@/lib/auth/admin";
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

  const adminSupabase = createAdminClient();
  const isAdmin = await getProfileAdminStatus(adminSupabase, user.id);

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch aggregate data
  const { count: totalUsers } = await adminSupabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { count: totalTracks } = await adminSupabase
    .from("tracks")
    .select("id", { count: "exact", head: true });

  const { data: goldData } = await adminSupabase
    .from("profiles")
    .select("gold_balance")
    .returns<{ gold_balance: number | null }[]>();

  const totalGold =
    goldData?.reduce((sum, p) => sum + (p.gold_balance ?? 0), 0) ?? 0;

  // Recent profiles
  const recentProfilesResult = await adminSupabase
    .from("profiles")
    .select("id, display_name, gold_balance, plan, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<ProfileRow[]>();
  let recentProfiles = recentProfilesResult.data;

  if (isMissingAdminColumnError(recentProfilesResult.error)) {
    const { data: fallbackProfiles } = await adminSupabase
      .from("profiles")
      .select("id, display_name, gold_balance, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<Omit<ProfileRow, "is_admin">[]>();

    recentProfiles =
      fallbackProfiles?.map((profile) => ({
        ...profile,
        is_admin: profile.plan?.toLowerCase() === "admin",
      })) ?? null;
  }

  // Recent tracks
  const { data: recentTracks } = await adminSupabase
    .from("tracks")
    .select("id, title, user_id, style_tags, created_at")
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<TrackRow[]>();

  // API key count
  let apiKeyCount = 0;
  try {
    const { count } = await adminSupabase
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
