"use client";

import { motion, useReducedMotion } from "motion/react";

/** Horizontal score meter (e.g. guna x/36). Fills when scrolled into view. */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tone = pct >= 66 ? "bg-strength" : pct >= 50 ? "bg-accent" : "bg-concern";
  const reduce = useReducedMotion();
  return (
    <div role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <motion.div className={`h-full rounded-full ${tone}`}
        initial={reduce ? { width: `${pct}%` } : { width: 0 }}
        whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} />
    </div>
  );
}
