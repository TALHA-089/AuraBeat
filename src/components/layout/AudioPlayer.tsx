"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Music,
} from "lucide-react";
import { useAudioStore } from "@/lib/store/audioStore";
import { useToastStore } from "@/lib/store/toastStore";
import { downloadAudioFromUrl } from "@/lib/audio/download";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const addToast = useToastStore((state) => state.addToast);
  const {
    currentTrack,
    isPlaying,
    shuffle,
    repeat,
    volume,
    togglePlay,
    pause,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    setVolume,
  } = useAudioStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.audioUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(() => {
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, pause]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    function handleMouseUp() {
      if (isDragging) setIsDragging(false);
    }
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging]);

  const title = currentTrack ? currentTrack.title : "No track selected";
  const canPlay = Boolean(currentTrack?.audioUrl);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleProgressBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !canPlay) return;
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(percent * duration, duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  function handleProgressDrag(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging || !audioRef.current || !canPlay) return;
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(percent * duration, duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }

  async function handleDownload() {
    if (!currentTrack?.audioUrl) return;
    try {
      await downloadAudioFromUrl(currentTrack.audioUrl, currentTrack.title, "mp3");
      addToast({
        variant: "success",
        title: "Download started",
        message: `Downloading ${currentTrack.title}.`,
      });
    } catch {
      addToast({
        variant: "error",
        title: "Download failed",
        message: "Could not download this track.",
      });
    }
  }

  async function handleShare() {
    if (!currentTrack?.audioUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTrack.title,
          url: currentTrack.audioUrl,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(currentTrack.audioUrl);
      addToast({
        variant: "success",
        title: "Link copied",
        message: "Track link copied to clipboard.",
      });
    } catch {
      addToast({
        variant: "error",
        title: "Share failed",
        message: "Could not copy the track link.",
      });
    }
  }

  return (
    <div className="min-h-[96px] sm:h-[72px] bg-[#0C0C1B] border-t border-[#1E1E3A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-5 py-2 sm:py-0 z-50 shrink-0 select-none">
      <audio
        ref={audioRef}
        className="hidden"
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (repeat === "one") {
            audioRef.current?.play().catch(() => {
              pause();
            });
            return;
          }
          setCurrentTime(0);
          playNext();
        }}
      />

      {/* Left — Track info */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-[30%] min-w-0 sm:min-w-[180px]">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-md bg-[#1A1A2E] flex items-center justify-center shrink-0 border border-[#1E1E3A]">
          <Music className="w-5 h-5 text-[#A1A1AA]" />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <h4 className="text-[14px] font-medium truncate text-white hover:underline cursor-pointer">
            {title}
          </h4>
          <p className="text-[11px] text-white/50 truncate hover:underline cursor-pointer mt-0.5">
            {currentTrack ? "AuraBeat AI" : "—"}
          </p>
        </div>
      </div>

      {/* Center — Controls + Progress */}
      <div className="flex flex-col items-center justify-center w-full sm:w-[40%] sm:max-w-[722px] sm:px-4">
        <div className="flex items-center gap-4 sm:gap-6 mb-2">
          <button
            type="button"
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? "text-[#7C3AED]" : "text-white/40 hover:text-white"
              }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={playPrev}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            type="button"
            onClick={() => canPlay && togglePlay()}
            disabled={!canPlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 ml-1 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button
            type="button"
            onClick={toggleRepeat}
            className={`transition-colors ${repeat === "off" ? "text-white/40 hover:text-white" : "text-[#7C3AED]"
              }`}
            aria-label="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] text-white/50 w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          <div
            className="flex-1 h-3 flex items-center cursor-pointer group relative"
            onClick={handleProgressBarClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={handleProgressDrag}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            ref={progressBarRef}
          >
            <div className="w-full h-1 bg-white/10 rounded-full relative overflow-hidden group-hover:h-1.5 transition-all">
              <div
                className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-[#7C3AED] transition-colors rounded-full"
                style={{ width: `${canPlay ? progressPct : 0}%` }}
              />
            </div>
            {/* Knob */}
            <div
              className="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
              style={{ left: `calc(${canPlay ? progressPct : 0}% - 6px)` }}
            />
          </div>

          <span className="text-[11px] text-white/50 w-10 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right — Volume & actions */}
      <div className="hidden sm:flex items-center justify-end gap-4 w-[30%] min-w-[180px]">
        <button
          type="button"
          onClick={handleDownload}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Download"
          disabled={!canPlay}
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Share"
          disabled={!canPlay}
        >
          <Share2 className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <Volume2 className="w-4 h-4 text-white/50 hover:text-white transition-colors cursor-pointer" />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            className="w-24 accent-[#7C3AED]"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
