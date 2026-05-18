import { create } from "zustand";

export type AudioTrack = {
  id: string;
  title: string;
  audioUrl: string;
};

export type RepeatMode = "off" | "all" | "one";

type AudioState = {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  currentIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  setQueue: (tracks: AudioTrack[], startTrackId?: string) => void;
  setTrack: (track: AudioTrack, options?: { replaceQueue?: boolean }) => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlay: () => void;
  pause: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  clearTrack: () => void;
};

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: "off",
  volume: 0.8,

  setQueue: (tracks, startTrackId) => {
    const normalized = tracks.filter((t) => Boolean(t.audioUrl));
    if (normalized.length === 0) {
      set({
        queue: [],
        currentIndex: 0,
        currentTrack: null,
        isPlaying: false,
      });
      return;
    }

    const startIndex = startTrackId
      ? Math.max(
          0,
          normalized.findIndex((t) => t.id === startTrackId),
        )
      : 0;
    const currentTrack = normalized[startIndex] ?? normalized[0];
    set({
      queue: normalized,
      currentIndex: startIndex,
      currentTrack,
      isPlaying: true,
    });
  },

  setTrack: (track, options) => {
    const replaceQueue = options?.replaceQueue ?? true;
    if (replaceQueue) {
      set({
        queue: [track],
        currentIndex: 0,
        currentTrack: track,
        isPlaying: true,
      });
      return;
    }

    const { queue } = get();
    const existingIndex = queue.findIndex((t) => t.id === track.id);
    if (existingIndex >= 0) {
      set({
        currentIndex: existingIndex,
        currentTrack: queue[existingIndex],
        isPlaying: true,
      });
      return;
    }

    const nextQueue = [...queue, track];
    set({
      queue: nextQueue,
      currentIndex: nextQueue.length - 1,
      currentTrack: track,
      isPlaying: true,
    });
  },

  playNext: () => {
    const { queue, currentIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex;

    if (shuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);
    } else if (currentIndex < queue.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (repeat === "all") {
      nextIndex = 0;
    } else {
      set({ isPlaying: false });
      return;
    }

    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      isPlaying: true,
    });
  },

  playPrev: () => {
    const { queue, currentIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let prevIndex = currentIndex;

    if (shuffle && queue.length > 1) {
      do {
        prevIndex = Math.floor(Math.random() * queue.length);
      } while (prevIndex === currentIndex);
    } else if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    } else if (repeat === "all") {
      prevIndex = queue.length - 1;
    }

    set({
      currentIndex: prevIndex,
      currentTrack: queue[prevIndex],
      isPlaying: true,
    });
  },

  togglePlay: () =>
    set({
      isPlaying: !get().isPlaying,
    }),

  pause: () =>
    set({
      isPlaying: false,
    }),

  toggleShuffle: () =>
    set({
      shuffle: !get().shuffle,
    }),

  toggleRepeat: () =>
    set((state) => ({
      repeat:
        state.repeat === "off"
          ? "all"
          : state.repeat === "all"
            ? "one"
            : "off",
    })),

  setVolume: (volume) =>
    set({
      volume: Math.max(0, Math.min(1, volume)),
    }),

  clearTrack: () =>
    set({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentIndex: 0,
    }),
}));
