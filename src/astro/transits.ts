import sweph from "sweph";
import { DateTime } from "luxon";
import type { Chart } from "./chart";
import { SIGNS, PLANETS, getSignIndex, type Planet, type Sign } from "./signs";
import { aspectedHouses } from "./aspects";
import { angularDistance } from "./dignity";

const { constants: C } = sweph;
const FLAG = C.SEFLG_SIDEREAL | C.SEFLG_MOSEPH | C.SEFLG_SPEED;
const IDS: Record<Exclude<Planet, "Ketu">, number> = {
  Sun: C.SE_SUN, Moon: C.SE_MOON, Mars: C.SE_MARS, Mercury: C.SE_MERCURY, Jupiter: C.SE_JUPITER, Venus: C.SE_VENUS, Saturn: C.SE_SATURN, Rahu: C.SE_MEAN_NODE,
};

export interface TransitPlanet {
  planet: Planet;
  longitude: number;
  sign: Sign;
  /** House from natal Lagna / natal Moon. */
  houseFromLagna: number;
  houseFromMoon: number;
  retrograde: boolean;
}

export interface TransitHit {
  transiting: Planet;
  natal: Planet;
  kind: "conjunction" | "aspect";
  orb?: number;
}

export interface Transits {
  date: string;
  planets: TransitPlanet[];
  sadeSati: null | { phase: "rising" | "peak" | "setting"; note: string };
  hits: TransitHit[];
  /** Intersections with the current dasha lords, ready for the AI and UI. */
  intersections: string[];
}

/** Sidereal positions for `date` (UTC noon by default). */
export function transitLongitudes(date: Date): Record<Planet, { lon: number; speed: number }> {
  const d = DateTime.fromJSDate(date, { zone: "utc" });
  const jd = sweph.julday(d.year, d.month, d.day, d.hour + d.minute / 60, C.SE_GREG_CAL);
  const out = {} as Record<Planet, { lon: number; speed: number }>;
  for (const p of PLANETS) {
    if (p === "Ketu") continue;
    const r = sweph.calc_ut(jd, IDS[p], FLAG);
    out[p] = { lon: r.data[0], speed: p === "Rahu" ? -1 : r.data[3] };
  }
  out.Ketu = { lon: (out.Rahu.lon + 180) % 360, speed: -1 };
  return out;
}

export function computeTransits(chart: Chart, date = new Date()): Transits {
  const pos = transitLongitudes(date);
  const lagnaIdx = chart.lagnaSignIndex;
  const moonIdx = getSignIndex(chart.longitudes.Moon);
  const planets: TransitPlanet[] = PLANETS.map((p) => {
    const si = getSignIndex(pos[p].lon);
    return {
      planet: p, longitude: Math.round(pos[p].lon * 10000) / 10000, sign: SIGNS[si],
      houseFromLagna: ((si - lagnaIdx + 12) % 12) + 1, houseFromMoon: ((si - moonIdx + 12) % 12) + 1,
      retrograde: pos[p].speed < 0,
    };
  });

  // Sade Sati: Saturn transiting 12th, 1st or 2nd from natal Moon.
  const sat = planets.find((p) => p.planet === "Saturn")!;
  const sadeSati = sat.houseFromMoon === 12 ? { phase: "rising" as const, note: "Saturn is in the 12th from your Moon: the first phase of Sade Sati, often felt as extra responsibility and quiet preparation." }
    : sat.houseFromMoon === 1 ? { phase: "peak" as const, note: "Saturn is on your natal Moon: the peak phase of Sade Sati, a time to simplify and stay disciplined." }
    : sat.houseFromMoon === 2 ? { phase: "setting" as const, note: "Saturn is in the 2nd from your Moon: the closing phase of Sade Sati, when lessons settle into stability." }
    : null;

  // Hits: transit conjunct a natal planet (≤3°) or aspecting the natal planet's house (slow planets only).
  const hits: TransitHit[] = [];
  const slow: Planet[] = ["Saturn", "Jupiter", "Rahu", "Ketu", "Mars"];
  for (const t of planets) {
    for (const n of PLANETS) {
      const orb = angularDistance(pos[t.planet].lon, chart.longitudes[n]);
      if (orb <= 3 && slow.includes(t.planet)) hits.push({ transiting: t.planet, natal: n, kind: "conjunction", orb: Math.round(orb * 10) / 10 });
      else if (slow.includes(t.planet) && t.planet !== "Rahu" && t.planet !== "Ketu" && aspectedHouses(t.planet, t.houseFromLagna).some((h) => h.house === chart.houseOf[n]) && t.planet !== n) {
        hits.push({ transiting: t.planet, natal: n, kind: "aspect" });
      }
    }
  }

  const md = chart.dasha.mahadasha as Planet, ad = chart.dasha.antardasha as Planet;
  const intersections: string[] = [];
  for (const h of hits) {
    if (h.natal === md || h.natal === ad || h.transiting === md || h.transiting === ad) {
      const role = [md, ad].includes(h.natal) ? `your ${h.natal === md ? "Mahadasha" : "Antardasha"} lord ${h.natal}` : `natal ${h.natal}`;
      intersections.push(`Transiting ${h.transiting} is ${h.kind === "conjunction" ? "sitting on" : "aspecting"} ${role} during the ${md}-${ad} period.`);
    }
  }
  if (sadeSati) intersections.push(sadeSati.note);
  const jup = planets.find((p) => p.planet === "Jupiter")!;
  if ([1, 5, 7, 9, 11].includes(jup.houseFromMoon)) intersections.push(`Jupiter is transiting the ${jup.houseFromMoon}th from your Moon, a supportive placement this year.`);

  return { date: DateTime.fromJSDate(date, { zone: "utc" }).toISODate() ?? "", planets, sadeSati, hits, intersections };
}
