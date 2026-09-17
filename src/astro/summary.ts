import type { Chart } from "./chart";
import type { Body } from "./signs";

/** Compact plain-text chart summary for the AI prompt. */
export function buildChartSummary(c: Chart): string {
  const bodies = (Object.keys(c.d1) as Body[]).filter((b) => b !== "Ascendant");
  const lines = [
    `Lagna (Ascendant): ${c.lagna} ${c.lagnaDegree}°`,
    `Moon Sign (Rashi): ${c.rashi}`,
    `Sun Sign: ${c.sunSign}`,
    `Moon Nakshatra: ${c.nakshatra.name} Pada ${c.nakshatra.pada} (Lord: ${c.nakshatra.lord})`,
    `Lagna Nakshatra: ${c.lagnaNakshatra.name} Pada ${c.lagnaNakshatra.pada}`,
    "",
    "D1 Planet Positions (sign | house):",
    ...bodies.map((b) => `  ${b}: ${c.d1[b]} ${c.degreesInSign[b]}° | House ${c.houseOf[b]}`),
    "",
    `D10 (Dashamsha) Lagna: ${c.d10Lagna}`,
    "D10 Planet Placements (sign | house):",
    ...bodies.map((b) => `  ${b}: ${c.d10[b]} | D10 House ${c.d10HouseOf[b]}`),
    "",
    `Current Mahadasha: ${c.dasha.mahadasha} (${c.dasha.mahadashaStart} – ${c.dasha.mahadashaEnd})`,
    `Current Antardasha: ${c.dasha.antardasha} (${c.dasha.antardashaStart} – ${c.dasha.antardashaEnd})`,
  ];
  return lines.join("\n");
}
