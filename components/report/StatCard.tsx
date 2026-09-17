export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl leading-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
