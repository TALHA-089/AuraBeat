"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToastStore } from "@/lib/store/toastStore";
import {
  Mic,
  Pause,
  Play,
  Settings2,
  Square,
  User,
  Volume2,
  Wand2,
} from "lucide-react";

export default function CreateSpeechPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [emphasis, setEmphasis] = useState(50);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  function optimizeText(input: string, maxLen: number) {
    return input
      .replace(/\s+$/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.charAt(0).toUpperCase() + line.slice(1))
      .join("\n")
      .slice(0, maxLen);
  }

  function handleOptimizeScript() {
    const optimized = optimizeText(text, 5000);
    setText(optimized);
    addToast({
      variant: "success",
      title: "Script optimized",
      message: "Formatting and spacing have been refined.",
    });
  }

  // Load browser voices
  useEffect(() => {
    function loadVoices() {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        // Filter to English voices first, then all voices
        const enVoices = allVoices.filter((v) => v.lang.startsWith("en"));
        setVoices(enVoices.length > 0 ? enVoices : allVoices);
      }
    }

    loadVoices();
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  function handleGenerate() {
    if (!text.trim()) {
      addToast({
        variant: "error",
        title: "Empty script",
        message: "Please enter some text to synthesize.",
      });
      return;
    }

    if (voices.length === 0) {
      addToast({
        variant: "error",
        title: "No voices available",
        message: "Your browser does not support speech synthesis voices.",
      });
      return;
    }

    // Stop any current speech
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.voice = voices[selectedVoice % voices.length];
    utterance.rate = speed;
    utterance.pitch = pitch;
    // Map emphasis (0-100) to volume (0.3-1.0)
    utterance.volume = 0.3 + (emphasis / 100) * 0.7;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
      addToast({
        variant: "success",
        title: "Speech complete",
        message: "Text-to-speech synthesis finished successfully.",
      });
    };

    utterance.onerror = (e) => {
      // "interrupted" is not a real error, it fires when we call cancel()
      if (e.error === "interrupted" || e.error === "canceled") return;
      setIsSpeaking(false);
      setIsPaused(false);
      addToast({
        variant: "error",
        title: "Speech error",
        message: `Synthesis failed: ${e.error}`,
      });
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    addToast({
      variant: "info",
      title: "Generating speech",
      message: `Using voice "${voices[selectedVoice % voices.length]?.name}" at ${speed.toFixed(1)}x speed.`,
    });
  }

  function handlePauseResume() {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }

  function handlePreviewVoice(voiceIndex: number) {
    stopSpeech();
    const sample = "Hello! This is a preview of my voice.";
    const utterance = new SpeechSynthesisUtterance(sample);
    utterance.voice = voices[voiceIndex % voices.length];
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = 0.3 + (emphasis / 100) * 0.7;
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  // Display name: use browser voice name if available, else index
  function getVoiceDisplayName(index: number): string {
    if (voices[index]) {
      const v = voices[index];
      // Extract a friendly name: "Google US English" -> "Google US English"
      // "Microsoft Zira - English (United States)" -> "Microsoft Zira"
      const name = v.name.split(" - ")[0].split("(")[0].trim();
      return name.length > 16 ? name.slice(0, 15) + "…" : name;
    }
    return `Voice ${index + 1}`;
  }

  const displayVoiceCount = Math.min(voices.length, 21);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Speech
            </h1>
            <p className="text-[#A1A1AA] mt-1">
              Transform text into realistic voiceovers using browser synthesis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Input Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Script */}
              <section className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Script</h2>
                  <button
                    type="button"
                    onClick={handleOptimizeScript}
                    className="text-xs flex items-center gap-1.5 text-[#7C3AED] hover:text-white transition-colors bg-[#7C3AED]/10 px-3 py-1.5 rounded-md"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Optimize Script
                  </button>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to synthesize..."
                  className="w-full h-[300px] bg-[#0D0D1A] border border-[#1E1E3A] rounded-lg p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none transition-all"
                  maxLength={5000}
                />
                <div className="text-right mt-2 text-xs text-[#A1A1AA]">
                  {text.length} / 5000
                </div>
              </section>

              {/* Generate CTA */}
              <div className="flex items-center justify-between bg-[#111128] border border-[#1E1E3A] rounded-xl p-6">
                <div>
                  <h3 className="font-semibold mb-1">
                    {isSpeaking ? "Speaking..." : "Ready to generate?"}
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    {isSpeaking
                      ? `Voice: ${voices[selectedVoice % voices.length]?.name ?? "Default"}`
                      : "Uses browser Web Speech API for synthesis."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <>
                      <button
                        type="button"
                        onClick={handlePauseResume}
                        className="p-3 rounded-lg bg-white/5 border border-[#1E1E3A] text-white hover:bg-white/10 transition-colors"
                        aria-label={isPaused ? "Resume" : "Pause"}
                      >
                        {isPaused ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={stopSpeech}
                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        aria-label="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isSpeaking && !isPaused}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-4 h-4" />
                    {isSpeaking ? "Regenerate" : "Generate Speech"}
                  </button>
                </div>
              </div>
            </div>

            {/* Voice & Parameters Panel */}
            <div className="space-y-6">
              {/* Voice Presets */}
              <section className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6">
                <h2 className="text-sm font-semibold mb-4 text-white/80 flex items-center gap-2">
                  <User className="w-4 h-4" /> Voices
                  <span className="ml-auto text-[10px] text-[#A1A1AA] font-normal">
                    {voices.length} available
                  </span>
                </h2>

                <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-2 mb-4">
                  {Array.from({ length: displayVoiceCount }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedVoice(i)}
                      className={[
                        "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200",
                        selectedVoice === i
                          ? "border-[#7C3AED] shadow-[0_0_15px_-3px_rgba(124,58,237,0.5)]"
                          : "border-transparent hover:border-white/20",
                      ].join(" ")}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(135deg, hsl(${(i * 37) % 360}, 50%, 30%), hsl(${(i * 37 + 60) % 360}, 50%, 20%))`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] font-bold text-white truncate w-full text-left">
                          {getVoiceDisplayName(i)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#A1A1AA] bg-[#0D0D1A] p-3 rounded-lg border border-[#1E1E3A]">
                  <span className="truncate mr-2">
                    {voices[selectedVoice]?.name ?? `Voice ${selectedVoice + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePreviewVoice(selectedVoice)}
                    className="flex items-center gap-1 hover:text-white transition-colors shrink-0"
                    aria-label="Preview voice"
                  >
                    <Volume2 className="w-3 h-3" /> Preview
                  </button>
                </div>
              </section>

              {/* Parameters */}
              <section className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6 space-y-6">
                <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Parameters
                </h2>

                {/* Speed */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Speed</span>
                    <span className="text-[#7C3AED]">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                  />
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>0.5x</span>
                    <span>2.0x</span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Pitch</span>
                    <span className="text-[#7C3AED]">{pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                  />
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>Deep</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Volume / Emphasis */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Volume</span>
                    <span className="text-[#7C3AED]">{emphasis}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={emphasis}
                    onChange={(e) => setEmphasis(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                  />
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>Quiet</span>
                    <span>Loud</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
