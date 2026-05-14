"use client";

import { Check, X } from "lucide-react";
import { validatePassword } from "@/lib/auth/password";

type PasswordChecklistProps = {
  password: string;
};

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  const { rules } = validatePassword(password);

  if (!password) return null;

  return (
    <ul className="space-y-1.5">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={[
            "flex items-center gap-2 text-xs transition-colors",
            rule.passed ? "text-emerald-400" : "text-white/40",
          ].join(" ")}
        >
          {rule.passed ? (
            <Check className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 shrink-0" />
          )}
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
