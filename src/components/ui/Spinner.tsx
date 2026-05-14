const SIZE_MAP = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

export function Spinner({ size = "md", label, className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <span
        className={[
          "animate-spin rounded-full border-[#7C3AED]/30 border-t-[#7C3AED]",
          SIZE_MAP[size],
        ].join(" ")}
      />
      {label ? (
        <span className="text-sm text-white/70">{label}</span>
      ) : null}
    </span>
  );
}
