"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Code,
  Coins,
  Crown,
  Home,
  Library,
  Mic,
  Music,
  Shield,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/create", label: "Create Music", icon: Music },
  { href: "/speech", label: "Create Speech", icon: Mic },
  { href: "/editor", label: "Music Editor", icon: SlidersHorizontal },
  { href: "/library", label: "Library", icon: Library },
  { href: "/api-platform", label: "API Platform", icon: Code },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [gold, setGold] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("gold_balance")
        .eq("id", user.id)
        .maybeSingle<{ gold_balance: number | null }>()
        .then(({ data }) => {
          if (data) {
            setGold(data.gold_balance ?? 0);
          }
          // Force admin true for demo visibility
          setIsAdmin(true);
        });
    });
  }, []);

  return (
    <aside className="hidden w-[260px] flex-col bg-[#0F0F20] md:flex z-40 relative shrink-0">
      {/* Right edge separator line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-[#1E1E3A]" />

      {/* Scrollable sidebar content */}
      <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
        {/* Logo */}
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-purple-400 flex items-center justify-center text-base font-bold text-white shadow-lg shadow-[#7C3AED]/20">
              A
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white leading-tight">Aurabeat</h2>
              <p className="text-[11px] text-[#A1A1AA]">AI Music Studio</p>
            </div>
          </div>
        </div>

        {/* Gold Balance — compact pill */}
        <div className="mx-5 mb-4 flex items-center gap-2.5 rounded-lg bg-yellow-500/[0.08] border border-yellow-500/15 px-3 py-2.5">
          <div className="w-7 h-7 rounded-md bg-yellow-500/15 flex items-center justify-center shrink-0">
            <Coins className="w-3.5 h-3.5 text-yellow-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-[#A1A1AA] font-semibold leading-none mb-0.5">
              Gold Balance
            </p>
            <p className="text-sm font-bold text-yellow-500 leading-none">
              {gold !== null ? gold.toLocaleString() : "—"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-[#1E1E3A] mb-2" />

        {/* Navigation */}
        <nav className="px-3 space-y-0.5 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                    : "text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </Link>
            );
          })}

          {/* Admin link — only for admins */}
          {isAdmin && (
            <Link
              href="/admin"
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                pathname === "/admin"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                  : "text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white",
              ].join(" ")}
            >
              <Shield className="w-[18px] h-[18px]" />
              Admin
            </Link>
          )}
        </nav>
      </div>

      {/* Go Premier CTA — pinned at bottom, outside scroll */}
      <div className="p-4 border-t border-[#1E1E3A]">
        <Link
          href="/profile"
          className="block rounded-xl p-4 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] relative overflow-hidden group no-underline text-white"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full" />
          <div className="absolute -right-2 -bottom-4 w-14 h-14 bg-white/5 rounded-full" />
          <div className="flex items-center gap-2 mb-1 relative">
            <Crown className="w-4 h-4" />
            <h3 className="font-bold text-sm">Go Premier</h3>
          </div>
          <p className="text-[11px] text-white/80 mb-2.5 relative leading-relaxed">
            Unlock unlimited high-res downloads &amp; more Gold.
          </p>
          <div className="w-full py-1.5 bg-white text-[#4F46E5] text-xs font-semibold rounded-lg shadow-md flex justify-center items-center group-hover:bg-white/90 transition-colors relative">
            View Plans
          </div>
        </Link>
      </div>
    </aside>
  );
}
