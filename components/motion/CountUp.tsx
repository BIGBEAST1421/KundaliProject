"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Animates a number from 0 to `value` when scrolled into view. Renders the final value for SSR. */
export function CountUp({ value, decimals = 0, className = "" }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { el.textContent = v.toFixed(decimals); },
    });
    return () => controls.stop();
  }, [inView, value, decimals, reduce]);

  return <span ref={ref} className={className}>{value.toFixed(decimals)}</span>;
}
