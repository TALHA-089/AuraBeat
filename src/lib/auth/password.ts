export type PasswordRule = {
  label: string;
  passed: boolean;
};

export type PasswordValidation = {
  rules: PasswordRule[];
  allPassed: boolean;
};

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

/**
 * Validates a password against the required rules.
 * Returns individual rule results so the UI can render a checklist.
 */
export function validatePassword(password: string): PasswordValidation {
  const rules: PasswordRule[] = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "One uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "One lowercase letter", passed: /[a-z]/.test(password) },
    { label: "One number", passed: /[0-9]/.test(password) },
    {
      label: "One special character (!@#$%^&*…)",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return {
    rules,
    allPassed: rules.every((r) => r.passed),
  };
}

/**
 * Returns a human-readable password strength label based on how many
 * validation rules the password satisfies.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "weak";

  const { rules } = validatePassword(password);
  const passedCount = rules.filter((r) => r.passed).length;

  if (passedCount <= 2) return "weak";
  if (passedCount <= 3) return "fair";
  if (passedCount <= 4) return "good";
  return "strong";
}
