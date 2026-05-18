"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";
import { validatePassword } from "@/lib/auth/password";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): string | null {
    if (displayName.trim().length < 2) {
      return "Display name must be at least 2 characters.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    const { allPassed } = validatePassword(password);
    if (!allPassed) {
      return "Password does not meet all requirements.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (!agreedToTerms) {
      return "You must agree to use AuraBeat responsibly.";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // If session exists immediately (email confirmation disabled), redirect
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // If email confirmation is enabled, show message
      setSuccess(
        "Account created. Please check your email to confirm your account.",
      );
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-white/50">
          Start generating music with Aurabeat.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Display Name */}
        <div>
          <label
            htmlFor="displayName"
            className="mb-1 block text-sm font-medium text-white/80"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            name="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            required
            placeholder="Your name"
            className="w-full rounded-xl border border-white/10 bg-[#0D0D1A] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
          />
        </div>

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
          name="new-password"
          autoComplete="new-password"
        />

        {/* Password Checklist */}
        <PasswordChecklist password={password} />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          name="confirm-password"
          autoComplete="new-password"
          error={
            confirmPassword && password !== confirmPassword
              ? "Passwords do not match."
              : undefined
          }
        />

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[#0D0D1A] text-[#7C3AED] accent-[#7C3AED]"
          />
          <span className="text-sm text-white/60">
            I agree to use AuraBeat responsibly.
          </span>
        </label>

        {/* Error */}
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {/* Success */}
        {success ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
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
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30 uppercase tracking-wider">
          Already a member?
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Login link */}
      <Link
        href="/login"
        className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors no-underline"
      >
        Sign In Instead
      </Link>
    </AuthShell>
  );
}
