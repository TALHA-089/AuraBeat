"use client";

import { Search, Bell } from "lucide-react";

export function TopBar() {
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
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0D0D1A]" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-purple-400 flex items-center justify-center text-xs font-bold text-white cursor-pointer border border-white/10 hover:border-white/30 transition-colors">
          A
        </div>
      </div>
    </header>
  );
}
