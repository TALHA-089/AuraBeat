"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/lib/store/audioStore";
import { useToastStore } from "@/lib/store/toastStore";
import {
  Activity,
  Layers,
  Link as LinkIcon,
  Maximize,
  Pause,
  Play,
  Redo2,
  RotateCcw,
  Scissors,
  SkipBack,
  SkipForward,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type TrackItem = {
  id: string;
  title: string | null;
  audio_url: string | null;
};

type EditorClientProps = {
  tracks: TrackItem[];
};

const STEM_LABELS = [
  { name: "Full Mix", color: "bg-[#7C3AED]", colorHex: "#7C3AED" },
  { name: "Low Freq", color: "bg-emerald-500", colorHex: "#10b981" },
  { name: "Mid Freq", color: "bg-blue-500", colorHex: "#3b82f6" },
  { name: "High Freq", color: "bg-orange-500", colorHex: "#f97316" },
] as const;

function ToolButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30"
          : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent",
      ].join(" ")}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function StemTrack({
  name,
  color,
  bars,
  muted,
  soloed,
  onToggleMute,
  onToggleSolo,
  playbackProgress,
}: {
  name: string;
  color: string;
  bars: number[];
  muted: boolean;
  soloed: boolean;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  playbackProgress: number;
}) {
  return (
    <div className="h-24 bg-[#0D0D1A] rounded-lg border border-[#1E1E3A] flex overflow-hidden group relative">
      <div className="w-32 bg-[#111128] border-r border-[#1E1E3A] flex flex-col justify-center px-4 shrink-0">
        <h4 className="text-sm font-semibold mb-1">{name}</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMute();
            }}
            className={[
              "text-[10px] uppercase font-bold transition-colors px-2 py-0.5 rounded",
              muted
                ? "bg-red-500/20 text-red-400"
                : "bg-white/5 text-white/40 hover:text-white",
            ].join(" ")}
          >
            M
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleSolo();
            }}
            className={[
              "text-[10px] uppercase font-bold transition-colors px-2 py-0.5 rounded",
              soloed
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-white/5 text-white/40 hover:text-white",
            ].join(" ")}
          >
            S
          </button>
        </div>
      </div>
      <div className="flex-1 relative flex items-center px-2">
        <div
          className={[
            "absolute inset-y-4 left-4 right-10 bg-white/5 rounded overflow-hidden flex items-center gap-[1px] px-1 transition-opacity",
            muted ? "opacity-20" : "opacity-100",
          ].join(" ")}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 ${color} opacity-80`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        {/* Playhead overlay per track */}
        {playbackProgress > 0 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
            style={{ left: `calc(${8 * 16}px + ${playbackProgress}% * (100% - ${8 * 16}px) / 100)` }}
          />
        )}
      </div>
    </div>
  );
}

export function EditorClient({ tracks }: EditorClientProps) {
  const setTrack = useAudioStore((s) => s.setTrack);
  const addToast = useToastStore((s) => s.addToast);

  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? null);
  const [activeTool, setActiveTool] = useState("stem");
  const [tempo, setTempo] = useState(120);
  const [keyShift, setKeyShift] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  // Audio state
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const gainNodesRef = useRef<GainNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const undoStackRef = useRef<AudioBuffer[]>([]);
  const redoStackRef = useRef<AudioBuffer[]>([]);
  const clipboardRef = useRef<AudioBuffer | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditorPlaying, setIsEditorPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  // Mute/Solo state per stem
  const [mutedStems, setMutedStems] = useState([false, false, false, false]);
  const [soloedStems, setSoloedStems] = useState([false, false, false, false]);
  const baseGain = 1 / STEM_LABELS.length;

  const [stemBars, setStemBars] = useState<number[][]>(() =>
    STEM_LABELS.map(() =>
      Array.from({ length: 150 }, () => Math.max(10, Math.random() * 100)),
    ),
  );

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const trackTitle = selectedTrack?.title?.trim() || "No track selected";
  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      // Create gain nodes for each "stem"
      const ctx = audioContextRef.current;
      const gains = STEM_LABELS.map(() => {
        const gain = ctx.createGain();
        gain.gain.value = 1 / STEM_LABELS.length;
        gain.connect(ctx.destination);
        return gain;
      });
      gainNodesRef.current = gains;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    }
    return audioContextRef.current;
  }, []);

  function cloneAudioBuffer(buffer: AudioBuffer) {
    const ctx = getAudioContext();
    const clone = ctx.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate,
    );
    for (let c = 0; c < buffer.numberOfChannels; c += 1) {
      clone.copyToChannel(buffer.getChannelData(c), c);
    }
    return clone;
  }

  function sliceAudioBuffer(buffer: AudioBuffer, startSec: number, endSec: number) {
    const ctx = getAudioContext();
    const start = Math.max(0, Math.floor(startSec * buffer.sampleRate));
    const end = Math.min(buffer.length, Math.floor(endSec * buffer.sampleRate));
    const length = Math.max(0, end - start);
    const slice = ctx.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
    for (let c = 0; c < buffer.numberOfChannels; c += 1) {
      const channel = buffer.getChannelData(c).slice(start, end);
      slice.copyToChannel(channel, c);
    }
    return slice;
  }

  function concatAudioBuffers(buffers: AudioBuffer[]) {
    if (buffers.length === 0) return null;
    const ctx = getAudioContext();
    const sampleRate = buffers[0].sampleRate;
    const channels = buffers[0].numberOfChannels;
    const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
    const merged = ctx.createBuffer(channels, totalLength, sampleRate);
    let offset = 0;

    buffers.forEach((buffer) => {
      for (let c = 0; c < channels; c += 1) {
        merged.copyToChannel(buffer.getChannelData(c), c, offset);
      }
      offset += buffer.length;
    });

    return merged;
  }

  function remixAudioBuffer(buffer: AudioBuffer, slices = 4) {
    const sliceSize = Math.floor(buffer.length / slices);
    const segments: AudioBuffer[] = [];
    for (let i = 0; i < slices; i += 1) {
      const start = i * sliceSize;
      const end = i === slices - 1 ? buffer.length : start + sliceSize;
      segments.push(sliceAudioBuffer(buffer, start / buffer.sampleRate, end / buffer.sampleRate));
    }
    for (let i = segments.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [segments[i], segments[j]] = [segments[j], segments[i]];
    }
    return concatAudioBuffers(segments);
  }

  function updateWaveformBars(buffer: AudioBuffer) {
    const barsCount = Math.max(60, Math.floor(150 * zoom));
    const channel = buffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channel.length / barsCount));
    const bars = Array.from({ length: barsCount }, (_, i) => {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channel.length);
      let max = 0;
      for (let j = start; j < end; j += 1) {
        const value = Math.abs(channel[j]);
        if (value > max) max = value;
      }
      return Math.max(10, Math.floor(max * 100));
    });

    setStemBars(STEM_LABELS.map(() => bars));
  }

  // Load audio buffer from URL
  async function handleLoadTrack() {
    if (!selectedTrack?.audio_url) {
      addToast({
        variant: "error",
        title: "No audio",
        message: "This track has no audio file.",
      });
      return;
    }

    // Stop any current playback
    handleStop();

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      addToast({
        variant: "info",
        title: "Loading audio",
        message: `Decoding "${selectedTrack.title ?? "Untitled"}"...`,
      });

      const response = await fetch(selectedTrack.audio_url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      audioBufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      setIsLoaded(true);
      setPlaybackProgress(0);
      pauseOffsetRef.current = 0;
      undoStackRef.current = [];
      redoStackRef.current = [];
      clipboardRef.current = null;
      setSelectionStart(null);
      setSelectionEnd(null);
      setMutedStems([false, false, false, false]);
      setSoloedStems([false, false, false, false]);
      applyStemGains([false, false, false, false], [false, false, false, false]);
      updateWaveformBars(audioBuffer);

      // Also load into the global player
      setTrack({
        id: selectedTrack.id,
        title: selectedTrack.title ?? "Untitled",
        audioUrl: selectedTrack.audio_url,
      });

      addToast({
        variant: "success",
        title: "Track loaded",
        message: `"${selectedTrack.title ?? "Untitled"}" is ready for editing.`,
      });
    } catch {
      addToast({
        variant: "error",
        title: "Load failed",
        message: "Could not decode audio. The file may be corrupted.",
      });
    }
  }

  // Playback animation loop
  const animatePlayhead = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !audioBufferRef.current) return;

    const elapsed = ctx.currentTime - startTimeRef.current + pauseOffsetRef.current;
    const dur = audioBufferRef.current.duration;
    const progress = Math.min((elapsed / dur) * 100, 100);
    setPlaybackProgress(progress);

    if (progress >= 100) {
      setIsEditorPlaying(false);
      setPlaybackProgress(0);
      pauseOffsetRef.current = 0;
      return;
    }

    animFrameRef.current = requestAnimationFrame(animatePlayhead);
  }, []);

  function handlePlay() {
    const ctx = audioContextRef.current;
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Create a new source each time (Web Audio API requirement)
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = tempo / 120;
    source.detune.value = keyShift * 100;

    if (loopEnabled) {
      const start = selectionStart ?? 0;
      const end = selectionEnd ?? buffer.duration;
      if (end > start) {
        source.loop = true;
        source.loopStart = start;
        source.loopEnd = end;
      }
    }

    if (gainNodesRef.current.length > 0) {
      gainNodesRef.current.forEach((gain) => source.connect(gain));
    } else {
      source.connect(ctx.destination);
    }

    source.onended = () => {
      setIsEditorPlaying(false);
      setPlaybackProgress(0);
      pauseOffsetRef.current = 0;
    };

    const offset = pauseOffsetRef.current;
    source.start(0, offset);
    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime;
    setIsEditorPlaying(true);

    // Start animation
    animFrameRef.current = requestAnimationFrame(animatePlayhead);
  }

  function handlePause() {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Calculate how far we got
    const elapsed = ctx.currentTime - startTimeRef.current + pauseOffsetRef.current;
    pauseOffsetRef.current = elapsed;

    sourceNodeRef.current?.stop();
    sourceNodeRef.current = null;
    setIsEditorPlaying(false);
    cancelAnimationFrame(animFrameRef.current);
  }

  function handleStop() {
    sourceNodeRef.current?.stop();
    sourceNodeRef.current = null;
    setIsEditorPlaying(false);
    setPlaybackProgress(0);
    pauseOffsetRef.current = 0;
    cancelAnimationFrame(animFrameRef.current);
  }

  function pushUndoSnapshot() {
    const buffer = audioBufferRef.current;
    if (!buffer) return;
    undoStackRef.current.push(cloneAudioBuffer(buffer));
    if (undoStackRef.current.length > 20) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setHistoryVersion((v) => v + 1);
  }

  function applyAudioBuffer(nextBuffer: AudioBuffer) {
    handleStop();
    audioBufferRef.current = nextBuffer;
    setDuration(nextBuffer.duration);
    setIsLoaded(true);
    setPlaybackProgress(0);
    pauseOffsetRef.current = 0;
    updateWaveformBars(nextBuffer);
  }

  function handleUndo() {
    const buffer = audioBufferRef.current;
    const previous = undoStackRef.current.pop();
    if (!buffer || !previous) return;
    redoStackRef.current.push(cloneAudioBuffer(buffer));
    applyAudioBuffer(previous);
    setHistoryVersion((v) => v + 1);
  }

  function handleRedo() {
    const buffer = audioBufferRef.current;
    const next = redoStackRef.current.pop();
    if (!buffer || !next) return;
    undoStackRef.current.push(cloneAudioBuffer(buffer));
    applyAudioBuffer(next);
    setHistoryVersion((v) => v + 1);
  }

  function handlePlayPause() {
    if (isEditorPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }

  function applyStemGains(muted: boolean[], soloed: boolean[]) {
    const anySoloed = soloed.some((s) => s);
    gainNodesRef.current.forEach((gain, i) => {
      if (anySoloed) {
        gain.gain.value = soloed[i] && !muted[i] ? 1 : 0;
      } else {
        gain.gain.value = muted[i] ? 0 : baseGain;
      }
    });
  }

  // Mute/Solo logic
  function toggleMute(index: number) {
    setMutedStems((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      applyStemGains(next, soloedStems);
      return next;
    });
  }

  function toggleSolo(index: number) {
    setSoloedStems((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      applyStemGains(mutedStems, next);
      return next;
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      sourceNodeRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const buffer = audioBufferRef.current;
    if (buffer) {
      updateWaveformBars(buffer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, historyVersion, isLoaded]);

  useEffect(() => {
    if (isEditorPlaying) {
      handlePause();
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, keyShift, loopEnabled, isEditorPlaying]);

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function getSelectionRange() {
    if (selectionStart === null || selectionEnd === null) return null;
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return null;
    }
    return { start, end };
  }

  function handleSetIn() {
    if (!audioBufferRef.current) return;
    setSelectionStart(currentTime);
    if (selectionEnd !== null && selectionEnd < currentTime) {
      setSelectionEnd(currentTime);
    }
  }

  function handleSetOut() {
    if (!audioBufferRef.current) return;
    setSelectionEnd(currentTime);
    if (selectionStart !== null && selectionStart > currentTime) {
      setSelectionStart(currentTime);
    }
  }

  function handleClearSelection() {
    setSelectionStart(null);
    setSelectionEnd(null);
  }

  function seekTo(timeSec: number) {
    if (!audioBufferRef.current || duration <= 0) return;
    const nextTime = Math.max(0, Math.min(timeSec, duration));
    pauseOffsetRef.current = nextTime;
    setPlaybackProgress((nextTime / duration) * 100);

    if (isEditorPlaying) {
      handlePause();
      handlePlay();
    }
  }

  function handleWaveformClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!isLoaded || duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    seekTo(duration * percent);
  }

  function handleSkip(seconds: number) {
    if (!audioBufferRef.current) return;
    seekTo(currentTime + seconds);
  }

  function handleSplit() {
    const buffer = audioBufferRef.current;
    if (!buffer) return;

    const selection = getSelectionRange();
    if (selection) {
      pushUndoSnapshot();
      const before = selection.start > 0 ? sliceAudioBuffer(buffer, 0, selection.start) : null;
      const after = selection.end < duration ? sliceAudioBuffer(buffer, selection.end, duration) : null;
      clipboardRef.current = sliceAudioBuffer(buffer, selection.start, selection.end);
      const merged = concatAudioBuffers([before, after].filter(Boolean) as AudioBuffer[]);
      if (merged) {
        applyAudioBuffer(merged);
        addToast({
          variant: "success",
          title: "Section removed",
          message: "Selection removed and copied to clipboard.",
        });
      }
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    if (currentTime <= 0 || currentTime >= duration) {
      addToast({
        variant: "error",
        title: "Split not possible",
        message: "Move the playhead inside the track before splitting.",
      });
      return;
    }

    pushUndoSnapshot();
    const left = sliceAudioBuffer(buffer, 0, currentTime);
    const right = sliceAudioBuffer(buffer, currentTime, duration);
    clipboardRef.current = right;
    applyAudioBuffer(left);
    addToast({
      variant: "success",
      title: "Split created",
      message: "Right side copied to clipboard.",
    });
    setSelectionStart(null);
    setSelectionEnd(null);
  }

  function handleMerge() {
    const buffer = audioBufferRef.current;
    if (!buffer) return;
    const selection = getSelectionRange();

    let appendBuffer = clipboardRef.current;
    if (!appendBuffer && selection) {
      appendBuffer = sliceAudioBuffer(buffer, selection.start, selection.end);
    }

    if (!appendBuffer) {
      addToast({
        variant: "error",
        title: "Nothing to merge",
        message: "Create a split or selection first.",
      });
      return;
    }

    pushUndoSnapshot();
    const merged = concatAudioBuffers([buffer, appendBuffer]);
    if (merged) {
      applyAudioBuffer(merged);
      addToast({
        variant: "success",
        title: "Merge complete",
        message: "Segment appended to the end of the track.",
      });
    }
    setSelectionStart(null);
    setSelectionEnd(null);
  }

  function handleRemix() {
    const buffer = audioBufferRef.current;
    if (!buffer) return;
    pushUndoSnapshot();
    const remixed = remixAudioBuffer(buffer, 4);
    if (remixed) {
      applyAudioBuffer(remixed);
      addToast({
        variant: "success",
        title: "Remix generated",
        message: "The track has been remixed with shuffled sections.",
      });
    }
  }

  function handleToggleLoop() {
    setLoopEnabled((prev) => !prev);
    if (!loopEnabled) {
      addToast({
        variant: "info",
        title: "Loop enabled",
        message: "Playback will loop the selection or full track.",
      });
    }
  }

  const currentTime = duration * (playbackProgress / 100);
  const selectionRange = getSelectionRange();
  const selectionStartPct =
    selectionRange && duration > 0
      ? (selectionRange.start / duration) * 100
      : 0;
  const selectionWidthPct =
    selectionRange && duration > 0
      ? ((selectionRange.end - selectionRange.start) / duration) * 100
      : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0D0D1A]">
      {/* Header */}
      <div className="p-6 border-b border-[#1E1E3A] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Music Editor
              </h1>
              <p className="text-sm text-[#A1A1AA]">
                Editing: {trackTitle}
                {isLoaded && (
                  <span className="ml-2 text-emerald-400 text-xs">● Loaded</span>
                )}
              </p>
            </div>

            {/* Track selector */}
            {tracks.length > 0 && (
              <select
                value={selectedTrackId ?? ""}
                onChange={(e) => {
                  setSelectedTrackId(e.target.value);
                  setIsLoaded(false);
                  handleStop();
                }}
                className="bg-[#111128] border border-[#1E1E3A] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title?.trim() || "Untitled Track"}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleLoadTrack}
              className="px-3 py-2 text-xs font-medium bg-[#7C3AED]/20 text-[#7C3AED] rounded-lg hover:bg-[#7C3AED]/30 transition-colors border border-[#7C3AED]/30"
            >
              Load in Editor
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#111128] p-1 rounded-lg border border-[#1E1E3A]">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#1E1E3A]" />
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-[#111128] p-2 rounded-xl border border-[#1E1E3A]">
          <div className="flex items-center gap-1">
            <ToolButton
              icon={<Scissors className="w-4 h-4" />}
              label="Split"
              active={activeTool === "split"}
              onClick={() => {
                setActiveTool("split");
                handleSplit();
              }}
            />
            <ToolButton
              icon={<Layers className="w-4 h-4" />}
              label="Remix"
              active={activeTool === "remix"}
              onClick={() => {
                setActiveTool("remix");
                handleRemix();
              }}
            />
            <div className="w-px h-6 bg-[#1E1E3A] mx-2" />
            <ToolButton
              icon={<Activity className="w-4 h-4" />}
              label="Stem Separation"
              active={activeTool === "stem"}
              onClick={() => setActiveTool("stem")}
            />
            <div className="w-px h-6 bg-[#1E1E3A] mx-2" />
            <ToolButton
              icon={<RotateCcw className="w-4 h-4" />}
              label="Loop"
              active={loopEnabled}
              onClick={() => {
                setActiveTool("loop");
                handleToggleLoop();
              }}
            />
            <ToolButton
              icon={<LinkIcon className="w-4 h-4" />}
              label="Merge"
              active={activeTool === "merge"}
              onClick={() => {
                setActiveTool("merge");
                handleMerge();
              }}
            />
          </div>

          <div className="flex items-center gap-3 px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A1A1AA] uppercase font-semibold">
                Tempo
              </span>
              <div className="flex items-center gap-3 bg-[#0D0D1A] px-3 py-1.5 rounded-md border border-[#1E1E3A]">
                <span className="text-sm w-14">{tempo} BPM</span>
                <input
                  type="range"
                  min={60}
                  max={180}
                  value={tempo}
                  onChange={(event) => setTempo(Number(event.target.value))}
                  className="w-24 accent-[#7C3AED]"
                  aria-label="Tempo"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A1A1AA] uppercase font-semibold">
                Key
              </span>
              <div className="flex items-center gap-3 bg-[#0D0D1A] px-3 py-1.5 rounded-md border border-[#1E1E3A]">
                <span className="text-sm w-14">
                  {keyShift === 0 ? "Am" : `Am ${keyShift > 0 ? "+" : ""}${keyShift}`}
                </span>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={keyShift}
                  onChange={(event) => setKeyShift(Number(event.target.value))}
                  className="w-24 accent-[#7C3AED]"
                  aria-label="Key shift"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-[#A1A1AA] uppercase font-semibold">
              Selection
            </span>
            <div className="flex items-center gap-1 bg-[#0D0D1A] px-2 py-1.5 rounded-md border border-[#1E1E3A]">
              <button
                type="button"
                onClick={handleSetIn}
                className="px-2 py-1 text-[10px] rounded bg-white/5 text-white/70 hover:text-white"
              >
                Set In
              </button>
              <button
                type="button"
                onClick={handleSetOut}
                className="px-2 py-1 text-[10px] rounded bg-white/5 text-white/70 hover:text-white"
              >
                Set Out
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2 py-1 text-[10px] rounded bg-white/5 text-white/70 hover:text-white"
              >
                Clear
              </button>
            </div>
            <span className="text-[10px] text-white/40 tabular-nums">
              {selectionStart !== null ? formatTime(selectionStart) : "--:--"} -{" "}
              {selectionEnd !== null ? formatTime(selectionEnd) : "--:--"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Playback Transport */}
      <div className="px-6 py-3 border-b border-[#1E1E3A] flex items-center justify-center gap-4">
        <span className="text-xs text-[#A1A1AA] tabular-nums w-12 text-right">
          {formatTime(currentTime)}
        </span>
        <button
          type="button"
          onClick={() => handleSkip(-5)}
          className="p-2 text-white/50 hover:text-white transition-colors"
          aria-label="Skip back 5 seconds"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={!isLoaded}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 hover:shadow-[#7C3AED]/50 transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={isEditorPlaying ? "Pause" : "Play"}
        >
          {isEditorPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleSkip(5)}
          className="p-2 text-white/50 hover:text-white transition-colors"
          aria-label="Skip forward 5 seconds"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <span className="text-xs text-[#A1A1AA] tabular-nums w-12">
          {formatTime(duration)}
        </span>
      </div>

      {/* Waveform Editor Area */}
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {tracks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <Activity className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="font-medium text-lg mb-1">No tracks to edit</h3>
            <p className="text-sm text-[#A1A1AA]">
              Generate a track first, then come back here to edit it.
            </p>
          </div>
        ) : (
          <div
            className={`bg-[#111128] border border-[#1E1E3A] rounded-xl p-4 flex-1 flex flex-col relative overflow-hidden ${isExpanded ? "min-h-[600px]" : "min-h-[400px]"
              }`}
            onClick={handleWaveformClick}
          >
            {/* Time Ruler */}
            <div className="h-6 border-b border-[#1E1E3A] flex items-center justify-between px-16 text-[10px] text-white/30 relative mb-4">
              <span>0:00</span>
              <span>{formatTime(duration * 0.2)}</span>
              <span>{formatTime(duration * 0.4)}</span>
              <span>{formatTime(duration * 0.6)}</span>
              <span>{formatTime(duration * 0.8)}</span>
              <span>{formatTime(duration)}</span>
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-[-400px] w-px bg-red-500 z-10 transition-[left] duration-75 ease-linear"
                style={{ left: `calc(64px + ${playbackProgress}% * (100% - 128px) / 100)` }}
              >
                <div className="w-3 h-3 bg-red-500 rounded-full -ml-1 -mt-1" />
              </div>
            </div>

            {selectionRange && (
              <div className="absolute top-10 bottom-4 left-4 right-4 pointer-events-none">
                <div
                  className="absolute inset-y-0 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-md"
                  style={{
                    left: `${selectionStartPct}%`,
                    width: `${selectionWidthPct}%`,
                  }}
                />
              </div>
            )}

            {/* Stems/Tracks */}
            <div className="flex-1 flex flex-col gap-2">
              {STEM_LABELS.map((stem, i) => (
                <StemTrack
                  key={stem.name}
                  name={stem.name}
                  color={stem.color}
                  bars={stemBars[i]}
                  muted={mutedStems[i]}
                  soloed={soloedStems[i]}
                  onToggleMute={() => toggleMute(i)}
                  onToggleSolo={() => toggleSolo(i)}
                  playbackProgress={playbackProgress}
                />
              ))}
            </div>

            {!isLoaded && (
              <div className="absolute inset-0 bg-[#0D0D1A]/80 flex items-center justify-center rounded-xl">
                <div className="text-center">
                  <Activity className="w-10 h-10 text-[#A1A1AA] mx-auto mb-3" />
                  <p className="text-sm text-[#A1A1AA] mb-2">
                    Select a track and click &quot;Load in Editor&quot; to begin
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
