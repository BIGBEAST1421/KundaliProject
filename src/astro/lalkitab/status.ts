import type { Chart } from "../chart";
import { PLANETS, type Planet } from "../signs";

export type PlanetStatus = "awake" | "sleeping" | "static";

/**
 * Lal Kitab's "sleeping / awake / static" (sota / jagrat / sthir) planet classification by
 * house placement (whole-sign house from Lagna — the same `chart.houseOf` numbering already
 * used throughout this app, since Lal Kitab's house assignment is not a different geometry,
 * just a different interpretive layer on top of it).
 *
 * A planet not listed under `awake` or `sleeping` for a given house defaults to "static".
 *
 * REVIEW FLAG: published Lal Kitab sources do not fully agree on the exact house lists per
 * planet. The table below is a good-faith, internally consistent synthesis of commonly cited
 * versions — it is the single place this data lives specifically so it can be checked against
 * a preferred authoritative reference and corrected without touching any other file. Treat any
 * "sleeping"/"awake" result as provisional until this table has been reviewed.
 */
export const PLANET_STATUS_HOUSES: Record<Planet, { awake: number[]; sleeping: number[] }> = {
  Sun: { awake: [1, 2, 9, 10], sleeping: [4, 8, 12] },
  Moon: { awake: [2, 5, 9], sleeping: [1, 4, 10] },
  Mars: { awake: [1, 3, 10, 11], sleeping: [4, 7, 8, 12] },
  Mercury: { awake: [2, 6, 8, 12], sleeping: [4, 5, 9] },
  Jupiter: { awake: [2, 5, 9, 11], sleeping: [3, 6, 8, 12] },
  Venus: { awake: [1, 4, 5, 11], sleeping: [2, 6, 7, 12] },
  Saturn: { awake: [3, 6, 11], sleeping: [1, 4, 7, 10] },
  Rahu: { awake: [3, 6, 11], sleeping: [1, 4, 7, 9] },
  Ketu: { awake: [3, 6, 11], sleeping: [1, 4, 7, 9] },
};

/** Per-planet Lal Kitab status, derived purely from each planet's whole-sign house. */
export function planetStatuses(chart: Chart): Record<Planet, PlanetStatus> {
  const out = {} as Record<Planet, PlanetStatus>;
  for (const p of PLANETS) {
    const house = chart.houseOf[p];
    const table = PLANET_STATUS_HOUSES[p];
    out[p] = table.awake.includes(house) ? "awake" : table.sleeping.includes(house) ? "sleeping" : "static";
  }
  return out;
}
