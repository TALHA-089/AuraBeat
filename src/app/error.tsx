"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0D0D1A] text-white p-6">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-white/50 mb-8 text-sm">
          An unexpected error occurred in the application. We&apos;ve been notified and are looking into it.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium border border-white/10"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors text-sm font-medium"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
