import { SIGNS, type Sign, normalizeDegrees } from "./signs";
import { getD10Sign } from "./d10";
import type { Chart } from "./chart";
import type { Body } from "./signs";

/** Navamsa (D9): 3°20′ parts; movable signs start from themselves, fixed from the 9th, dual from the 5th. */
export function getD9Sign(longitude: number): Sign {
  const lon = normalizeDegrees(longitude);
  const signNum = Math.floor(lon / 30);
  const part = Math.floor((lon % 30) / (30 / 9));
  const type = signNum % 3; // 0 movable, 1 fixed, 2 dual
  const start = type === 0 ? signNum : type === 1 ? (signNum + 8) % 12 : (signNum + 4) % 12;
  return SIGNS[(start + part) % 12];
}

/** Saptamsa (D7): 7 parts of 4°17′; odd signs count from themselves, even from the 7th. */
export function getD7Sign(longitude: number): Sign {
  const lon = normalizeDegrees(longitude);
  const signNum = Math.floor(lon / 30);
  const part = Math.floor((lon % 30) / (30 / 7));
  const start = signNum % 2 === 0 ? signNum : (signNum + 6) % 12;
  return SIGNS[(start + part) % 12];
}

export type VargaName = "D1" | "D7" | "D9" | "D10";

export interface Varga {
  name: VargaName;
  signs: Record<Body, Sign>;
  lagna: Sign;
  houseOf: Record<Body, number>;
}

export function vargaChart(chart: Chart, name: VargaName): Varga {
  const fn = name === "D9" ? getD9Sign : name === "D7" ? getD7Sign : name === "D10" ? getD10Sign : (l: number) => SIGNS[Math.floor(normalizeDegrees(l) / 30)];
  const signs = {} as Record<Body, Sign>;
  for (const [b, lon] of Object.entries(chart.longitudes)) signs[b as Body] = fn(lon);
  const lagna = signs.Ascendant;
  const li = SIGNS.indexOf(lagna);
  const houseOf = {} as Record<Body, number>;
  for (const [b, s] of Object.entries(signs)) houseOf[b as Body] = ((SIGNS.indexOf(s) - li + 12) % 12) + 1;
  return { name, signs, lagna, houseOf };
}
