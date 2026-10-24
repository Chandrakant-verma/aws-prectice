export function Loader({ label = "Loading…", size = "md" }) {
  const dimension = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <div className="flex items-center gap-3 text-slate-400">
      <span
        className={`${dimension} animate-spin rounded-full border-2 border-ink-600 border-t-signal-500`}
        aria-hidden="true"
      />
      <span className="font-display text-sm">{label}</span>
    </div>
  );
}
