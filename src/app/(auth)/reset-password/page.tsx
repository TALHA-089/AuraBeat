"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";
import { validatePassword } from "@/lib/auth/password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const { allPassed } = validatePassword(password);
    if (!allPassed) {
      setError("Password does not meet all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        // Handle expired or missing recovery session
        if (
          updateError.message.toLowerCase().includes("session") ||
          updateError.message.toLowerCase().includes("token") ||
          updateError.message.toLowerCase().includes("auth")
        ) {
          setError(
            "Your reset link may have expired. Please request a new password reset.",
          );
        } else {
          setError(updateError.message);
        }
        return;
      }

      setSuccess(true);

      // Brief delay to show success message, then redirect
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Password updated
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold tracking-tight">
        Set a new password
      </h1>
      <p className="mt-1 text-sm text-white/60">
        Choose a strong password for your Aurabeat account.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* New Password */}
        <PasswordInput
          label="New Password"
          value={password}
          onChange={setPassword}
          name="new-password"
          autoComplete="new-password"
        />

        {/* Password Checklist */}
        <PasswordChecklist password={password} />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm New Password"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Updating...
            </>
          ) : (
            "Reset Password"
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
    </AuthShell>
  );
}
