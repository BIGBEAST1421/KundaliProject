import type { Verdict } from "@/src/reports/types";

const marker: Record<Verdict, string> = { strength: "bg-strength", concern: "bg-concern", neutral: "bg-accent" };

interface InsightListProps {
  items: readonly string[];
  tone?: Verdict;
  emptyText?: string;
}

/** Bulleted insights with a small semantic marker. Shows `emptyText` (if given) when empty. */
export function InsightList({ items, tone = "neutral", emptyText }: InsightListProps) {
  if (items.length === 0) {
    return emptyText ? <p className="text-sm text-muted italic">{emptyText}</p> : null;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed">
          <span className={`mt-[0.6em] size-1.5 shrink-0 rounded-full ${marker[tone]}`} aria-hidden />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
