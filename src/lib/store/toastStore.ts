import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
};

type ToastInput = Omit<ToastItem, "id">;

type ToastState = {
  toasts: ToastItem[];
  addToast: (input: ToastInput) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (input) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const duration = input.duration ?? 3000;

    const toast: ToastItem = { ...input, id };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    // Auto-dismiss
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));
