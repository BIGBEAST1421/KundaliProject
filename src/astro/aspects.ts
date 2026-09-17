import type { Chart } from "./chart";
import { PLANETS, type Planet } from "./signs";
import { planetsInHouses } from "./precise";

/** Parashari full aspects by house distance (1 = same house). */
const SPECIAL: Partial<Record<Planet, number[]>> = { Mars: [4, 8], Jupiter: [5, 9], Saturn: [3, 10] };

export interface Aspect {
  from: Planet;
  fromHouse: number;
  toHouse: number;
  /** Planets sitting in the aspected house. */
  toPlanets: Planet[];
  special: boolean;
}

export function aspectedHouses(planet: Planet, fromHouse: number): { house: number; special: boolean }[] {
  const dists = [7, ...(SPECIAL[planet] ?? [])];
  return dists.map((d) => ({ house: ((fromHouse - 1 + d - 1) % 12) + 1, special: d !== 7 }));
}

export function computeAspects(chart: Chart): Aspect[] {
  const occ = planetsInHouses(chart);
  const out: Aspect[] = [];
  for (const p of PLANETS) {
    if (p === "Rahu" || p === "Ketu") continue; // nodes' aspects are debated; omitted for v1
    const fromHouse = chart.houseOf[p];
    for (const { house, special } of aspectedHouses(p, fromHouse)) {
      out.push({ from: p, fromHouse, toHouse: house, toPlanets: occ[house], special });
    }
  }
  return out;
}

/** Does `a` aspect the house where `b` sits? */
export function aspects(chart: Chart, a: Planet, b: Planet): boolean {
  return aspectedHouses(a, chart.houseOf[a]).some((x) => x.house === chart.houseOf[b]);
}

export function mutualAspect(chart: Chart, a: Planet, b: Planet): boolean {
  return aspects(chart, a, b) && aspects(chart, b, a);
}

export function conjunct(chart: Chart, a: Planet, b: Planet): boolean {
  return chart.houseOf[a] === chart.houseOf[b];
}
