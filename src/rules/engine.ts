import type { Chart } from "@/src/astro/chart";
import type { Planet } from "@/src/astro/signs";
import { getDignity } from "@/src/astro/dignity";
import { houseLord } from "@/src/astro/precise";
import { aspectedHouses, conjunct } from "@/src/astro/aspects";
import type { Yoga } from "@/src/astro/yogas";
import type { PlanetStrength } from "@/src/astro/strength";
import { confidenceBand } from "@/src/astro/strength";
import type { Varga } from "@/src/astro/varga";
import type { Condition, FiredRule, Rule } from "./types";

export interface RuleFacts {
  chart: Chart;
  yogas: Yoga[];
  strengths: PlanetStrength[];
  vargas: { D9: Varga; D10: Varga };
}

const ord = (n: number) => `${n}${["th", "st", "nd", "rd"][(n % 10 > 3 || Math.floor((n % 100) / 10) === 1) ? 0 : n % 10]}`;

/** Evaluate one condition; returns a trace string when true, null when false. */
export function check(c: Condition, f: RuleFacts): string | null {
  const { chart } = f;
  switch (c.type) {
    case "planetInHouse": return c.houses.includes(chart.houseOf[c.planet]) ? `${c.planet} is in the ${ord(chart.houseOf[c.planet])} house` : null;
    case "planetInSign": return c.signs.includes(chart.d1[c.planet]) ? `${c.planet} is in ${chart.d1[c.planet]}` : null;
    case "planetDignity": {
      const d = getDignity(c.planet, chart.d1[c.planet], chart.degreesInSign[c.planet]);
      return c.in.includes(d) ? `${c.planet} is ${d} in ${chart.d1[c.planet]}` : null;
    }
    case "planetWith": return conjunct(chart, c.a, c.b) ? `${c.a} and ${c.b} are together in the ${ord(chart.houseOf[c.a])} house` : null;
    case "houseLordInHouse": {
      const lord = houseLord(c.house, chart.lagna);
      return c.inHouses.includes(chart.houseOf[lord]) ? `${lord}, lord of the ${ord(c.house)}, sits in the ${ord(chart.houseOf[lord])}` : null;
    }
    case "houseLordDignity": {
      const lord = houseLord(c.house, chart.lagna);
      const d = getDignity(lord, chart.d1[lord], chart.degreesInSign[lord]);
      return c.in.includes(d) ? `${lord}, lord of the ${ord(c.house)}, is ${d}` : null;
    }
    case "houseLordIs": {
      const lord = houseLord(c.house, chart.lagna);
      return c.planets.includes(lord) ? `${lord} rules the ${ord(c.house)} house` : null;
    }
    case "houseOccupiedBy": {
      const found = c.anyOf.filter((p) => chart.houseOf[p] === c.house);
      return found.length ? `${found.join(" and ")} occupy the ${ord(c.house)} house` : null;
    }
    case "houseEmptyOf": {
      const found = c.planets.filter((p) => chart.houseOf[p] === c.house);
      return found.length === 0 ? `no ${c.planets.length === 5 ? "malefic" : "listed planet"} sits in the ${ord(c.house)} house` : null;
    }
    case "aspect": {
      const houses = aspectedHouses(c.from, chart.houseOf[c.from]).map((h) => h.house);
      if (c.toHouse != null) return houses.includes(c.toHouse) ? `${c.from} aspects the ${ord(c.toHouse)} house` : null;
      if (c.toPlanet) return houses.includes(chart.houseOf[c.toPlanet]) ? `${c.from} aspects ${c.toPlanet}` : null;
      return null;
    }
    case "yoga": {
      const y = f.yogas.find((x) => x.key === c.key);
      if (!y) return null;
      if (c.present != null && y.present !== c.present) return null;
      if (c.cancelled != null && y.cancelled !== c.cancelled) return null;
      return `${y.name} is ${y.present ? (y.cancelled ? "present but cancelled" : "present") : "absent"}`;
    }
    case "dashaLord": {
      const md = chart.dasha.mahadasha as Planet, ad = chart.dasha.antardasha as Planet;
      const hitM = c.level !== "antar" && c.planets.includes(md);
      const hitA = c.level !== "maha" && c.planets.includes(ad);
      return hitM ? `you are in the ${md} Mahadasha` : hitA ? `you are in the ${ad} Antardasha` : null;
    }
    case "vargaPlanetInHouse": {
      const v = f.vargas[c.varga];
      return c.houses.includes(v.houseOf[c.planet]) ? `in ${c.varga}, ${c.planet} is in the ${ord(v.houseOf[c.planet])} house` : null;
    }
    case "vargaHouseLordInHouse": {
      const v = f.vargas[c.varga];
      const lord = houseLord(c.house, v.lagna);
      return c.inHouses.includes(v.houseOf[lord]) ? `in ${c.varga}, the ${ord(c.house)} lord ${lord} sits in the ${ord(v.houseOf[lord])}` : null;
    }
    case "planetStrength": {
      const s = f.strengths.find((x) => x.planet === c.planet)?.score ?? 0;
      if (c.min != null && s < c.min) return null;
      if (c.max != null && s > c.max) return null;
      return `${c.planet} strength is ${s}/100`;
    }
    case "not": return check(c.condition, f) === null ? "(condition absent)" : null;
  }
}

/** Planets a condition refers to, used to pick key planets for confidence. */
function planetsOf(c: Condition, chart: Chart): Planet[] {
  switch (c.type) {
    case "planetInHouse": case "planetInSign": case "planetDignity": case "planetStrength": case "vargaPlanetInHouse": return [c.planet];
    case "planetWith": return [c.a, c.b];
    case "houseLordInHouse": case "houseLordDignity": case "houseLordIs": return [houseLord(c.house, chart.lagna)];
    case "aspect": return [c.from];
    default: return [];
  }
}

const HEDGE: Record<FiredRule["confidence"], string> = {
  direct: "This indicates",
  moderate: "This suggests",
  soft: "This may point to",
};

export function evaluate(rules: Rule[], f: RuleFacts): FiredRule[] {
  const fired: FiredRule[] = [];
  for (const r of rules) {
    const because: string[] = [];
    let ok = true;
    for (const c of r.conditions) {
      const t = check(c, f);
      if (t === null) { ok = false; break; }
      if (t !== "(condition absent)") because.push(t);
    }
    if (!ok) continue;
    const keyPlanets = r.keyPlanets ?? [...new Set(r.conditions.flatMap((c) => planetsOf(c, f.chart)))];
    const scores = keyPlanets.map((p) => f.strengths.find((s) => s.planet === p)?.score ?? 50);
    const minScore = scores.length ? Math.min(...scores) : 60;
    const confidence = confidenceBand(minScore);
    // Hedge more softly for concerns so the tone is careful, never alarming.
    const prefix = r.positive ? HEDGE[confidence] : confidence === "direct" ? "This points to" : confidence === "moderate" ? "This can bring" : "This may sometimes bring";
    const text = `${prefix} ${r.text.charAt(0).toLowerCase()}${r.text.slice(1)}`;
    fired.push({ id: r.id, domain: r.domain, title: r.title, text, weight: r.weight, positive: r.positive, confidence, keyPlanets, because });
  }
  return fired.sort((a, b) => b.weight - a.weight || Number(b.positive) - Number(a.positive));
}
