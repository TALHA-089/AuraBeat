"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Grid2X2,
  List,
  Music2,
  Play,
  Search,
  Tags,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAudioStore } from "@/lib/store/audioStore";
import { useToastStore } from "@/lib/store/toastStore";

export type LibraryTrack = {
  id: string;
  title: string | null;
  prompt: string | null;
  style_tags: string[] | null;
  audio_url: string | null;
  duration_seconds: number | null;
  created_at: string | null;
};

type LibraryClientProps = {
  tracks: LibraryTrack[];
};

function formatDate(value: string | null) {
  if (!value) return "Unknown date";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getTrackTitle(track: LibraryTrack) {
  return track.title?.trim() || "Untitled Track";
}

export function LibraryClient({ tracks }: LibraryClientProps) {
  const setTrack = useAudioStore((state) => state.setTrack);
  const addToast = useToastStore((state) => state.addToast);
  const [localTracks, setLocalTracks] = useState<LibraryTrack[]>(tracks);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return localTracks;

    return localTracks.filter((track) => {
      const title = track.title?.toLowerCase() ?? "";
      const prompt = track.prompt?.toLowerCase() ?? "";
      const tags = (track.style_tags ?? []).join(" ").toLowerCase();

      return title.includes(q) || prompt.includes(q) || tags.includes(q);
    });
  }, [localTracks, query]);

  function handlePlay(track: LibraryTrack) {
    if (!track.audio_url) {
      setError("This track does not have an audio file.");
      addToast({
        variant: "error",
        title: "Audio unavailable",
        message: "This track does not have an audio file.",
      });
      return;
    }

    setError(null);

    const title = getTrackTitle(track);

    setTrack({
      id: track.id,
      title,
      audioUrl: track.audio_url,
    });

    addToast({
      variant: "success",
      title: "Now playing",
      message: `${title} is loaded in the player.`,
    });
  }

  async function handleDelete(trackId: string) {
    const confirmed = window.confirm("Delete this track from your library?");
    if (!confirmed) return;

    setDeletingId(trackId);
    setError(null);

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("tracks")
      .delete()
      .eq("id", trackId);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message || "Could not delete track.");
      addToast({
        variant: "error",
        title: "Delete failed",
        message: deleteError.message || "Could not delete track.",
      });
      return;
    }

    // Storage cleanup is intentionally not handled here yet because the current
    // database stores only the public audio URL, not the original storage object path.
    setLocalTracks((current) => current.filter((track) => track.id !== trackId));

    addToast({
      variant: "success",
      title: "Track deleted",
      message: "The track was removed from your library.",
    });
  }

  return (
    <div className="min-h-screen bg-[#0D0D1A] p-6 pb-24 text-white">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-white/60">
            Browse, search, and play your generated tracks.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tracks..."
              className="h-11 w-full rounded-xl border border-[#1e1e3a] bg-[#111128] pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#7C3AED] sm:w-72"
            />
          </div>

          <div className="flex rounded-xl border border-[#1e1e3a] bg-[#111128] p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={[
                "flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                viewMode === "grid"
                  ? "bg-[#7C3AED] text-white"
                  : "text-white/60 hover:text-white",
              ].join(" ")}
            >
              <Grid2X2 className="h-4 w-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={[
                "flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                viewMode === "list"
                  ? "bg-[#7C3AED] text-white"
                  : "text-white/60 hover:text-white",
              ].join(" ")}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {localTracks.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#1e1e3a] bg-[#111128] p-10 text-center">
          <Music2 className="h-12 w-12 text-white/50" />
          <h2 className="mt-4 text-xl font-semibold">No tracks yet</h2>
          <p className="mt-2 max-w-md text-sm text-white/55">
            Generate your first track from the Create Music page. Saved tracks
            will appear here automatically.
          </p>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#1e1e3a] bg-[#111128] p-10 text-center">
          <Search className="h-10 w-10 text-white/45" />
          <h2 className="mt-4 text-lg font-semibold">No matching tracks</h2>
          <p className="mt-2 text-sm text-white/55">
            Try searching by title, prompt, or style tag.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "space-y-4"
          }
        >
          {filteredTracks.map((track) => {
            const title = getTrackTitle(track);
            const tags = track.style_tags ?? [];
            const isDeleting = deletingId === track.id;

            return (
              <article
                key={track.id}
                className={[
                  "rounded-2xl border border-[#1e1e3a] bg-[#111128] p-5 shadow-lg shadow-black/10",
                  viewMode === "list"
                    ? "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                    : "",
                ].join(" ")}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#7C3AED]/15 text-[#A78BFA]">
                      <Music2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-white">
                        {title}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/45">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(track.created_at)}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/60">
                    {track.prompt || "No prompt saved for this track."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-2.5 py-1 text-xs text-[#C4B5FD]"
                        >
                          <Tags className="h-3 w-3" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/40">
                        No style tag
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={[
                    "mt-5 flex gap-2",
                    viewMode === "list" ? "mt-0 shrink-0" : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => handlePlay(track)}
                    disabled={!track.audio_url}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                  >
                    <Play className="h-4 w-4" />
                    Play
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(track.id)}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
