/**
 * Decorative hero illustration: a North-Indian style chart outline with a small constellation
 * drawn over it. Pure SVG, theme-aware via currentColor / CSS variables.
 */
export function ConstellationArt() {
  const stars: [number, number, number][] = [
    [62, 48, 2.2], [118, 84, 1.6], [172, 60, 2.6], [214, 120, 1.8], [150, 156, 2.2], [92, 178, 1.6], [236, 200, 2.4], [186, 236, 1.8],
  ];
  const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6], [6, 7]];
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label="Birth chart with a constellation" className="w-full h-auto">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="140" fill="url(#glow)" />
      {/* North-Indian chart frame */}
      <g fill="none" stroke="var(--line-strong)" strokeWidth="1">
        <rect x="30" y="30" width="240" height="240" rx="6" />
        <path d="M30 30 L270 270 M270 30 L30 270 M150 30 L30 150 L150 270 L270 150 Z" />
      </g>
      {/* Constellation */}
      <g stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.7">
        {links.map(([a, b]) => <line key={`${a}-${b}`} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} />)}
      </g>
      <g fill="var(--ink)">
        {stars.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
      <circle cx="150" cy="150" r="5" fill="var(--accent)" />
      <circle cx="150" cy="150" r="11" fill="none" stroke="var(--accent)" strokeOpacity="0.4" />
    </svg>
  );
}
