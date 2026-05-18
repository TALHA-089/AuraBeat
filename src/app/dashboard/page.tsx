import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Music, Play, Sparkles, ArrowRight } from "lucide-react";

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
  const totalTracks = tracksCount ?? (recentTracks?.length ?? 0);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Hero Banner */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/20 via-[#4F46E5]/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A] via-transparent to-transparent" />
          <div className="relative px-8 pt-12 pb-10">
            <p className="text-sm text-[#A1A1AA] mb-2 tracking-wider uppercase">Welcome back</p>
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              {displayName}
            </h1>
            <p className="text-[#A1A1AA] text-sm max-w-md mb-6">
              Your AI music studio is ready. You have created {totalTracks} track{totalTracks !== 1 ? "s" : ""} so far.
            </p>
            <Link
              href="/create"
              className="group relative overflow-hidden inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] px-6 py-3 font-semibold text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.6)] transition-all duration-300 no-underline"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              <Sparkles className="w-5 h-5 mr-2" />
              Create New Track
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>

        <div className="px-8 pb-20 space-y-8">
          {/* Quick Stats Row — minimal, non-intrusive */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-[#A1A1AA]">
              <Music className="w-4 h-4 text-[#7C3AED]" />
              <span className="font-medium text-white">{totalTracks}</span> tracks created
            </div>
            <div className="w-px h-4 bg-[#1E1E3A]" />
            <div className="flex items-center gap-2 text-[#A1A1AA]">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="font-medium text-yellow-500">{(profile.gold_balance ?? 0).toLocaleString()}</span> Gold
            </div>
            <div className="w-px h-4 bg-[#1E1E3A]" />
            <div className="flex items-center gap-2 text-[#A1A1AA]">
              <span className="text-xs capitalize bg-[#1E1E3A] px-2 py-0.5 rounded-md text-white/80">{profile.plan?.trim() || "Free"}</span> plan
            </div>
          </div>

          {/* Recent Tracks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Recent Tracks</h2>
              <Link href="/library" className="text-sm text-[#A1A1AA] hover:text-white transition-colors duration-200 flex items-center gap-1 no-underline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#111128] border border-[#1E1E3A] rounded-xl overflow-hidden">
              {recentTracks && recentTracks.length > 0 ? (
                <ul className="divide-y divide-[#1E1E3A]">
                  {recentTracks.map((t, index) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors duration-200 group"
                    >
                      {/* Track number */}
                      <span className="w-6 text-right text-sm text-[#A1A1AA] tabular-nums group-hover:hidden">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        className="w-6 hidden group-hover:flex items-center justify-center text-white"
                        aria-label={`Play ${t.title || "Untitled Track"}`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white truncate block">
                          {t.title?.trim() || "Untitled Track"}
                        </span>
                      </div>

                      {/* Metadata */}
                      <span className="text-xs text-[#A1A1AA] tabular-nums">
                        {formatDate(t.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Music className="w-7 h-7 text-[#A1A1AA]" />
                  </div>
                  <h3 className="font-medium text-white mb-1">No tracks yet</h3>
                  <p className="text-sm text-[#A1A1AA] mb-4">
                    Create your first AI-generated track to get started.
                  </p>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-lg hover:bg-[#6D28D9] transition-colors duration-200 no-underline"
                  >
                    <Music className="w-4 h-4" />
                    Create Music
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
