interface ChartOrbitLoaderProps {
  message: string;
  size?: number;
  className?: string;
}

const PLANETS: { r: number; size: number; dur: number; start: number; color: string; ccw?: boolean }[] = [
  { r: 20, size: 2.4, dur: 5, start: 20, color: "var(--accent)" },
  { r: 31, size: 2, dur: 8, start: 160, color: "var(--strength)", ccw: true },
  { r: 42, size: 1.8, dur: 12, start: 280, color: "var(--muted)" },
];

/**
 * Compact loading state for a short wait: planets orbiting a pulsing sun inside a Vedic
 * (North-Indian style) Lagna chart diamond -- a smaller sibling of the landing page's
 * `HeroOrbits`. Reuses the same `.orb`/`.orb--pulse` CSS animations (globals.css), which already
 * freeze under `prefers-reduced-motion`, so no extra JS is needed here.
 */
export function ChartOrbitLoader({ message, size = 84, className = "" }: ChartOrbitLoaderProps) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
        <defs>
          <radialGradient id="askSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* chart frame */}
        <g fill="none" stroke="var(--line)" strokeWidth="1">
          <rect x="10" y="10" width="100" height="100" rx="2" />
          <path d="M10 10 L110 110 M110 10 L10 110 M60 10 L10 60 L60 110 L110 60 Z" />
        </g>

        {/* faint orbit guides */}
        {PLANETS.map((p) => <circle key={p.r} cx="60" cy="60" r={p.r} fill="none" stroke="var(--line)" strokeWidth="1" opacity="0.5" />)}

        {/* sun */}
        <circle className="orb--pulse" cx="60" cy="60" r="14" fill="url(#askSunGlow)" style={{ transformBox: "view-box", transformOrigin: "60px 60px" }} />
        <circle cx="60" cy="60" r="4" fill="var(--accent)" />

        {/* orbiting planets */}
        {PLANETS.map((p, i) => (
          <g key={i} transform={`rotate(${p.start} 60 60)`}>
            <g className={`orb ${p.ccw ? "orb--ccw" : ""}`} style={{ ["--dur" as string]: `${p.dur}s`, transformBox: "view-box", transformOrigin: "60px 60px" }}>
              <circle cx={60 + p.r} cy="60" r={p.size} fill={p.color} />
            </g>
          </g>
        ))}
      </svg>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
