"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useAudioStore } from "@/lib/store/audioStore";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { currentTrack, isPlaying, togglePlay, pause } = useAudioStore();

  // Load new track when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.audioUrl;
    audio.load();
    setCurrentTime(0);
  }, [currentTrack]);

  // Play/pause when isPlaying changes
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

  const title = currentTrack ? currentTrack.title : "No track selected";
  const canPlay = Boolean(currentTrack?.audioUrl);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 z-50 h-[70px] w-full border-t border-[#1e1e3a] bg-[#111128]">
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
          pause();
        }}
      />

      <div className="mx-auto flex h-full max-w-6xl items-center gap-4 px-4">
        <button
          type="button"
          onClick={() => canPlay && togglePlay()}
          disabled={!canPlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#7C3AED] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{title}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="shrink-0 text-xs text-white/60">
              {formatTime(currentTime)}
            </span>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#7C3AED] transition-[width] duration-150 ease-linear"
                style={{ width: `${canPlay ? progressPct : 0}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-white/60">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
