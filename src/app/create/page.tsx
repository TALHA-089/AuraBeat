"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/client";
import { useAudioStore } from "@/lib/store/audioStore";
import { useToastStore } from "@/lib/store/toastStore";
import { downloadAudioFromUrl } from "@/lib/audio/download";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  BookmarkPlus,
  CheckCircle2,
  Dices,
  Download,
  Loader2,
  Mic,
  Music,
  Play,
  RefreshCcw,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";

type GenerateResponse =
  | {
    success: true;
    track: { id: string; title: string; audioUrl: string };
  }
  | { error: string; details?: unknown };

type UploadSlot = "reference" | "melody";

type UploadedAudio = {
  file: File;
  localUrl: string;
  storageUrl: string | null;
  uploading: boolean;
  error: string | null;
};

type GeneratePayload = {
  prompt: string;
  styleTag: string;
  isInstrumental: boolean;
  userId: string;
  lyrics?: string;
  vocalGender?: "any" | "male" | "female";
  vocalTone?: string;
  referenceAudioUrl?: string | null;
  melodyAudioUrl?: string | null;
};

const STYLE_TAGS = [
  "Lo-fi",
  "Hip-hop",
  "Pop",
  "Rock",
  "Jazz",
  "Classical",
  "Electronic",
  "Ambient",
  "R&B",
] as const;

const RANDOM_PROMPTS = [
  "Midnight city drive with glowing synths and crisp drums",
  "Warm acoustic guitar with soft percussion and airy pads",
  "Dreamy ambient textures with slow evolving chords",
  "Punchy bassline with tight drum groove and retro keys",
  "Uplifting piano motif with cinematic strings",
  "Dark moody atmosphere with minimal beats and deep reverb",
  "Bright pop energy with catchy hook and sparkling synths",
  "Lo-fi chillhop with vinyl crackle and mellow chords",
  "Neon cyberpunk pulse with arps and driving kick",
];

const RANDOM_TONES = ["warm", "raspy", "clear", "ethereal"] as const;

// Stable waveform bars for result cards
const RESULT_BARS = Array.from({ length: 40 }, () =>
  Math.max(20, Math.random() * 100),
);

export default function CreateMusicPage() {
  const setTrack = useAudioStore((state) => state.setTrack);
  const addToast = useToastStore((state) => state.addToast);

  const [mode, setMode] = useState<"easy" | "custom">("custom");
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [styleTag, setStyleTag] = useState<(typeof STYLE_TAGS)[number]>("Lo-fi");
  const [isInstrumental, setIsInstrumental] = useState(true);
  const [gender, setGender] = useState<"any" | "male" | "female">("any");
  const [tone, setTone] = useState("warm");
  const [activeUploadTab, setActiveUploadTab] = useState<UploadSlot>("reference");
  const [referenceAudio, setReferenceAudio] = useState<UploadedAudio | null>(null);
  const [melodyAudio, setMelodyAudio] = useState<UploadedAudio | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState<UploadSlot>("reference");
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const melodyInputRef = useRef<HTMLInputElement | null>(null);
  const lastPayloadRef = useRef<GeneratePayload | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Staged feedback for AI-Native Interaction Design
  const STAGED_MESSAGES = [
    "Analyzing prompt...",
    "Composing melody...",
    "Arranging instruments...",
    "Mastering audio...",
  ];
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (status !== "loading") {
      setStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGED_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (referenceAudio?.localUrl) URL.revokeObjectURL(referenceAudio.localUrl);
      if (melodyAudio?.localUrl) URL.revokeObjectURL(melodyAudio.localUrl);
    };
  }, [referenceAudio, melodyAudio]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const charCount = prompt.length;
  const isUploading = Boolean(referenceAudio?.uploading || melodyAudio?.uploading);
  const canSubmit = useMemo(() => {
    const p = prompt.trim();
    const needsLyrics = !isInstrumental && mode === "easy";
    const hasLyrics = lyrics.trim().length > 0;
    return (
      p.length > 0 &&
      p.length <= 500 &&
      status !== "loading" &&
      !isUploading &&
      !isRecording &&
      (!needsLyrics || hasLyrics)
    );
  }, [prompt, status, isUploading, isRecording, isInstrumental, mode, lyrics]);

  useEffect(() => {
    if (prompt.length > 500) setPrompt((p) => p.slice(0, 500));
  }, [prompt.length]);

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

  function handleOptimizeLyrics() {
    const optimized = optimizeText(lyrics, 3000);
    setLyrics(optimized);
    addToast({
      variant: "success",
      title: "Lyrics optimized",
      message: "Formatting and spacing have been refined.",
    });
  }

  function handleRandomize() {
    const promptSample =
      RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    const styleSample =
      STYLE_TAGS[Math.floor(Math.random() * STYLE_TAGS.length)];
    const toneSample =
      RANDOM_TONES[Math.floor(Math.random() * RANDOM_TONES.length)];
    const genderSample = ["any", "male", "female"][
      Math.floor(Math.random() * 3)
    ] as "any" | "male" | "female";

    setPrompt(promptSample);
    setStyleTag(styleSample);
    setTone(toneSample);
    setGender(genderSample);
    setIsInstrumental(Math.random() > 0.4);
  }

  function getSlotAudio(slot: UploadSlot) {
    return slot === "reference" ? referenceAudio : melodyAudio;
  }

  function setSlotAudio(slot: UploadSlot, next: UploadedAudio | null) {
    if (slot === "reference") {
      setReferenceAudio(next);
    } else {
      setMelodyAudio(next);
    }
  }

  async function uploadAudioFile(file: File, slot: UploadSlot) {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Please sign in to upload audio.");
    }

    const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "_");
    const path = `${slot}/${user.id}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("tracks")
      .upload(path, file, {
        contentType: file.type || "audio/webm",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message || "Upload failed");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("tracks").getPublicUrl(path);

    return publicUrl;
  }

  async function handleFileSelected(file: File, slot: UploadSlot) {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        variant: "error",
        title: "File too large",
        message: "Please select a file under 50MB.",
      });
      return;
    }

    if (!file.type.startsWith("audio/")) {
      addToast({
        variant: "error",
        title: "Invalid file",
        message: "Please select a valid audio file.",
      });
      return;
    }

    const existing = getSlotAudio(slot);
    if (existing?.localUrl) {
      URL.revokeObjectURL(existing.localUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setSlotAudio(slot, {
      file,
      localUrl,
      storageUrl: null,
      uploading: true,
      error: null,
    });

    try {
      const storageUrl = await uploadAudioFile(file, slot);
      setSlotAudio(slot, {
        file,
        localUrl,
        storageUrl,
        uploading: false,
        error: null,
      });
      addToast({
        variant: "success",
        title: "Audio uploaded",
        message: "Reference audio is ready.",
      });
    } catch (err) {
      setSlotAudio(slot, {
        file,
        localUrl,
        storageUrl: null,
        uploading: false,
        error: err instanceof Error ? err.message : "Upload failed",
      });
      addToast({
        variant: "error",
        title: "Upload failed",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, slot: UploadSlot) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file, slot);
    }
  }

  async function startRecording(slot: UploadSlot) {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: blob.type,
        });
        setIsRecording(false);
        handleFileSelected(file, slot);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingTarget(slot);
      setIsRecording(true);
    } catch {
      addToast({
        variant: "error",
        title: "Microphone blocked",
        message: "Please allow microphone access to record.",
      });
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }

  function clearAudio(slot: UploadSlot) {
    const existing = getSlotAudio(slot);
    if (existing?.localUrl) {
      URL.revokeObjectURL(existing.localUrl);
    }
    setSlotAudio(slot, null);
  }

  function buildPayload(userId: string): GeneratePayload {
    return {
      prompt: prompt.trim(),
      styleTag,
      isInstrumental,
      userId,
      lyrics: isInstrumental ? "" : lyrics.trim(),
      vocalGender: gender,
      vocalTone: tone,
      referenceAudioUrl: referenceAudio?.storageUrl ?? null,
      melodyAudioUrl: melodyAudio?.storageUrl ?? null,
    };
  }

  async function generateTrack(payload: GeneratePayload) {
    setError(null);
    setTrackId(null);
    setTrackTitle(null);
    setAudioUrl(null);
    setIsSaved(false);
    setStatus("loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as GenerateResponse;

      if (!res.ok) {
        if ("error" in json && json.error === "INSUFFICIENT_CREDITS") {
          setError("Not enough Gold credits!");
          addToast({
            variant: "error",
            title: "Not enough Gold",
            message: "You need at least 10 Gold to generate a track.",
          });
        } else {
          setError("Generation failed, please try again");
          addToast({
            variant: "error",
            title: "Generation failed",
            message: "Please check the AI server and try again.",
          });
        }
        setStatus("idle");
        return;
      }

      if ("success" in json && json.success) {
        lastPayloadRef.current = payload;
        setTrackId(json.track.id);
        setTrackTitle(json.track.title);
        setAudioUrl(json.track.audioUrl);
        setTrack({
          id: json.track.id,
          title: json.track.title,
          audioUrl: json.track.audioUrl,
        });
        addToast({
          variant: "success",
          title: "Track generated",
          message: "Your new track is ready and loaded into the player.",
        });
        setStatus("done");
        return;
      }

      setError("Generation failed, please try again");
      setStatus("idle");
    } catch {
      setError("Generation failed, please try again");
      addToast({
        variant: "error",
        title: "Generation failed",
        message: "Please check the AI server and try again.",
      });
      setStatus("idle");
    }
  }

  async function handleRegenerate() {
    const payload = lastPayloadRef.current;
    if (!payload) {
      addToast({
        variant: "error",
        title: "Nothing to regenerate",
        message: "Generate a track first.",
      });
      return;
    }

    await generateTrack(payload);
  }

  async function handleSaveToLibrary() {
    if (!trackId) return;
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("tracks")
        .update({ status: "saved" })
        .eq("id", trackId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setIsSaved(true);
      addToast({
        variant: "success",
        title: "Saved to library",
        message: "The track is now available in your library.",
      });
    } catch (err) {
      addToast({
        variant: "error",
        title: "Save failed",
        message: err instanceof Error ? err.message : "Could not save track.",
      });
    }
  }

  async function handleDownload(format: "mp3" | "wav") {
    if (!audioUrl || !trackTitle) return;
    try {
      await downloadAudioFromUrl(audioUrl, trackTitle, format);
      addToast({
        variant: "success",
        title: "Download started",
        message: `Downloading ${trackTitle}.${format}`,
      });
    } catch {
      addToast({
        variant: "error",
        title: "Download failed",
        message: "Could not download this track.",
      });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please sign in first.");
        setStatus("idle");
        return;
      }

      const payload = buildPayload(user.id);
      await generateTrack(payload);
    } catch {
      setError("Generation failed, please try again");
      addToast({
        variant: "error",
        title: "Generation failed",
        message: "Please check the AI server and try again.",
      });
      setStatus("idle");
    }
  }

  const resultBars = useMemo(() => RESULT_BARS, []);
  const activeAudio = getSlotAudio(activeUploadTab);
  const isActiveRecording = isRecording && recordingTarget === activeUploadTab;

  return (
    <AppLayout>
      <div className="flex-1 flex overflow-hidden">
        {/* ═══ Left Panel — Input Workspace ═══ */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-white/5 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Header with mode toggle */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Create Music</h1>
              <div className="bg-[#1A1A2E] p-1 rounded-lg flex border border-white/5">
                <button
                  type="button"
                  onClick={() => setMode("easy")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "easy"
                    ? "bg-[#7C3AED] text-white"
                    : "text-white/50 hover:text-white"
                    }`}
                >
                  Easy
                </button>
                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "custom"
                    ? "bg-[#7C3AED] text-white"
                    : "text-white/50 hover:text-white"
                    }`}
                >
                  Custom
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              {/* ── Lyrics & Vocals ── */}
              <section className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Lyrics & Vocals
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">Instrumental</span>
                    <button
                      type="button"
                      onClick={() => setIsInstrumental(!isInstrumental)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${isInstrumental ? "bg-[#7C3AED]" : "bg-white/10"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isInstrumental ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    disabled={isInstrumental}
                    placeholder={
                      isInstrumental
                        ? "Instrumental mode — lyrics disabled."
                        : "Write your lyrics here..."
                    }
                    className="w-full h-40 bg-[#0D0D1A] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none transition-all disabled:opacity-50"
                    maxLength={3000}
                  />
                  {!isInstrumental && (
                    <button
                      type="button"
                      onClick={handleOptimizeLyrics}
                      className="absolute bottom-4 right-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                      Optimize with AI
                    </button>
                  )}
                </div>
                <div className="text-right mt-2 text-xs text-white/30">
                  {lyrics.length} / 3000
                </div>
              </section>

              {/* ── Style & Genre ── */}
              <section className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6 shadow-xl focus-within:border-[#7C3AED] transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Style & Genre</h2>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                    title="Randomize"
                  >
                    <Dices className="w-5 h-5" />
                  </button>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the musical style, instruments, and vibe... e.g. Upbeat synthwave with a driving bassline and ethereal pads"
                  className="w-full h-24 bg-[#0D0D1A] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none transition-all mb-1"
                  maxLength={500}
                />
                <div className="text-right mb-4 text-xs text-white/30">
                  {charCount} / 500
                </div>

                <div className="flex flex-wrap gap-2">
                  {STYLE_TAGS.map((tag) => {
                    const selected = styleTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setStyleTag(tag)}
                        className={[
                          "px-4 py-1.5 rounded-full border text-xs font-medium transition-colors",
                          selected
                            ? "border-[#7C3AED]/50 bg-[#7C3AED]/20 text-white"
                            : "border-[#7C3AED]/30 bg-[#7C3AED]/5 text-white/70 hover:bg-[#7C3AED]/15 hover:text-white",
                        ].join(" ")}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Advanced Parameters (Progressive Disclosure) ── */}
              {mode === "custom" && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#111128] border border-[#1E1E3A] rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white hover:border-white/20 transition-all duration-200"
                  >
                    <span>Advanced Parameters</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showAdvanced && (
                    <>
                      <section className="grid grid-cols-2 gap-6">
                        <div className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6">
                          <h2 className="text-sm font-semibold mb-4 text-white/80">
                            Vocal Gender
                          </h2>
                          <div className="flex gap-2 p-1 bg-[#0D0D1A] rounded-lg border border-white/5">
                            {(["any", "male", "female"] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`flex-1 py-2 text-xs font-medium rounded-md capitalize transition-colors ${gender === g
                                  ? "bg-[#2A2A40] text-white shadow-sm"
                                  : "text-white/50 hover:text-white"
                                  }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6">
                          <h2 className="text-sm font-semibold mb-4 text-white/80">
                            Tone Presets
                          </h2>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors appearance-none"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 0.75rem center",
                              backgroundSize: "1rem",
                            }}
                          >
                            <option value="warm">Warm & Intimate</option>
                            <option value="raspy">Raspy & Edgy</option>
                            <option value="clear">Clear & Pop</option>
                            <option value="ethereal">Ethereal & Reverb</option>
                          </select>
                        </div>
                      </section>

                      {/* ── Reference Audio Upload ── */}
                      <section className="bg-[#111128] border border-[#1E1E3A] rounded-xl p-6">
                        <div className="flex border-b border-white/10 mb-6">
                          <button
                            type="button"
                            onClick={() => setActiveUploadTab("reference")}
                            className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${activeUploadTab === "reference"
                              ? "border-[#7C3AED] text-white"
                              : "border-transparent text-white/50 hover:text-white"
                              }`}
                          >
                            + Reference Audio
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveUploadTab("melody")}
                            className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${activeUploadTab === "melody"
                              ? "border-[#7C3AED] text-white"
                              : "border-transparent text-white/50 hover:text-white"
                              }`}
                          >
                            + Vocal/Melody Ideas
                          </button>
                        </div>

                        <input
                          ref={referenceInputRef}
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleFileSelected(file, "reference");
                            event.currentTarget.value = "";
                          }}
                        />
                        <input
                          ref={melodyInputRef}
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleFileSelected(file, "melody");
                            event.currentTarget.value = "";
                          }}
                        />

                        <div
                          className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/5 transition-all cursor-pointer group"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => handleDrop(event, activeUploadTab)}
                          onClick={() => {
                            if (activeUploadTab === "reference") {
                              referenceInputRef.current?.click();
                            } else {
                              melodyInputRef.current?.click();
                            }
                          }}
                        >
                          {activeAudio ? (
                            <div
                              className="w-full space-y-3"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-left">
                                  <p className="text-sm font-medium truncate">
                                    {activeAudio.file.name}
                                  </p>
                                  <p className="text-xs text-white/50">
                                    {activeAudio.uploading
                                      ? "Uploading..."
                                      : activeAudio.error
                                        ? activeAudio.error
                                        : "Ready"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      clearAudio(activeUploadTab);
                                    }}
                                    className="px-3 py-1.5 text-xs rounded-md bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                  >
                                    Remove
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (activeUploadTab === "reference") {
                                        referenceInputRef.current?.click();
                                      } else {
                                        melodyInputRef.current?.click();
                                      }
                                    }}
                                    className="px-3 py-1.5 text-xs rounded-md bg-[#7C3AED]/20 text-[#C4B5FD] hover:bg-[#7C3AED]/30 transition-colors"
                                  >
                                    Replace
                                  </button>
                                </div>
                              </div>
                              <audio controls className="w-full" src={activeAudio.localUrl} />
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/20 transition-colors">
                                <Upload className="w-6 h-6 text-white/50 group-hover:text-[#7C3AED]" />
                              </div>
                              <h3 className="text-sm font-medium mb-1">
                                Drag & drop your audio file
                              </h3>
                              <p className="text-xs text-white/40 mb-4">
                                WAV, MP3, or FLAC up to 50MB
                              </p>

                              <div className="flex items-center gap-3 w-full max-w-xs">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-xs text-white/30 uppercase">
                                  or record directly
                                </span>
                                <div className="h-px flex-1 bg-white/10" />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-white/40">
                            {isActiveRecording
                              ? `Recording... ${recordingTime}s`
                              : "Record with your microphone"}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              isActiveRecording
                                ? stopRecording()
                                : startRecording(activeUploadTab)
                            }
                            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm transition-all ${isActiveRecording
                              ? "bg-red-500/10 border-red-500/20 text-red-300"
                              : "bg-[#0D0D1A] border-white/10 text-white/80 hover:text-white hover:border-white/30"
                              }`}
                          >
                            <Mic className="w-4 h-4 text-red-400" />
                            {isActiveRecording ? "Stop Recording" : "Start Recording"}
                          </button>
                        </div>
                      </section>
                    </>
                  )}
                </>
              )}

              {/* Error */}
              {error ? (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              {/* ── Validation & CTA ── */}
              <div className="pt-4 flex flex-col items-center">
                {lyrics.length === 0 && !isInstrumental && mode === "easy" && (
                  <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                    <AlertCircle className="w-4 h-4" />
                    Please enter lyrics or enable instrumental mode.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-12 py-4 font-bold text-lg shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-10px_rgba(124,58,237,0.7)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-md flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5" />
                      Create Track
                      <span className="ml-2 text-xs font-normal bg-black/20 px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                        -10 <span className="text-yellow-400">●</span>
                      </span>
                    </>
                  )}
                </button>
                <div className="text-xs text-white/40 mt-3 text-center space-y-1">
                  <p>By clicking create, 10 Gold credits will be deducted.</p>
                  <p>All tracks are generated by AI and must adhere to community guidelines.</p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ═══ Right Panel — Results ═══ */}
        <div className="w-[380px] bg-[#0D0D1A] flex flex-col z-10 border-l border-[#1E1E3A] shrink-0">
          <div className="p-4 border-b border-[#1E1E3A] flex items-center justify-between bg-[#111128]/50 shrink-0">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              Generated Results
            </h2>
            <span className="text-xs bg-white/10 px-2 py-1 rounded-md text-white/60">
              {status === "done" ? "1 Track" : "0 Tracks"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-6"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-[#1E1E3A] border-t-[#7C3AED] animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#7C3AED] animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <motion.h3
                      key={stageIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="font-medium text-white mb-1"
                    >
                      {STAGED_MESSAGES[stageIndex]}
                    </motion.h3>
                    <p className="text-xs text-[#A1A1AA]">
                      This may take 30-60 seconds.
                    </p>
                  </div>
                  {/* Stage indicators */}
                  <div className="flex items-center gap-2">
                    {STAGED_MESSAGES.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i <= stageIndex ? "bg-[#7C3AED]" : "bg-[#1E1E3A]"
                          }`}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : status === "done" && trackTitle ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-[#1A1A2E] border border-white/10 rounded-xl overflow-hidden shadow-lg group">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4
                            className="font-semibold text-sm mb-0.5 truncate max-w-[200px]"
                            title={trackTitle}
                          >
                            {trackTitle}
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider text-[#7C3AED] font-bold bg-[#7C3AED]/10 px-2 py-0.5 rounded-sm">
                            Main
                          </span>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      </div>

                      {/* Waveform */}
                      <div className="h-12 bg-black/30 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center border border-white/5">
                        <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2 opacity-50">
                          {resultBars.map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-[#7C3AED] rounded-full"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (audioUrl && trackId) {
                              setTrack({
                                id: trackId,
                                title: trackTitle ?? "Your Track",
                                audioUrl,
                              });
                            }
                          }}
                          className="absolute w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-lg z-10"
                        >
                          <Play className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveToLibrary}
                            disabled={!trackId || isSaved}
                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40"
                            title="Save to Library"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                          <div className="relative group/dropdown">
                            <button
                              type="button"
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center gap-1"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-full left-0 mb-1 w-24 bg-[#2A2A40] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all flex flex-col overflow-hidden z-20">
                              <button
                                type="button"
                                onClick={() => handleDownload("mp3")}
                                className="text-xs text-left px-3 py-2 hover:bg-[#7C3AED] transition-colors"
                              >
                                MP3
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload("wav")}
                                className="text-xs text-left px-3 py-2 hover:bg-[#7C3AED] transition-colors"
                              >
                                WAV
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRegenerate}
                          disabled={(status as "idle" | "loading" | "done") === "loading"}
                          className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors px-2 py-1.5 rounded hover:bg-white/5"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-lg p-3 flex gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 text-[#7C3AED] shrink-0" />
                    <p className="text-white/80 text-xs leading-relaxed">
                      Love the results? Save to your library before navigating
                      away, or regenerate to explore new ideas.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center opacity-50"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-10 h-10 text-white/30" />
                  </div>
                  <h3 className="font-medium mb-1">No data yet</h3>
                  <p className="text-xs max-w-[200px] mx-auto text-white/60">
                    Configure your inputs on the left and hit &quot;Create&quot;
                    to generate music.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
