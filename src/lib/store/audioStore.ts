import { create } from "zustand";

export type AudioTrack = {
  id: string;
  title: string;
  audioUrl: string;
};

type AudioState = {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  setTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  clearTrack: () => void;
};

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,

  setTrack: (track) =>
    set({
      currentTrack: track,
      isPlaying: true,
    }),

  togglePlay: () =>
    set({
      isPlaying: !get().isPlaying,
    }),

  pause: () =>
    set({
      isPlaying: false,
    }),

  clearTrack: () =>
    set({
      currentTrack: null,
      isPlaying: false,
    }),
}));
