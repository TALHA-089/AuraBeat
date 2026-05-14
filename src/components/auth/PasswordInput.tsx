"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  autoComplete: string;
  placeholder?: string;
  error?: string;
};

export function PasswordInput({
  label,
  value,
  onChange,
  name,
  autoComplete,
  placeholder = "••••••••",
  error,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = `password-${name}`;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          className={[
            "w-full rounded-xl border bg-[#0D0D1A] px-4 py-3 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/35",
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-[#1e1e3a] focus:border-[#7C3AED]",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
