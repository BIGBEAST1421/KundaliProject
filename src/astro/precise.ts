import type { Chart } from "./chart";
import { SIGNS, SIGN_LORDS, getSignIndex, type Body, type Planet, type Sign } from "./signs";
import { getNakshatra, type Nakshatra } from "./nakshatras";

/** Degrees → D°M'S" string, e.g. 14°27'53". */
export function toDMS(deg: number): string {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  let m = Math.floor(mFloat);
  let s = Math.round((mFloat - m) * 60);
  if (s === 60) { s = 0; m += 1; }
  return `${d}°${String(m).padStart(2, "0")}'${String(s).padStart(2, "0")}"`;
}

/** Ruler of a house counted from the Lagna sign. */
export function houseLord(house: number, lagnaSign: Sign): Planet {
  const idx = (SIGNS.indexOf(lagnaSign) + house - 1) % 12;
  return SIGN_LORDS[SIGNS[idx]];
}

/** Sign occupying a house from the Lagna. */
export function houseSign(house: number, lagnaSign: Sign): Sign {
  return SIGNS[(SIGNS.indexOf(lagnaSign) + house - 1) % 12];
}

export function houseLords(chart: Chart): Record<number, Planet> {
  const out: Record<number, Planet> = {};
  for (let h = 1; h <= 12; h++) out[h] = houseLord(h, chart.lagna);
  return out;
}

/** Houses a planet rules in this chart (1–2 houses; Rahu/Ketu none). */
export function housesRuledBy(planet: Planet, lagnaSign: Sign): number[] {
  const out: number[] = [];
  for (let h = 1; h <= 12; h++) if (houseLord(h, lagnaSign) === planet) out.push(h);
  return out;
}

export type RetroStatus = "direct" | "retrograde" | "always-retrograde" | "never";

export interface PlanetDetail {
  body: Body;
  longitude: number;
  sign: Sign;
  degInSign: number;
  dms: string;
  house: number;
  nakshatra: Nakshatra;
  retro: RetroStatus;
  speed: number;
}

export function retroStatus(body: Body, speed: number): RetroStatus {
  if (body === "Rahu" || body === "Ketu") return "always-retrograde";
  if (body === "Sun" || body === "Moon" || body === "Ascendant") return "never";
  return speed < 0 ? "retrograde" : "direct";
}

/** Precise placement for every planet and the Lagna. */
export function planetDetails(chart: Chart): PlanetDetail[] {
  const bodies = Object.keys(chart.longitudes) as Body[];
  return bodies.map((body) => {
    const lon = chart.longitudes[body];
    const degInSign = lon % 30;
    return {
      body,
      longitude: lon,
      sign: SIGNS[getSignIndex(lon)],
      degInSign: Math.round(degInSign * 10000) / 10000,
      dms: toDMS(degInSign),
      house: chart.houseOf[body],
      nakshatra: getNakshatra(lon),
      retro: retroStatus(body, chart.speeds[body] ?? 0),
      speed: chart.speeds[body] ?? 0,
    };
  });
}

/** Planets occupying each house (1..12). */
export function planetsInHouses(chart: Chart): Record<number, Planet[]> {
  const out: Record<number, Planet[]> = {};
  for (let h = 1; h <= 12; h++) out[h] = [];
  for (const [body, h] of Object.entries(chart.houseOf)) if (body !== "Ascendant") out[h].push(body as Planet);
  return out;
}
