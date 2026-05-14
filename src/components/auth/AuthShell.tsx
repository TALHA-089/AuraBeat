import type { ReactNode } from "react";
import { Music2 } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D0D1A] px-4 py-10 text-white">
      {/* Logo + Tagline */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#7C3AED]/20">
            <Music2 className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#7C3AED]">
            Aurabeat
          </span>
        </div>
        <p className="mt-2 text-sm text-white/50">
          AI-powered music generation for creators.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-[#1e1e3a] bg-[#111128] p-6 shadow-xl shadow-black/20">
        {children}
      </div>
    </div>
  );
}
