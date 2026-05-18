import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  userInitial: string;
  goldBalance: number | null;
  isReady: boolean;
  setUserInitial: (value: string) => void;
  setGoldBalance: (value: number | null) => void;
  setReady: (value: boolean) => void;
  clearSession: () => void;
};

const initialState = {
  userInitial: "A",
  goldBalance: null,
  isReady: false,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialState,
      setUserInitial: (value) => set({ userInitial: value || "A" }),
      setGoldBalance: (value) => set({ goldBalance: value }),
      setReady: (value) => set({ isReady: value }),
      clearSession: () => set(initialState),
    }),
    {
      name: "aurabeat-session",
      partialize: (state) => ({
        userInitial: state.userInitial,
        goldBalance: state.goldBalance,
      }),
    },
  ),
);