import { 
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Scissors, 
  Layers, Settings2, RotateCcw, Link, Play, Pause, 
  SkipBack, SkipForward, SlidersHorizontal, Activity
} from "lucide-react";

export function MusicEdit() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0D0D1A]">
      <div className="p-6 border-b border-white/5 flex flex-col gap-4">
        
        {/* Top Header & Undo/Redo */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Music Editor</h1>
            <p className="text-sm text-white/50">Editing: Neon Dreams (Instrumental)</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#1A1A2E] p-1 rounded-lg border border-white/5">
            <button className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors" title="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors" title="Redo">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-[#1A1A2E] p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1">
            <ToolButton icon={<Scissors />} label="Split" />
            <ToolButton icon={<Layers />} label="Remix" />
            <div className="w-px h-6 bg-white/10 mx-2" />
            
            <ToolButton icon={<Activity />} label="Stem Separation" active />
            <div className="w-px h-6 bg-white/10 mx-2" />
            
            <ToolButton icon={<RotateCcw />} label="Loop" />
            <ToolButton icon={<Link />} label="Merge" />
          </div>

          <div className="flex items-center gap-3 px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 uppercase font-semibold">Tempo</span>
              <div className="flex items-center gap-2 bg-[#0D0D1A] px-3 py-1.5 rounded-md border border-white/5">
                <span className="text-sm">120 BPM</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50 uppercase font-semibold">Key</span>
              <div className="flex items-center gap-2 bg-[#0D0D1A] px-3 py-1.5 rounded-md border border-white/5">
                <span className="text-sm">Am</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Waveform Editor Area */}
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        
        <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-4 flex-1 flex flex-col relative overflow-hidden min-h-[400px]">
          {/* Time Ruler */}
          <div className="h-6 border-b border-white/10 flex items-center justify-between px-16 text-[10px] text-white/30 relative mb-4">
            <span>0:00</span>
            <span>0:30</span>
            <span>1:00</span>
            <span>1:30</span>
            <span>2:00</span>
            <span>2:30</span>
            {/* Playhead */}
            <div className="absolute top-0 bottom-[-400px] w-px bg-red-500 left-1/3 z-10">
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1 -mt-1" />
            </div>
          </div>

          {/* Stems/Tracks */}
          <div className="flex-1 flex flex-col gap-2">
            <Track name="Vocals" color="bg-[#7C3AED]" />
            <Track name="Melody" color="bg-blue-500" />
            <Track name="Bass" color="bg-emerald-500" />
            <Track name="Drums" color="bg-orange-500" />
          </div>

          {/* Selection Brackets Mock */}
          <div className="absolute left-[20%] right-[40%] top-12 bottom-4 bg-white/5 border-l-2 border-r-2 border-white/40 pointer-events-none rounded-sm">
            <div className="absolute top-0 left-1 text-[10px] text-white/60">Selected Region</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30" : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Track({ name, color }: { name: string, color: string }) {
  return (
    <div className="h-24 bg-[#0D0D1A] rounded-lg border border-white/5 flex overflow-hidden group relative">
      <div className="w-32 bg-[#111122] border-r border-white/5 flex flex-col justify-center px-4 shrink-0">
        <h4 className="text-sm font-semibold mb-1">{name}</h4>
        <div className="flex gap-2">
          <button className="text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded">M</button>
          <button className="text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors bg-white/5 px-2 py-0.5 rounded">S</button>
        </div>
      </div>
      <div className="flex-1 relative flex items-center px-2">
        {/* Waveform Mock */}
        <div className="absolute inset-y-4 left-4 right-10 bg-white/5 rounded overflow-hidden flex items-center gap-[1px] px-1">
          {Array.from({ length: 150 }).map((_, i) => (
            <div key={i} className={`flex-1 ${color} opacity-80`} style={{ height: `${Math.max(10, Math.random() * 100)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
