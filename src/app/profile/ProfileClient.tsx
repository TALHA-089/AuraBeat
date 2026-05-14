"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Calendar,
  Coins,
  Crown,
  LogOut,
  Mail,
  Save,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/lib/store/toastStore";

export type UserProfile = {
  id: string;
  display_name: string | null;
  gold_balance: number | null;
  plan: string | null;
  created_at: string | null;
};

type ProfileClientProps = {
  profile: UserProfile;
  email: string;
};

const PLAN_CARDS = [
  {
    name: "Free",
    price: "$0",
    gold: "50 Gold",
    description: "Starter access for basic music generation.",
  },
  {
    name: "Basic",
    price: "$9.99",
    gold: "500 Gold",
    description: "More credits for regular creators.",
  },
  {
    name: "Pro",
    price: "$24.99",
    gold: "2,000 Gold",
    description: "Higher limits for serious creators.",
  },
  {
    name: "Premier",
    price: "$49.99",
    gold: "5,000 Gold",
    description: "Maximum display tier for the MVP demo.",
  },
];

function formatDate(value: string | null) {
  if (!value) return "Unknown date";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizePlan(plan: string | null) {
  return plan?.trim() || "free";
}

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const addToast = useToastStore((state) => state.addToast);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currentPlan = useMemo(() => normalizePlan(profile.plan), [profile.plan]);
  const goldBalance = profile.gold_balance ?? 0;

  async function handleSave() {
    const cleanName = displayName.trim();

    if (cleanName.length < 2) {
      setMessage({
        type: "error",
        text: "Display name must be at least 2 characters.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: cleanName })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      setMessage({
        type: "error",
        text: error.message || "Could not update profile.",
      });
      addToast({
        variant: "error",
        title: "Update failed",
        message: error.message || "Could not update profile.",
      });
      return;
    }

    setMessage({
      type: "success",
      text: "Profile updated successfully.",
    });

    addToast({
      variant: "success",
      title: "Profile updated",
      message: "Your display name has been saved.",
    });

    router.refresh();
  }

  async function handleSignOut() {
    setSigningOut(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setSigningOut(false);
      setMessage({
        type: "error",
        text: error.message || "Could not sign out.",
      });
      addToast({
        variant: "error",
        title: "Sign out failed",
        message: error.message || "Could not sign out.",
      });
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] p-6 pb-24 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-white/60">
          Manage your AuraBeat account and plan.
        </p>
      </div>

      {message ? (
        <div
          className={[
            "mb-5 rounded-xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200",
          ].join(" ")}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-[#1e1e3a] bg-[#111128] p-6 shadow-lg shadow-black/10">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#7C3AED]/20 text-[#C4B5FD]">
              <User className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {profile.display_name || "AuraBeat User"}
              </h2>
              <p className="mt-1 text-sm text-white/50">{email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                Display Name
              </label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#1e1e3a] bg-[#0D0D1A] px-4 text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#7C3AED]"
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                Email
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-[#1e1e3a] bg-[#0D0D1A] px-4 text-white/60">
                <Mail className="h-4 w-4" />
                {email}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#1e1e3a] bg-[#0D0D1A] p-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <BadgeCheck className="h-4 w-4 text-[#A78BFA]" />
                  Plan
                </div>
                <div className="mt-2 capitalize text-lg font-semibold">
                  {currentPlan}
                </div>
              </div>

              <div className="rounded-xl border border-[#1e1e3a] bg-[#0D0D1A] p-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Coins className="h-4 w-4 text-yellow-300" />
                  Gold Balance
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {goldBalance} Gold
                </div>
              </div>

              <div className="rounded-xl border border-[#1e1e3a] bg-[#0D0D1A] p-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Calendar className="h-4 w-4 text-[#A78BFA]" />
                  Member Since
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {formatDate(profile.created_at)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-[#1e1e3a] bg-[#111128] p-6 shadow-lg shadow-black/10">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#7C3AED]/20 text-[#C4B5FD]">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Plans</h2>
              <p className="text-xs text-white/50">Display-only for MVP demo.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {PLAN_CARDS.map((plan) => {
              const isCurrent =
                plan.name.toLowerCase() === currentPlan.toLowerCase();

              return (
                <div
                  key={plan.name}
                  className={[
                    "rounded-xl border p-4",
                    isCurrent
                      ? "border-[#7C3AED] bg-[#7C3AED]/15"
                      : "border-[#1e1e3a] bg-[#0D0D1A]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      <div className="mt-1 text-xs text-white/50">
                        {plan.gold}
                      </div>
                    </div>

                    <div className="text-sm font-bold text-[#C4B5FD]">
                      {plan.price}
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-white/55">
                    {plan.description}
                  </p>

                  {isCurrent ? (
                    <div className="mt-3 inline-flex rounded-full bg-[#7C3AED] px-2.5 py-1 text-xs font-semibold text-white">
                      Current Plan
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-xs leading-5 text-white/40">
            Payments are intentionally not implemented in the free-tier MVP.
            Subscription tiers are shown for academic UI coverage only.
          </p>
        </aside>
      </div>
    </div>
  );
}
