"use client";

import { motion, useReducedMotion } from "motion/react";

interface Props {
  steps: string[];
  current: number; // 0-based
  label: string;   // "Step 2 of 3"
  onJump?: (i: number) => void;
}

/** Progress header for multi-step forms: numbered pills joined by a filling line. */
export function Stepper({ steps, current, label, onJump }: Props) {
  const reduce = useReducedMotion();
  return (
    <nav aria-label={label} className="mb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => {
          const done = i < current, active = i === current;
          return (
            <li key={s} className="flex flex-1 items-center gap-2 last:flex-none">
              <button type="button" disabled={!done || !onJump} onClick={() => onJump?.(i)} aria-current={active ? "step" : undefined}
                className={`flex h-9 items-center gap-2 rounded-full pl-1.5 pr-3.5 text-sm font-medium transition-colors ${active ? "bg-accent-soft text-ink" : done ? "text-ink hover:bg-surface-2" : "text-muted"}`}>
                <span className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${active ? "bg-accent text-accent-ink" : done ? "bg-strength text-white" : "bg-surface-2 text-muted"}`}>
                  {done ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < steps.length - 1 && (
                <div className="relative h-px flex-1 bg-line">
                  <motion.div className="absolute inset-y-0 left-0 bg-accent" initial={false} animate={{ width: done ? "100%" : "0%" }} transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
