import { useState } from "react";
import { 
  Wand2, Dices, Mic, Upload, Music, Play, BookmarkPlus, 
  Download, RefreshCcw, Loader2, Sparkles, AlertCircle
} from "lucide-react";
import { Switch } from "@radix-ui/react-switch"; // Need to check if I have this or implement simple one
import { motion, AnimatePresence } from "motion/react";

export function CreateMusic() {
  const [mode, setMode] = useState<"easy" | "custom">("custom");
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [prompt, setPrompt] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "any">("any");
  const [tone, setTone] = useState("warm");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleCreate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setResults([
        { id: 1, title: "Neon Dreams - Variation 1", duration: "2:30", type: "Main" },
        { id: 2, title: "Neon Dreams - Variation 2", duration: "2:45", type: "Alt" }
      ]);
    }, 3000);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Center Panel (Input Workspace) */}
      <div className="flex-1 overflow-y-auto p-8 border-r border-white/5 relative custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Create Music</h1>
            <div className="bg-[#1A1A2E] p-1 rounded-lg flex border border-white/5">
              <button 
                onClick={() => setMode("easy")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "easy" ? "bg-[#7C3AED] text-white" : "text-white/50 hover:text-white"}`}
              >
                Easy
              </button>
              <button 
                onClick={() => setMode("custom")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "custom" ? "bg-[#7C3AED] text-white" : "text-white/50 hover:text-white"}`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Lyrics Section */}
          <section className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Lyrics & Vocals
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">Instrumental</span>
                <button 
                  onClick={() => setIsInstrumental(!isInstrumental)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${isInstrumental ? "bg-[#7C3AED]" : "bg-white/10"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isInstrumental ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <textarea 
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                disabled={isInstrumental}
                placeholder={isInstrumental ? "Enter lyrics here or leave blank for instrumental." : "Write your lyrics here..."}
                className="w-full h-40 bg-[#0D0D1A] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none transition-all disabled:opacity-50"
                maxLength={3000}
              />
              {!isInstrumental && (
                <button className="absolute bottom-4 right-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10">
                  <Wand2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Optimize with AI
                </button>
              )}
            </div>
            <div className="text-right mt-2 text-xs text-white/30">
              {lyrics.length} / 3000
            </div>
          </section>

          {/* Style & Genre Section */}
          <section className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Style & Genre</h2>
              <button className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white transition-colors" title="Randomize">
                <Dices className="w-5 h-5" />
              </button>
            </div>
            
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the musical style, instruments, and vibe... e.g. Upbeat synthwave with a driving bassline and ethereal vocals"
              className="w-full h-24 bg-[#0D0D1A] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none transition-all mb-4"
            />

            <div className="flex flex-wrap gap-2">
              {["Reggaeton", "Lo-fi", "Synthwave", "Drill", "Acoustic Pop", "Cinematic", "Cyberpunk"].map(chip => (
                <button 
                  key={chip}
                  className="px-4 py-1.5 rounded-full border border-[#7C3AED]/50 bg-[#7C3AED]/10 text-white/80 hover:bg-[#7C3AED]/20 hover:text-white text-xs font-medium transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </section>

          {mode === "custom" && (
            <>
              {/* Vocal Customization */}
              <section className="grid grid-cols-2 gap-6">
                <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
                  <h2 className="text-sm font-semibold mb-4 text-white/80">Vocal Gender</h2>
                  <div className="flex gap-2 p-1 bg-[#0D0D1A] rounded-lg border border-white/5">
                    {["any", "male", "female"].map(g => (
                      <button 
                        key={g}
                        onClick={() => setGender(g as any)}
                        className={`flex-1 py-2 text-xs font-medium rounded-md capitalize transition-colors ${gender === g ? "bg-[#2A2A40] text-white shadow-sm" : "text-white/50 hover:text-white"}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
                  <h2 className="text-sm font-semibold mb-4 text-white/80">Tone Presets</h2>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" }}
                  >
                    <option value="warm">Warm & Intimate</option>
                    <option value="raspy">Raspy & Edgy</option>
                    <option value="clear">Clear & Pop</option>
                    <option value="ethereal">Ethereal & Reverb</option>
                  </select>
                </div>
              </section>

              {/* Uploads */}
              <section className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-xl">
                <div className="flex border-b border-white/10 mb-6">
                  <button className="px-4 py-2 border-b-2 border-[#7C3AED] text-sm font-medium text-white">
                    + Reference Audio
                  </button>
                  <button className="px-4 py-2 border-b-2 border-transparent text-sm font-medium text-white/50 hover:text-white transition-colors">
                    + Vocal/Melody Ideas
                  </button>
                </div>
                
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/5 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/20 transition-colors">
                    <Upload className="w-6 h-6 text-white/50 group-hover:text-[#7C3AED]" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">Drag & drop your audio file</h3>
                  <p className="text-xs text-white/40 mb-4">WAV, MP3, or FLAC up to 50MB</p>
                  
                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs text-white/30 uppercase">or record directly</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  
                  <button className="mt-4 flex items-center gap-2 bg-[#0D0D1A] border border-white/10 px-4 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:border-white/30 transition-all">
                    <Mic className="w-4 h-4 text-red-400" />
                    Start Recording
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Validation & CTA */}
          <div className="pt-4 flex flex-col items-center">
            {lyrics.length === 0 && !isInstrumental && mode === "easy" && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4" />
                Please enter lyrics or enable instrumental mode.
              </div>
            )}
            <button 
              onClick={handleCreate}
              disabled={isGenerating || (lyrics.length === 0 && !isInstrumental && mode === "easy")}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-12 py-4 font-bold text-lg shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-10px_rgba(124,58,237,0.7)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-md flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5" />
                  Create Track
                  <span className="ml-2 text-xs font-normal bg-black/20 px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                    -50 <span className="text-yellow-400">●</span>
                  </span>
                </>
              )}
            </button>
            <p className="text-xs text-white/40 mt-3 text-center">
              By clicking create, 50 Gold credits will be deducted from your balance.
            </p>
          </div>

        </div>
      </div>

      {/* Right Panel (Output/Results Workspace) */}
      <div className="w-[380px] bg-[#0D0D1A] flex flex-col z-10 border-l border-white/5">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1A1A2E]/50">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            Generated Results
          </h2>
          <span className="text-xs bg-white/10 px-2 py-1 rounded-md text-white/60">
            {results.length} Tracks
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#7C3AED] animate-spin" />
                <div>
                  <h3 className="font-medium text-white mb-1">Composing your masterpiece...</h3>
                  <p className="text-xs text-white/40">Analyzing genre patterns and generating vocals.</p>
                </div>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center opacity-50"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Music className="w-10 h-10 text-white/30" />
                </div>
                <h3 className="font-medium mb-1">No data yet</h3>
                <p className="text-xs max-w-[200px] mx-auto text-white/60">
                  Configure your inputs on the left and hit "Create" to generate music.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {results.map((track) => (
                  <div key={track.id} className="bg-[#1A1A2E] border border-white/10 rounded-xl overflow-hidden shadow-lg group">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-0.5 truncate max-w-[200px]" title={track.title}>{track.title}</h4>
                          <span className="text-[10px] uppercase tracking-wider text-[#7C3AED] font-bold bg-[#7C3AED]/10 px-2 py-0.5 rounded-sm">
                            {track.type}
                          </span>
                        </div>
                        <span className="text-xs text-white/40">{track.duration}</span>
                      </div>
                      
                      <div className="h-12 bg-black/30 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center border border-white/5">
                        {/* Fake Waveform */}
                        <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2 opacity-50">
                           {Array.from({ length: 40 }).map((_, i) => (
                             <div key={i} className="flex-1 bg-[#7C3AED] rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
                           ))}
                        </div>
                        {/* Play overlay button on hover */}
                        <button className="absolute w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-lg">
                          <Play className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Save to Library">
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                          <div className="relative group/dropdown">
                            <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center gap-1" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                            {/* Simple hover dropdown for download options */}
                            <div className="absolute bottom-full left-0 mb-1 w-24 bg-[#2A2A40] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all flex flex-col overflow-hidden">
                              <button className="text-xs text-left px-3 py-2 hover:bg-[#7C3AED] transition-colors">MP3</button>
                              <button className="text-xs text-left px-3 py-2 hover:bg-[#7C3AED] transition-colors">WAV</button>
                              <button className="text-xs text-left px-3 py-2 hover:bg-[#7C3AED] transition-colors border-t border-white/5">FLAC</button>
                            </div>
                          </div>
                        </div>
                        
                        <button className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors px-2 py-1.5 rounded hover:bg-white/5">
                          <RefreshCcw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-lg p-3 flex gap-3 text-sm mt-6">
                  <AlertCircle className="w-5 h-5 text-[#7C3AED] shrink-0" />
                  <p className="text-white/80 text-xs leading-relaxed">
                    Love these results? Save them to your library before navigating away, or generate variations to explore new ideas.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
