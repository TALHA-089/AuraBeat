"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <>
          <div className="flex flex-col items-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/60">
              If an account exists for this email, a reset link has been sent.
              Please check your inbox and spam folder.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED] transition-opacity hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Forgot your password?
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0D0D1A] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] px-4 py-3 font-semibold text-white shadow-[0_0_30px_-10px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED] transition-opacity hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}
