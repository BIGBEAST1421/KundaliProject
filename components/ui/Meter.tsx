/** Horizontal score meter (e.g. guna x/36). */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tone = pct >= 66 ? "bg-strength" : pct >= 50 ? "bg-accent" : "bg-concern";
  return (
    <div role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div className={`h-full rounded-full ${tone} transition-[width] duration-700 ease-[var(--ease-out-quart)]`} style={{ width: `${pct}%` }} />
    </div>
  );
}
