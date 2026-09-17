"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/** Deterministic pseudo-random so SSR and client agree. */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/**
 * Ambient page background: a handful of twinkling stars, two very slow drifting glows and an
 * occasional shooting star. Fixed, non-interactive, hidden in print, static under reduced-motion.
 */
export function Starfield({ count = 26 }: { count?: number }) {
  const reduce = useReducedMotion();
  const stars = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: count }, (_, i) => ({
      id: i, x: r() * 100, y: r() * 100, s: 1 + r() * 1.6, d: 2 + r() * 4, delay: r() * 5, accent: i % 7 === 0,
    }));
  }, [count]);

  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* drifting glows */}
      <motion.div className="absolute -left-40 top-[-10%] size-[46rem] rounded-full bg-accent/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -right-48 bottom-[-20%] size-[40rem] rounded-full bg-strength/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }} />

      {/* stars */}
      {stars.map((st) => (
        <motion.span key={st.id} className={`absolute rounded-full ${st.accent ? "bg-accent" : "bg-ink"}`}
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, opacity: 0.35 }}
          animate={reduce ? undefined : { opacity: [0.15, 0.7, 0.15], scale: [1, 1.4, 1] }}
          transition={{ duration: st.d, repeat: Infinity, ease: "easeInOut", delay: st.delay }} />
      ))}

      {/* shooting star */}
      {!reduce && (
        <motion.span className="absolute h-px w-28 bg-gradient-to-r from-transparent via-ink/70 to-transparent"
          style={{ left: "70%", top: "12%", rotate: 35 }}
          animate={{ x: [-40, 260], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 9, ease: "easeOut", delay: 3 }} />
      )}
    </div>
  );
}
