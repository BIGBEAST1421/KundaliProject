/**
 * Mangal (Manglik) Dosha — the single check used by the report header, the Yogas tab, the
 * marriage rules and kundali matching, so they can never disagree.
 *
 * Convention (North Indian, as printed by classical patrika software): Mars in house 1, 4, 7, 8
 * or 12, counted from the Lagna AND from the Moon ("लग्ने व्यये च पाताले जामित्रे चाष्टमे कुजे").
 * The 2nd house is a South Indian addition and is not counted. A placement is cancelled by the
 * classical exceptions below; the person is Manglik only if some placement is left uncancelled.
 */
import type { Chart } from "./chart";
import type { Sign } from "./signs";
import { getSignIndex } from "./signs";
import { getDignity } from "./dignity";
import { aspects, conjunct } from "./aspects";

export const MANGAL_HOUSES: ReadonlySet<number> = new Set([1, 4, 7, 8, 12]);

/** Mars in this house and sign is classically exempt from the dosha. */
const HOUSE_SIGN_EXEMPTIONS: Record<number, Sign[]> = {
  1: ["Aries"],
  4: ["Aries", "Scorpio"],
  7: ["Cancer", "Capricorn"],
  8: ["Sagittarius", "Pisces"],
  12: ["Taurus", "Libra"],
};

export interface MangalDosha {
  /** Effective verdict: a Manglik placement exists and is not cancelled. */
  isManglik: boolean;
  /** House of Mars from the Lagna. */
  marsHouse: number;
  marsHouseFromMoon: number;
  fromLagna: boolean;
  fromMoon: boolean;
  /** Mars sits in a Manglik house from the Lagna or the Moon (before cancellations). */
  present: boolean;
  /** Present, but every Manglik placement is cancelled. */
  cancelled: boolean;
  reasons: string[];
}

function exemptions(chart: Chart, house: number): string[] {
  const sign = chart.d1.Mars;
  const out: string[] = [];
  const dig = getDignity("Mars", sign, chart.degreesInSign.Mars);
  if (dig === "own" || dig === "exalted" || dig === "moolatrikona") out.push(`Mars is in its own or exalted sign (${sign})`);
  if (HOUSE_SIGN_EXEMPTIONS[house]?.includes(sign)) out.push(`Mars in the ${house}${house === 1 ? "st" : "th"} in ${sign} is classically exempt`);
  if (sign === "Leo" || sign === "Aquarius") out.push("Mars in Leo or Aquarius is traditionally exempt");
  if (conjunct(chart, "Mars", "Jupiter") || aspects(chart, "Jupiter", "Mars")) out.push("Jupiter joins or aspects Mars");
  if (conjunct(chart, "Mars", "Moon")) out.push("the Moon is with Mars");
  return out;
}

export function checkMangalDosha(chart: Chart): MangalDosha {
  const marsHouse = chart.houseOf.Mars;
  const marsHouseFromMoon = ((getSignIndex(chart.longitudes.Mars) - getSignIndex(chart.longitudes.Moon) + 12) % 12) + 1;
  const fromLagna = MANGAL_HOUSES.has(marsHouse);
  const fromMoon = MANGAL_HOUSES.has(marsHouseFromMoon);

  const placements = [
    ...(fromLagna ? [{ label: "from the Lagna", house: marsHouse }] : []),
    ...(fromMoon ? [{ label: "from the Moon", house: marsHouseFromMoon }] : []),
  ].map((p) => ({ ...p, why: exemptions(chart, p.house) }));

  const present = placements.length > 0;
  const cancelled = present && placements.every((p) => p.why.length > 0);
  const reasons = placements.flatMap((p) => p.why.map((w) => `${w} (Mars in the ${p.house}${p.house === 1 ? "st" : "th"} ${p.label})`));
  return { isManglik: present && !cancelled, marsHouse, marsHouseFromMoon, fromLagna, fromMoon, present, cancelled, reasons };
}
