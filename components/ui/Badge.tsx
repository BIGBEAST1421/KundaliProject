import type { Verdict } from "@/src/reports/types";

const styles: Record<Verdict | "accent" | "muted", string> = {
  strength: "bg-strength-soft text-strength",
  concern: "bg-concern-soft text-concern",
  neutral: "bg-neutral-soft text-neutral",
  accent: "bg-accent-soft text-ink",
  muted: "bg-surface-2 text-muted",
};

export function Badge({ tone = "muted", children, className = "" }: { tone?: keyof typeof styles; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[tone]} ${className}`}>
      {children}
    </span>
  );
}

const dot: Record<Verdict, string> = { strength: "bg-strength", concern: "bg-concern", neutral: "bg-neutral" };

export function VerdictBadge({ verdict, label }: { verdict: Verdict; label: string }) {
  return (
    <Badge tone={verdict}>
      <span className={`size-1.5 rounded-full ${dot[verdict]}`} aria-hidden />
      {label}
    </Badge>
  );
}
