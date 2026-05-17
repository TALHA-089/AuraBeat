"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  CheckSquare,
  Download,
  Filter,
  Grid,
  List,
  Music,
  MoreVertical,
  Play,
  Search,
  SortAsc,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAudioStore } from "@/lib/store/audioStore";
import { useToastStore } from "@/lib/store/toastStore";
import { downloadAudioFromUrl } from "@/lib/audio/download";

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

type SortOption = "newest" | "oldest" | "a-z";

function formatRelativeDate(value: string | null) {
  if (!value) return "Unknown";
  const d = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD} days ago`;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getTrackTitle(track: LibraryTrack) {
  return track.title?.trim() || "Untitled Track";
}

function makeWaveformBars(count: number) {
  return Array.from({ length: count }, () =>
    Math.max(10, Math.random() * 100),
  );
}

export function LibraryClient({ tracks }: LibraryClientProps) {
  const setTrack = useAudioStore((state) => state.setTrack);
  const setQueue = useAudioStore((state) => state.setQueue);
  const addToast = useToastStore((state) => state.addToast);
  const [localTracks, setLocalTracks] = useState<LibraryTrack[]>(tracks);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelecting = selectedIds.size > 0;

  const waveformMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const t of localTracks) {
      map[t.id] = makeWaveformBars(20);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTracks.length]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    localTracks.forEach((track) => {
      (track.style_tags ?? []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [localTracks]);

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = localTracks;

    if (q) {
      result = result.filter((track) => {
        const title = track.title?.toLowerCase() ?? "";
        const prompt = track.prompt?.toLowerCase() ?? "";
        const tags = (track.style_tags ?? []).join(" ").toLowerCase();
        return title.includes(q) || prompt.includes(q) || tags.includes(q);
      });
    }

    if (activeTags.length > 0) {
      result = result.filter((track) => {
        const tags = track.style_tags ?? [];
        return tags.some((tag) => activeTags.includes(tag));
      });
    }

    // Sort
    const sorted = [...result];
    if (sort === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      );
    } else if (sort === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.created_at ?? 0).getTime() -
          new Date(b.created_at ?? 0).getTime(),
      );
    } else if (sort === "a-z") {
      sorted.sort((a, b) =>
        getTrackTitle(a).localeCompare(getTrackTitle(b)),
      );
    }

    return sorted;
  }, [localTracks, query, sort, activeTags]);

  async function handleBatchDownload() {
    if (selectedIds.size === 0) return;

    const selectedTracks = filteredTracks.filter((track) =>
      selectedIds.has(track.id),
    );

    const downloadable = selectedTracks.filter((track) => track.audio_url);

    if (downloadable.length === 0) {
      addToast({
        variant: "error",
        title: "No audio files",
        message: "Selected tracks do not have audio files.",
      });
      return;
    }

    addToast({
      variant: "info",
      title: "Downloading",
      message: `Preparing ${downloadable.length} track(s) for download.`,
    });

    for (const track of downloadable) {
      try {
        await downloadAudioFromUrl(
          track.audio_url as string,
          getTrackTitle(track),
          "mp3",
        );
      } catch {
        addToast({
          variant: "error",
          title: "Download failed",
          message: `Could not download ${getTrackTitle(track)}.`,
        });
      }
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === filteredTracks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTracks.map((t) => t.id)));
    }
  }

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
    const queue = filteredTracks
      .filter((item) => item.audio_url)
      .map((item) => ({
        id: item.id,
        title: getTrackTitle(item),
        audioUrl: item.audio_url as string,
      }));

    if (queue.length > 0) {
      setQueue(queue, track.id);
    } else {
      setTrack({ id: track.id, title, audioUrl: track.audio_url });
    }
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

    setLocalTracks((current) => current.filter((track) => track.id !== trackId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
    addToast({
      variant: "success",
      title: "Track deleted",
      message: "The track was removed from your library.",
    });
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    const confirmed = window.confirm(
      `Delete ${selectedIds.size} selected track(s)?`,
    );
    if (!confirmed) return;

    const supabase = createClient();
    const ids = Array.from(selectedIds);

    const { error: deleteError } = await supabase
      .from("tracks")
      .delete()
      .in("id", ids);

    if (deleteError) {
      addToast({
        variant: "error",
        title: "Delete failed",
        message: deleteError.message || "Could not delete tracks.",
      });
      return;
    }

    setLocalTracks((current) =>
      current.filter((t) => !selectedIds.has(t.id)),
    );
    setSelectedIds(new Set());
    addToast({
      variant: "success",
      title: "Tracks deleted",
      message: `${ids.length} track(s) removed from your library.`,
    });
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0D0D1A] overflow-hidden">
      {/* Header & Controls */}
      <div className="p-6 border-b border-white/5 bg-[#111122]/50 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Library</h1>
          <div className="flex bg-[#1A1A2E] border border-white/5 rounded-lg p-1">
            <button
              type="button"
              className="px-4 py-1.5 text-sm font-medium bg-[#7C3AED] text-white rounded-md"
            >
              All Files
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                placeholder="Search library..."
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>

            {/* Filter button */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-[#1A1A2E] text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden lg:inline">Filter</span>
              </button>

              {showFilterMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-[#2A2A40] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-white/60 border-b border-white/10">
                    <span>Genres</span>
                    <button
                      type="button"
                      onClick={() => setActiveTags([])}
                      className="text-white/50 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  {availableTags.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-white/40">
                      No tags available
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto custom-scrollbar">
                      {availableTags.map((tag) => {
                        const isActive = activeTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setActiveTags((prev) =>
                                prev.includes(tag)
                                  ? prev.filter((t) => t !== tag)
                                  : [...prev, tag],
                              );
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${isActive
                                ? "bg-[#7C3AED]/20 text-white"
                                : "text-white/70 hover:bg-white/5"
                              }`}
                          >
                            <span>{tag}</span>
                            {isActive && (
                              <span className="text-xs text-[#7C3AED]">Selected</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-[#1A1A2E] text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors"
              >
                <SortAsc className="w-4 h-4" />
                <span className="hidden lg:inline capitalize">{sort}</span>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-[#2A2A40] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                  {(
                    [
                      { key: "newest", label: "Newest First" },
                      { key: "oldest", label: "Oldest First" },
                      { key: "a-z", label: "A → Z" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSort(key);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === key
                          ? "bg-[#7C3AED] text-white"
                          : "text-white/70 hover:bg-white/5"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1A1A2E] p-1 rounded-lg border border-white/5">
            <button
              type="button"
              aria-label="Grid View"
              onClick={() => setViewMode("grid")}
              className={[
                "p-1.5 rounded transition-colors",
                viewMode === "grid"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white",
              ].join(" ")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="List View"
              onClick={() => setViewMode("list")}
              className={[
                "p-1.5 rounded transition-colors",
                viewMode === "list"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white",
              ].join(" ")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar */}
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/5 bg-[#7C3AED]/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-sm font-medium">
                  {selectedIds.size} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/80 hover:bg-white/10 transition-colors border border-white/10"
                  onClick={handleBatchDownload}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="ml-2 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {localTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Music className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="font-medium mb-1 text-lg">No tracks yet</h3>
            <p className="text-sm max-w-md text-white/60">
              Generate your first track from the Create Music page. Saved tracks
              will appear here automatically.
            </p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Search className="w-10 h-10 text-white/30 mb-4" />
            <h3 className="font-medium mb-1">No matching tracks</h3>
            <p className="text-sm text-white/60">
              Try searching by title, prompt, or style tag.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredTracks.map((track) => {
              const title = getTrackTitle(track);
              const tags = track.style_tags ?? [];
              const isDeleting = deletingId === track.id;
              const bars = waveformMap[track.id] ?? [];
              const isSelected = selectedIds.has(track.id);

              return (
                <div
                  key={track.id}
                  className={[
                    "group relative bg-[#1A1A2E] border rounded-xl overflow-hidden hover:border-white/20 transition-all shadow-lg hover:shadow-xl",
                    isSelected
                      ? "border-[#7C3AED] ring-1 ring-[#7C3AED]/30"
                      : "border-white/5",
                  ].join(" ")}
                >
                  {/* Selection checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(track.id)}
                    className={[
                      "absolute top-3 left-3 z-10 w-5 h-5 rounded border flex items-center justify-center transition-all",
                      isSelected
                        ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                        : "border-white/20 bg-black/30 text-transparent opacity-0 group-hover:opacity-100",
                    ].join(" ")}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Delete action */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleDelete(track.id)}
                      disabled={isDeleting}
                      className="p-1 rounded bg-black/50 text-white/70 hover:text-red-400 backdrop-blur-sm transition-colors disabled:opacity-50"
                      title="Delete track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cover area */}
                  <div className="aspect-square bg-[#0D0D1A] relative flex items-center justify-center border-b border-white/5">
                    <Music className="w-12 h-12 text-white/10" />
                    <div className="absolute inset-x-4 bottom-4 h-8 flex items-end gap-[2px] opacity-30">
                      {bars.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#7C3AED] rounded-t-sm"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlay(track)}
                      disabled={!track.audio_url}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 shadow-lg shadow-[#7C3AED]/30 disabled:opacity-30"
                    >
                      <Play className="w-5 h-5 ml-1" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-semibold text-sm truncate mb-1"
                      title={title}
                    >
                      {title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>{tags[0] ?? "No genre"}</span>
                      <span>{formatRelativeDate(track.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List view — table */
          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider bg-[#111122]">
                  <th className="py-3 px-4 w-10">
                    <button
                      type="button"
                      onClick={selectAll}
                      className={[
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        selectedIds.size === filteredTracks.length &&
                          filteredTracks.length > 0
                          ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                          : "border-white/20",
                      ].join(" ")}
                    >
                      {selectedIds.size === filteredTracks.length &&
                        filteredTracks.length > 0 && (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 w-32">Genre</th>
                  <th className="py-3 px-4 w-40">Date</th>
                  <th className="py-3 px-4 w-16" />
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((track) => {
                  const title = getTrackTitle(track);
                  const tags = track.style_tags ?? [];
                  const isDeleting = deletingId === track.id;
                  const isSelected = selectedIds.has(track.id);

                  return (
                    <tr
                      key={track.id}
                      className={[
                        "border-b border-white/5 hover:bg-white/5 transition-colors group",
                        isSelected ? "bg-[#7C3AED]/5" : "",
                      ].join(" ")}
                    >
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleSelect(track.id)}
                          className={[
                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                              : "border-white/20",
                          ].join(" ")}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={`Play ${title}`}
                            onClick={() => handlePlay(track)}
                            disabled={!track.audio_url}
                            className="w-8 h-8 rounded bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 shrink-0"
                          >
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                          <span className="font-medium text-sm truncate">
                            {title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Tags className="w-3.5 h-3.5 text-white/30" />
                          {tags[0] ?? "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-white/30" />
                          {formatRelativeDate(track.created_at)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          aria-label={`Delete ${title}`}
                          onClick={() => handleDelete(track.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting ? (
                            <MoreVertical className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
