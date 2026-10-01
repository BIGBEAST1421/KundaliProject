/**
 * Lal Kitab planetary debts (rinanubandhan). Each debt is a bespoke boolean check — like
 * `src/astro/yogas.ts` — rather than the generic AND-only `Condition[]` rule DSL, because the
 * classical conditions for a debt are naturally an OR of a few affliction patterns.
 *
 * REVIEW FLAG: as with the sleeping/awake table in `status.ts`, the exact classical conditions
 * for each debt vary somewhat between Lal Kitab sources. The versions below are a commonly
 * cited, conservative synthesis — kept here, one function per debt, specifically so they can be
 * reviewed and adjusted independently of everything else in this feature.
 */
import type { Chart } from "../chart";
import type { Planet } from "../signs";
import { getDignity } from "../dignity";
import { conjunct, aspects } from "../aspects";

export type DebtKey = "pitra" | "matri" | "deva" | "stri";

export interface LalKitabDebt {
  key: DebtKey;
  name: string;
  present: boolean;
  participants: Planet[];
  houses: number[];
  activeInDasha: boolean;
  reason: string;
}

function activeInDasha(chart: Chart, planets: Planet[]): boolean {
  const md = chart.dasha.mahadasha as Planet, ad = chart.dasha.antardasha as Planet;
  return planets.includes(md) || planets.includes(ad);
}

function dignityOf(chart: Chart, p: Planet) {
  return getDignity(p, chart.d1[p], chart.degreesInSign[p]);
}

/** Pitra Rin — ancestral/paternal debt. Classically tied to an afflicted Sun. */
function pitraRin(chart: Chart): LalKitabDebt {
  const sunSaturn = conjunct(chart, "Sun", "Saturn");
  const sunRahu = conjunct(chart, "Sun", "Rahu");
  const saturnAspectsSun = aspects(chart, "Saturn", "Sun");
  const present = sunSaturn || sunRahu || saturnAspectsSun;
  const participants: Planet[] = present ? ["Sun", ...(sunSaturn || saturnAspectsSun ? (["Saturn"] as Planet[]) : []), ...(sunRahu ? (["Rahu"] as Planet[]) : [])] : [];
  const reason = sunSaturn ? "Sun and Saturn sit together" : sunRahu ? "Sun and Rahu sit together" : saturnAspectsSun ? "Saturn aspects the Sun" : "no Sun-Saturn/Rahu affliction found";
  return { key: "pitra", name: "Pitra Rin", present, participants, houses: present ? [chart.houseOf.Sun] : [], activeInDasha: activeInDasha(chart, participants), reason };
}

/** Matri Rin — maternal debt. Classically tied to an afflicted Moon. */
function matriRin(chart: Chart): LalKitabDebt {
  const moonRahu = conjunct(chart, "Moon", "Rahu");
  const moonKetu = conjunct(chart, "Moon", "Ketu");
  const saturnAspectsMoon = aspects(chart, "Saturn", "Moon");
  const present = moonRahu || moonKetu || saturnAspectsMoon;
  const participants: Planet[] = present ? ["Moon", ...(moonRahu ? (["Rahu"] as Planet[]) : []), ...(moonKetu ? (["Ketu"] as Planet[]) : []), ...(saturnAspectsMoon ? (["Saturn"] as Planet[]) : [])] : [];
  const reason = moonRahu ? "Moon and Rahu sit together" : moonKetu ? "Moon and Ketu sit together" : saturnAspectsMoon ? "Saturn aspects the Moon" : "no Moon-node/Saturn affliction found";
  return { key: "matri", name: "Matri Rin", present, participants, houses: present ? [chart.houseOf.Moon] : [], activeInDasha: activeInDasha(chart, participants), reason };
}

/** Deva Rin — debt to the divine/teachers. Classically tied to an afflicted Jupiter. */
function devaRin(chart: Chart): LalKitabDebt {
  const jupiterRahu = conjunct(chart, "Jupiter", "Rahu");
  const jupiterKetu = conjunct(chart, "Jupiter", "Ketu");
  const jupiterDebilitated = dignityOf(chart, "Jupiter") === "debilitated";
  const present = jupiterRahu || jupiterKetu || jupiterDebilitated;
  const participants: Planet[] = present ? ["Jupiter", ...(jupiterRahu ? (["Rahu"] as Planet[]) : []), ...(jupiterKetu ? (["Ketu"] as Planet[]) : [])] : [];
  const reason = jupiterRahu ? "Jupiter and Rahu sit together" : jupiterKetu ? "Jupiter and Ketu sit together" : jupiterDebilitated ? "Jupiter is debilitated" : "no Jupiter-node affliction or debilitation found";
  return { key: "deva", name: "Deva Rin", present, participants, houses: present ? [chart.houseOf.Jupiter] : [], activeInDasha: activeInDasha(chart, participants), reason };
}

/** Stri Rin — debt connected to women, from past-life conduct. Classically tied to an afflicted Venus. */
function striRin(chart: Chart): LalKitabDebt {
  const venusMars = conjunct(chart, "Venus", "Mars");
  const venusRahu = conjunct(chart, "Venus", "Rahu");
  const venusWeak = (["debilitated", "enemy"] as const).includes(dignityOf(chart, "Venus") as "debilitated" | "enemy");
  const present = venusMars || venusRahu || venusWeak;
  const participants: Planet[] = present ? ["Venus", ...(venusMars ? (["Mars"] as Planet[]) : []), ...(venusRahu ? (["Rahu"] as Planet[]) : [])] : [];
  const reason = venusMars ? "Venus and Mars sit together" : venusRahu ? "Venus and Rahu sit together" : venusWeak ? "Venus is in a weak dignity" : "no Venus affliction found";
  return { key: "stri", name: "Stri Rin", present, participants, houses: present ? [chart.houseOf.Venus] : [], activeInDasha: activeInDasha(chart, participants), reason };
}

export function detectDebts(chart: Chart): LalKitabDebt[] {
  return [pitraRin(chart), matriRin(chart), devaRin(chart), striRin(chart)];
}
