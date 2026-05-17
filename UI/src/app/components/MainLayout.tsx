import { Outlet, NavLink } from "react-router";
import { 
  Search, Bell, Home, Music, Mic, Edit3, Library as LibraryIcon, 
  Code, Settings, LayoutDashboard, Play, Pause, SkipBack, SkipForward,
  Volume2, Download, Share2, Coins
} from "lucide-react";
import { useState } from "react";

export function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#0D0D1A] text-white font-sans overflow-hidden selection:bg-[#7C3AED] selection:text-white">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-hidden flex relative">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomPlayer />
    </div>
  );
}

function Sidebar() {
  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Create Music", path: "/create-music", icon: Music },
    { name: "Create Speech", path: "/create-speech", icon: Mic },
    { name: "Music Edit", path: "/music-edit", icon: Edit3 },
    { name: "Library", path: "/library", icon: LibraryIcon },
    { name: "API Platform", path: "/api", icon: Code },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-[280px] hidden md:flex flex-col bg-[#111122] border-r border-white/5">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-purple-400 flex items-center justify-center text-lg font-bold">
            A
          </div>
          <div>
            <h2 className="font-semibold text-sm">Aurabeat</h2>
            <p className="text-xs text-white/50">Pro Tier</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Balance</span>
          </div>
          <span className="text-sm font-bold text-yellow-500">1,250 Gold</span>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  isActive
                    ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <NavLink to="/pricing" className="block rounded-xl p-5 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] relative overflow-hidden group cursor-pointer no-underline text-white">
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
          <h3 className="font-bold text-lg mb-1">Go Premier</h3>
          <p className="text-xs text-white/80 mb-3">Unlock unlimited high-res downloads & API access.</p>
          <div className="w-full py-2 bg-white text-[#4F46E5] text-sm font-semibold rounded-lg shadow-md flex justify-center items-center group-hover:bg-white/90 transition-colors">
            Upgrade Now
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0D0D1A]/80 backdrop-blur-md z-10">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input 
          type="text" 
          placeholder="Search for songs, users, genres..." 
          className="w-full bg-[#111122] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/50 transition-all duration-300"
        />
      </div>
      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors duration-300 text-white/70 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0D0D1A]"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-colors">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
        </div>
      </div>
    </header>
  );
}

function BottomPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-20 bg-[#111122] border-t border-white/5 flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
        <div className="w-12 h-12 rounded-md bg-white/5 overflow-hidden border border-white/10">
          <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop" alt="Track cover" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="text-sm font-semibold truncate">Neon Dreams (Instrumental)</h4>
          <p className="text-xs text-white/50 truncate">Synthwave • 120 BPM</p>
        </div>
      </div>

      <div className="flex-1 max-w-2xl flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">
          <button className="text-white/50 hover:text-white transition-colors"><SkipBack className="w-5 h-5" /></button>
          <button 
            className="w-10 h-10 rounded-full bg-white text-[#111122] flex items-center justify-center hover:scale-105 transition-transform"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <button className="text-white/50 hover:text-white transition-colors"><SkipForward className="w-5 h-5" /></button>
        </div>
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] text-white/50 w-8 text-right">0:45</span>
          <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden relative group cursor-pointer">
            {/* Pseudo Waveform */}
            <div className="absolute inset-0 flex items-center justify-between px-1 gap-[2px] opacity-50 group-hover:opacity-100 transition-opacity">
               {Array.from({ length: 60 }).map((_, i) => (
                 <div key={i} className="flex-1 bg-white/20 rounded-full" style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />
               ))}
            </div>
            {/* Progress overlay */}
            <div className="absolute left-0 top-0 bottom-0 bg-[#7C3AED]/30 w-1/3 border-r border-[#7C3AED] mix-blend-screen" />
          </div>
          <span className="text-[10px] text-white/50 w-8">2:30</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 w-1/4 min-w-[200px]">
        <Volume2 className="w-5 h-5 text-white/50" />
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer">
          <div className="w-2/3 h-full bg-[#7C3AED] rounded-full" />
        </div>
        <div className="w-px h-6 bg-white/10 mx-2" />
        <button className="text-white/50 hover:text-white transition-colors"><Download className="w-5 h-5" /></button>
        <button className="text-white/50 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
      </div>
    </div>
  );
}
