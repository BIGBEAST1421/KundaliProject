"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

// U+FE0E forces text presentation so glyphs don't become emoji.
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((g) => g + "︎");
const PLANETS: { r: number; size: number; dur: number; start: number; color: string; ring?: boolean; ccw?: boolean }[] = [
  { r: 62, size: 4, dur: 9, start: 20, color: "var(--ink)" },
  { r: 92, size: 5.5, dur: 16, start: 200, color: "var(--accent)", ccw: true },
  { r: 122, size: 3.5, dur: 26, start: 110, color: "var(--strength)" },
  { r: 122, size: 2.5, dur: 26, start: 290, color: "var(--muted)" },
  { r: 150, size: 6.5, dur: 42, start: 340, color: "var(--concern)", ring: true, ccw: true },
];

/**
 * Hero illustration: a slowly turning zodiac wheel, planets orbiting at different speeds, a
 * breathing sun, and the chart frame faintly behind. Tilts slightly toward the pointer.
 * Orbits are CSS keyframes (SVG-native origins); everything freezes under reduced-motion.
 */
export function HeroOrbits() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const rx = useTransform(sy, (v) => v * -10);
  const ry = useTransform(sx, (v) => v * 10);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  return (
    <motion.div className="relative mx-auto aspect-square w-full max-w-[460px]"
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      initial={reduce ? false : { opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
      <svg viewBox="0 0 360 360" className="h-full w-full overflow-visible" role="img" aria-label="Planets orbiting inside a zodiac wheel">
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* faint chart frame */}
        <g fill="none" stroke="var(--line)" strokeWidth="1" opacity="0.8">
          <rect x="52" y="52" width="256" height="256" rx="4" />
          <path d="M52 52 L308 308 M308 52 L52 308 M180 52 L52 180 L180 308 L308 180 Z" />
        </g>

        {/* zodiac wheel */}
        <g className="orb" style={{ ["--dur" as string]: "180s" }}>
          <circle cx="180" cy="180" r="168" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
          <circle cx="180" cy="180" r="150" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 6" />
          {ZODIAC.map((g, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            // round so server and client emit identical markup
            const x = Math.round((180 + Math.cos(a) * 159) * 100) / 100, y = Math.round((180 + Math.sin(a) * 159) * 100) / 100;
            return (
              <text key={g} x={x} y={y + 4} textAnchor="middle" fontSize="12" fontFamily="var(--font-spectral), Georgia, serif"
                fill={i % 3 === 0 ? "var(--accent)" : "var(--muted)"} transform={`rotate(${(i / 12) * 360} ${x} ${y})`}>{g}</text>
            );
          })}
        </g>

        {/* orbit paths */}
        {[62, 92, 122, 150].map((r) => <circle key={r} cx="180" cy="180" r={r} fill="none" stroke="var(--line)" strokeWidth="1" opacity="0.9" />)}

        {/* sun */}
        <circle className="orb--pulse" cx="180" cy="180" r="46" fill="url(#sunGlow)" style={{ transformBox: "view-box", transformOrigin: "180px 180px" }} />
        <circle cx="180" cy="180" r="9" fill="var(--accent)" />
        <circle cx="180" cy="180" r="9" fill="none" stroke="var(--accent-ink)" strokeOpacity="0.35" />

        {/* planets: static start angle (SVG attr) + CSS spin */}
        {PLANETS.map((p, i) => (
          <g key={i} transform={`rotate(${p.start} 180 180)`}>
            <g className={`orb ${p.ccw ? "orb--ccw" : ""}`} style={{ ["--dur" as string]: `${p.dur}s` }}>
              <g transform={`translate(${180 + p.r} 180)`}>
                {p.ring && <ellipse rx={p.size * 2.1} ry={p.size * 0.7} fill="none" stroke={p.color} strokeWidth="1" opacity="0.7" transform="rotate(-20)" />}
                <circle r={p.size} fill={p.color} />
                <circle r={p.size + 4} fill="none" stroke={p.color} strokeOpacity="0.25" />
                {i === 0 && (
                  <g className="orb" style={{ ["--dur" as string]: "2.4s", transformOrigin: "0px 0px", transformBox: "view-box" }}>
                    <circle cx="10" cy="0" r="1.6" fill="var(--muted)" />
                  </g>
                )}
              </g>
            </g>
          </g>
        ))}
      </svg>
    </motion.div>
  );
}
