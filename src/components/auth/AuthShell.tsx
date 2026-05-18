import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D0D1A] px-4 py-10 text-white selection:bg-[#7C3AED] selection:text-white">
      {/* Logo + Tagline */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-purple-400 flex items-center justify-center text-lg font-bold">
            A
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Aurabeat
          </span>
        </div>
        <p className="mt-2 text-sm text-white/50">
          AI-powered music generation for creators.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-[#1A1A2E] p-8 shadow-xl shadow-black/30">
        {children}
      </div>
    </div>
  );
}
