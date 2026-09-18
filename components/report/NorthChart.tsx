import { SIGNS } from "@/src/astro/signs";
import { signLabel, planetAbbrLabel } from "@/src/astro/i18n";
import type { Language } from "@/src/reports/types";

interface Props {
  lagna: string;
  d1: Record<string, string>;
  title: string;
  lang?: Language;
}

/** North-Indian style D1 chart. House 1 is the top diamond; signs rotate anticlockwise from the Lagna. */
export function NorthChart({ lagna, d1, title, lang = "en" }: Props) {
  const lagnaIdx = SIGNS.indexOf(lagna as (typeof SIGNS)[number]);
  // House centres (x, y) for a 300×300 board, houses 1..12 anticlockwise from the top diamond.
  const centres: [number, number][] = [
    [150, 75], [75, 38], [38, 75], [75, 150], [38, 225], [75, 262],
    [150, 225], [225, 262], [262, 225], [225, 150], [262, 75], [225, 38],
  ];
  const houses = centres.map(([cx, cy], i) => {
    const signIdx = (lagnaIdx + i) % 12;
    const planets = Object.entries(d1)
      .filter(([p, s]) => p !== "Ascendant" && SIGNS.indexOf(s as (typeof SIGNS)[number]) === signIdx)
      .map(([p]) => planetAbbrLabel(p, lang));
    return { cx, cy, signNum: signIdx + 1, planets, house: i + 1 };
  });

  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={title} className="mx-auto w-full max-w-[320px] h-auto">
      <rect x="1" y="1" width="298" height="298" rx="6" fill="var(--surface)" stroke="var(--line-strong)" />
      <g fill="none" stroke="var(--line-strong)" strokeWidth="1">
        <path d="M1 1 L299 299 M299 1 L1 299 M150 1 L1 150 L150 299 L299 150 Z" />
      </g>
      {houses.map((h) => (
        <g key={h.house}>
          <text x={h.cx} y={h.cy - (h.planets.length ? 14 : 0)} textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="var(--font-sans)">{h.signNum}</text>
          {h.planets.length > 0 && (
            <text x={h.cx} y={h.cy + 6} textAnchor="middle" fontSize="11" fontWeight="600" fill={h.house === 1 ? "var(--accent)" : "var(--ink)"} fontFamily="var(--font-sans)">
              {h.planets.join(" ")}
            </text>
          )}
        </g>
      ))}
      <text x="150" y="154" textAnchor="middle" fontSize="10" fill="var(--accent)" fontFamily="var(--font-display)" fontStyle="italic">{signLabel(lagna, lang)}</text>
    </svg>
  );
}
