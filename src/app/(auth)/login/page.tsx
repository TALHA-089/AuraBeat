"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, Music } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";

const REMEMBER_KEY = "aurabeat_remembered_email";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill remembered email on mount (client-only)
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid")) {
          setError("Incorrect email or password. Please try again.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50">
          Sign in to continue to Aurabeat.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">
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

        {/* Password */}
        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          name="password"
          autoComplete="current-password"
        />

        {/* Remember Me + Forgot Password row */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-[#0D0D1A] text-[#7C3AED] accent-[#7C3AED]"
            />
            <span className="text-sm text-white/60">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#7C3AED] transition-opacity hover:opacity-80"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error */}
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] px-4 py-3 font-semibold text-white shadow-[0_0_30px_-10px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30 uppercase tracking-wider">
          New to Aurabeat?
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Register link */}
      <Link
        href="/register"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors no-underline"
      >
        <Music className="h-4 w-4 text-[#7C3AED]" />
        Create Account
      </Link>
    </AuthShell>
  );
}
