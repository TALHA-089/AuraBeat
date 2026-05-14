"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/store/toastStore";
import type { ToastVariant } from "@/lib/store/toastStore";

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    border: "border-emerald-500/30",
    icon: "text-emerald-400",
    Icon: CheckCircle2,
  },
  error: {
    border: "border-red-500/30",
    icon: "text-red-400",
    Icon: AlertCircle,
  },
  info: {
    border: "border-[#7C3AED]/30",
    icon: "text-[#A78BFA]",
    Icon: Info,
  },
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        const { Icon } = style;

        return (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#111128] p-4 shadow-xl shadow-black/20",
              style.border,
            ].join(" ")}
          >
            <Icon className={`h-5 w-5 shrink-0 ${style.icon}`} />

            <div className="min-w-0 flex-1">
              {toast.title ? (
                <div className="text-sm font-semibold text-white">
                  {toast.title}
                </div>
              ) : null}
              <div
                className={[
                  "text-sm text-white/70",
                  toast.title ? "mt-0.5" : "",
                ].join(" ")}
              >
                {toast.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/40 transition-colors hover:text-white/70"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
