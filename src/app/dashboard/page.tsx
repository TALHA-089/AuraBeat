import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Play } from "lucide-react";

type ProfileRow = {
  gold_balance: number | null;
  display_name: string | null;
  plan: string | null;
};

type TrackRow = {
  id: string;
  title: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("gold_balance, display_name, plan")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (profileError || !profile) {
    redirect("/login");
  }

  const { data: recentTracks } = await supabase
    .from("tracks")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<TrackRow[]>();

  const { count: tracksCount } = await supabase
    .from("tracks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const displayName = profile.display_name?.trim() || "Creator";
  const goldBalance = profile.gold_balance ?? 0;
  const plan = profile.plan?.trim() || "Free";
  const totalTracks = tracksCount ?? (recentTracks?.length ?? 0);

  return (
    <AppLayout>
      <div className="p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayName}!
          </h1>

          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-5 py-3 font-semibold text-white transition-opacity hover:opacity-95"
          >
            Create Music
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#7C3AED]/30 bg-[#111128] p-6">
            <div className="text-sm text-white/70">Gold Balance</div>
            <div className="mt-2 text-3xl font-bold">
              {goldBalance} <span className="text-2xl">🪙</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#7C3AED]/30 bg-[#111128] p-6">
            <div className="text-sm text-white/70">Plan</div>
            <div className="mt-2 text-3xl font-bold">
              {plan} <span className="text-2xl">⭐</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#7C3AED]/30 bg-[#111128] p-6">
            <div className="text-sm text-white/70">Tracks Created</div>
            <div className="mt-2 text-3xl font-bold">
              {totalTracks} <span className="text-2xl">🎵</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Recent Tracks</h2>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#111128]">
            {recentTracks && recentTracks.length > 0 ? (
              <ul className="divide-y divide-white/10">
                {recentTracks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">
                        {t.title?.trim() ? t.title : "Untitled Track"}
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {formatDate(t.created_at)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      aria-label="Play track"
                    >
                      <Play className="h-4 w-4" />
                      Play
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-6 text-white/70">
                No tracks yet — hit{" "}
                <Link href="/create" className="font-semibold text-[#7C3AED]">
                  Create Music
                </Link>{" "}
                to make your first one!
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

