import { useState } from "react";
import { 
  Search, Filter, List, Grid, Trash2, Download, BookmarkPlus, 
  MoreVertical, Play, Calendar, Music, Mic 
} from "lucide-react";

export function Library() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<number[]>([]);

  const mockItems = [
    { id: 1, title: "Neon Dreams (Instrumental)", type: "music", date: "2 hours ago", duration: "2:30", genre: "Synthwave" },
    { id: 2, title: "Podcast Intro Voiceover", type: "speech", date: "Yesterday", duration: "0:45", genre: "Voice 3" },
    { id: 3, title: "Cyberpunk Chase Theme", type: "music", date: "2 days ago", duration: "3:15", genre: "Cyberpunk" },
    { id: 4, title: "Meditation Guide", type: "speech", date: "Last week", duration: "10:00", genre: "Voice 12" },
    { id: 5, title: "Lo-fi Study Beats Vol 1", type: "music", date: "Last week", duration: "2:40", genre: "Lo-fi" },
  ];

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === mockItems.length) {
      setSelected([]);
    } else {
      setSelected(mockItems.map(m => m.id));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0D0D1A] overflow-hidden">
      
      {/* Header & Controls */}
      <div className="p-6 border-b border-white/5 bg-[#111122]/50">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Library</h1>
          <div className="flex bg-[#1A1A2E] border border-white/5 rounded-lg p-1">
            <button className="px-4 py-1.5 text-sm font-medium bg-[#7C3AED] text-white rounded-md">All Files</button>
            <button className="px-4 py-1.5 text-sm font-medium text-white/50 hover:text-white rounded-md transition-colors">Playlists</button>
            <button className="px-4 py-1.5 text-sm font-medium text-white/50 hover:text-white rounded-md transition-colors flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" /> Trash
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search library..." 
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1A2E] border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            
            <select className="bg-[#1A1A2E] border border-white/10 rounded-lg py-2 px-3 text-sm text-white/70 focus:outline-none focus:border-[#7C3AED] transition-colors appearance-none pr-8">
              <option>Sort: Newest</option>
              <option>Sort: Oldest</option>
              <option>Sort: A-Z</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#1A1A2E] p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setView("grid")}
              className={`p-1.5 rounded ${view === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView("list")}
              className={`p-1.5 rounded ${view === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar */}
      {selected.length > 0 && (
        <div className="bg-[#7C3AED]/10 border-b border-[#7C3AED]/30 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-[#7C3AED]">{selected.length} items selected</span>
            <button className="text-xs text-white/50 hover:text-white" onClick={() => setSelected([])}>Clear selection</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-medium transition-colors">
              <BookmarkPlus className="w-3.5 h-3.5" /> Add to Playlist
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md text-xs font-medium transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mockItems.map((item) => (
              <div key={item.id} className="group relative bg-[#1A1A2E] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all shadow-lg hover:shadow-xl">
                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity data-[selected=true]:opacity-100" data-selected={selected.includes(item.id)}>
                  <input 
                    type="checkbox" 
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-[#7C3AED] checked:border-transparent accent-[#7C3AED] cursor-pointer"
                  />
                </div>
                
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded bg-black/50 text-white/70 hover:text-white backdrop-blur-sm">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="aspect-square bg-[#0D0D1A] relative flex items-center justify-center border-b border-white/5">
                  {item.type === "music" ? (
                    <Music className="w-12 h-12 text-white/10" />
                  ) : (
                    <Mic className="w-12 h-12 text-white/10" />
                  )}
                  {/* Waveform visual overlay */}
                  <div className="absolute inset-x-4 bottom-4 h-8 flex items-end gap-[2px] opacity-30">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="flex-1 bg-[#7C3AED] rounded-t-sm" style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />
                    ))}
                  </div>
                  {/* Play Button Overlay */}
                  <button className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 shadow-lg shadow-[#7C3AED]/30">
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm truncate mb-1" title={item.title}>{item.title}</h3>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{item.genre}</span>
                    <span>{item.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider bg-[#111122]">
                  <th className="py-3 px-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      checked={selected.length === mockItems.length}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-white/20 bg-black/50 accent-[#7C3AED] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 w-32">Type</th>
                  <th className="py-3 px-4 w-32">Genre</th>
                  <th className="py-3 px-4 w-32">Duration</th>
                  <th className="py-3 px-4 w-40">Date Modified</th>
                  <th className="py-3 px-4 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {mockItems.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-white/20 bg-black/50 accent-[#7C3AED] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                        <span className="font-medium text-sm group-hover:-translate-x-8 transition-transform duration-300 relative left-8 group-hover:left-0">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/60 capitalize flex items-center gap-2">
                      {item.type === "music" ? <Music className="w-3.5 h-3.5 text-white/30" /> : <Mic className="w-3.5 h-3.5 text-white/30" />}
                      {item.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/60">{item.genre}</td>
                    <td className="py-3 px-4 text-sm text-white/60">{item.duration}</td>
                    <td className="py-3 px-4 text-sm text-white/60 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-white/30" /> {item.date}
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
