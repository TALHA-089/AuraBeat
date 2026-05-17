import { useState } from "react";
import { Mic, Play, Settings2, SlidersHorizontal, User, Wand2 } from "lucide-react";

export function CreateSpeech() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(1);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [emphasis, setEmphasis] = useState(50);

  return (
    <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Speech</h1>
          <p className="text-white/50 mt-1">Transform text into ultra-realistic voiceovers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Script</h2>
                <button className="text-xs flex items-center gap-1.5 text-[#7C3AED] hover:text-white transition-colors bg-[#7C3AED]/10 px-3 py-1.5 rounded-md">
                  <Wand2 className="w-3.5 h-3.5" /> Optimize Script
                </button>
              </div>
              
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to synthesize..."
                className="w-full h-[300px] bg-[#0D0D1A] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none transition-all"
                maxLength={5000}
              />
              <div className="text-right mt-2 text-xs text-white/30">
                {text.length} / 5000
              </div>
            </section>

            <div className="flex items-center justify-between bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
              <div>
                <h3 className="font-semibold mb-1">Ready to generate?</h3>
                <p className="text-xs text-white/50">This action will cost 10 Gold per 100 characters.</p>
              </div>
              <button className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] transition-all flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Generate Speech
              </button>
            </div>
          </div>

          {/* Voice & Parameters Panel */}
          <div className="space-y-6">
            
            <section className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-semibold mb-4 text-white/80 flex items-center gap-2">
                <User className="w-4 h-4" /> Voice Presets
              </h2>
              
              <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-2 mb-4">
                {Array.from({ length: 21 }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedVoice(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedVoice === i ? "border-[#7C3AED] shadow-[0_0_15px_-3px_rgba(124,58,237,0.5)]" : "border-transparent hover:border-white/20"}`}
                  >
                    <img 
                      src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                      alt="Voice Avatar" 
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white truncate w-full text-left">Voice {i + 1}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 bg-[#0D0D1A] p-3 rounded-lg border border-white/5">
                <span>Selected: Voice {selectedVoice + 1}</span>
                <button className="flex items-center gap-1 hover:text-white transition-colors">
                  <Play className="w-3 h-3" /> Preview
                </button>
              </div>
            </section>

            <section className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl space-y-6">
              <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Parameters
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/70">Speed</span>
                  <span className="text-[#7C3AED]">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="2.0" step="0.1" 
                  value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>0.5x</span>
                  <span>2.0x</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/70">Pitch</span>
                  <span className="text-[#7C3AED]">{pitch > 0 ? `+${pitch}` : pitch}</span>
                </div>
                <input 
                  type="range" 
                  min="-10" max="10" step="1" 
                  value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>Deep</span>
                  <span>High</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/70">Emphasis</span>
                  <span className="text-[#7C3AED]">{emphasis}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" step="5" 
                  value={emphasis} onChange={(e) => setEmphasis(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>Flat</span>
                  <span>Expressive</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
