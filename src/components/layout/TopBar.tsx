"use client";

import { Search, Bell, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSessionStore } from "@/lib/store/sessionStore";

export function TopBar() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const userInitial = useSessionStore((state) => state.userInitial);
  const setUserInitial = useSessionStore((state) => state.setUserInitial);
  const clearSession = useSessionStore((state) => state.clearSession);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userInitial && userInitial !== "A") return;

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email;
      if (email) {
        setUserInitial(email.charAt(0).toUpperCase());
      }
    });
  }, [setUserInitial, userInitial]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearSession();
    router.push("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[#1E1E3A] bg-[#0D0D1A]/80 backdrop-blur-md z-10 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search for songs, genres..."
          className="w-full bg-[#111122] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/50 transition-all duration-300"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-4">
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-white/5 transition-colors duration-300 text-white/70 hover:text-white"
          aria-label="Notifications"
          onClick={() => router.push("/notifications")}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0D0D1A]" />
        </button>

        {/* Avatar with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-purple-400 flex items-center justify-center text-xs font-bold text-white cursor-pointer border border-white/10 hover:border-white/30 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Profile menu"
          >
            {userInitial}
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 transition-colors text-sm"
                onClick={() => {
                  router.push("/profile");
                  setShowMenu(false);
                }}
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <hr className="border-white/10" />
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-red-500/10 transition-colors text-sm"
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
