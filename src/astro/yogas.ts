/**
 * Classical yoga / dosha detection. Every check returns presence AND cancellation status,
 * a 1–3 grade from the dignity of participants, and whether the current dasha activates it.
 */
import type { Chart } from "./chart";
import { SIGN_LORDS, type Planet } from "./signs";
import { getDignity, type Dignity } from "./dignity";
import { houseLord, housesRuledBy } from "./precise";
import { aspects, conjunct, mutualAspect } from "./aspects";
import { KENDRA, TRIKONA, DUSTHANA } from "./strength";

export type YogaKind = "yoga" | "dosha" | "rajayoga";

export interface Yoga {
  key: string;
  name: string;
  kind: YogaKind;
  present: boolean;
  cancelled: boolean;
  cancellationReasons: string[];
  /** 1 weak · 2 moderate · 3 strong (dignity of participants). */
  grade: 1 | 2 | 3;
  participants: Planet[];
  houses: number[];
  /** True when the current Mahadasha or Antardasha lord takes part. */
  activeInDasha: boolean;
  /** Plain-language one-liner: what it is and what it tends to mean. */
  summary: string;
  /** How it formed in this chart. */
  reason: string;
}

const GOOD: Dignity[] = ["exalted", "moolatrikona", "own", "friendly"];
const BAD: Dignity[] = ["enemy", "debilitated"];

function dignityOf(chart: Chart, p: Planet): Dignity {
  return getDignity(p, chart.d1[p], chart.degreesInSign[p]);
}

function gradeFrom(chart: Chart, planets: Planet[]): 1 | 2 | 3 {
  const ds = planets.map((p) => dignityOf(chart, p));
  if (ds.some((d) => d === "debilitated")) return 1;
  if (ds.every((d) => GOOD.includes(d))) return 3;
  if (ds.some((d) => BAD.includes(d))) return 1;
  return 2;
}

function activeInDasha(chart: Chart, planets: Planet[]): boolean {
  const md = chart.dasha.mahadasha as Planet, ad = chart.dasha.antardasha as Planet;
  return planets.includes(md) || planets.includes(ad);
}

function houseDistance(fromHouse: number, toHouse: number): number {
  return ((toHouse - fromHouse + 12) % 12) + 1;
}

function make(chart: Chart, base: Omit<Yoga, "grade" | "activeInDasha">): Yoga {
  return { ...base, grade: gradeFrom(chart, base.participants), activeInDasha: activeInDasha(chart, base.participants) };
}

// ── Classical yogas ──────────────────────────────────────────────────────

export function gajakesari(chart: Chart): Yoga {
  const d = houseDistance(chart.houseOf.Moon, chart.houseOf.Jupiter);
  const present = KENDRA.has(d);
  const cancelled = present && (dignityOf(chart, "Jupiter") === "debilitated" || DUSTHANA.has(chart.houseOf.Jupiter));
  return make(chart, {
    key: "gajakesari", name: "Gajakesari Yoga", kind: "yoga", present, cancelled,
    cancellationReasons: cancelled ? ["Jupiter is weak (debilitated or in a difficult house), so the yoga gives less"] : [],
    participants: ["Moon", "Jupiter"], houses: [chart.houseOf.Moon, chart.houseOf.Jupiter],
    summary: "Jupiter in a kendra from the Moon. Classically linked to a good name, wisdom and support from respected people.",
    reason: present ? `Jupiter sits ${d === 1 ? "with" : `${d} houses from`} the Moon (a kendra position).` : "Jupiter is not in a kendra from the Moon.",
  });
}

export function kemadruma(chart: Chart): Yoga {
  const moonH = chart.houseOf.Moon;
  const prev = ((moonH - 2 + 12) % 12) + 1, next = (moonH % 12) + 1;
  const others = (Object.keys(chart.houseOf) as (keyof typeof chart.houseOf)[]).filter((b) => !["Moon", "Sun", "Rahu", "Ketu", "Ascendant"].includes(b));
  const flanked = others.some((b) => chart.houseOf[b] === prev || chart.houseOf[b] === next);
  const present = !flanked;
  const reasons: string[] = [];
  if (present) {
    if (others.some((b) => chart.houseOf[b] === moonH)) reasons.push("a planet sits with the Moon");
    if (KENDRA.has(moonH)) reasons.push("the Moon is in a kendra from the Lagna");
    if (aspects(chart, "Jupiter", "Moon")) reasons.push("Jupiter aspects the Moon");
    if (others.some((b) => KENDRA.has(houseDistance(moonH, chart.houseOf[b])))) reasons.push("planets occupy kendras from the Moon");
  }
  return make(chart, {
    key: "kemadruma", name: "Kemadruma Dosha", kind: "dosha", present, cancelled: present && reasons.length > 0,
    cancellationReasons: reasons, participants: ["Moon"], houses: [moonH],
    summary: "No planets on either side of the Moon. Traditionally read as periods of loneliness or lack of support, unless cancelled.",
    reason: present ? "No planet (other than Sun or the nodes) sits in the houses next to the Moon." : "Planets flank the Moon.",
  });
}

export function budhaditya(chart: Chart): Yoga {
  const present = conjunct(chart, "Sun", "Mercury");
  const cancelled = present && Math.abs(((chart.longitudes.Sun - chart.longitudes.Mercury + 540) % 360) - 180) < 3;
  return make(chart, {
    key: "budhaditya", name: "Budhaditya Yoga", kind: "yoga", present, cancelled,
    cancellationReasons: cancelled ? ["Mercury is too close to the Sun (deeply combust)"] : [],
    participants: ["Sun", "Mercury"], houses: [chart.houseOf.Sun],
    summary: "Sun and Mercury together. Linked to a sharp mind, clear speech and success through intellect.",
    reason: present ? `Sun and Mercury share house ${chart.houseOf.Sun}.` : "Sun and Mercury are in different houses.",
  });
}

export function chandraMangal(chart: Chart): Yoga {
  const present = conjunct(chart, "Moon", "Mars") || mutualAspect(chart, "Moon", "Mars");
  return make(chart, {
    key: "chandra-mangal", name: "Chandra-Mangal Yoga", kind: "yoga", present, cancelled: false, cancellationReasons: [],
    participants: ["Moon", "Mars"], houses: [chart.houseOf.Moon, chart.houseOf.Mars],
    summary: "Moon and Mars joined or facing each other. Drive to earn and act, sometimes with an emotional edge.",
    reason: present ? "Moon and Mars are together or in mutual aspect." : "Moon and Mars are not connected.",
  });
}

export function dhana(chart: Chart): Yoga {
  const l2 = houseLord(2, chart.lagna), l11 = houseLord(11, chart.lagna), l1 = houseLord(1, chart.lagna), l9 = houseLord(9, chart.lagna);
  const pairs: [Planet, Planet][] = [[l2, l11], [l1, l2], [l1, l11], [l9, l11], [l2, l9]];
  const hit = pairs.find(([a, b]) => a !== b && (conjunct(chart, a, b) || mutualAspect(chart, a, b) || exchanged(chart, a, b)));
  const present = !!hit;
  const parts = hit ? [...new Set(hit)] : [l2, l11];
  const cancelled = present && parts.some((p) => DUSTHANA.has(chart.houseOf[p]) && chart.houseOf[p] !== 6);
  return make(chart, {
    key: "dhana", name: "Dhana Yoga", kind: "yoga", present, cancelled,
    cancellationReasons: cancelled ? ["a wealth lord sits in the 8th or 12th house"] : [],
    participants: parts, houses: parts.map((p) => chart.houseOf[p]),
    summary: "Wealth-house lords (2nd, 11th, with 1st or 9th) working together. Earning capacity and savings tend to grow.",
    reason: hit ? `${hit[0]} (lord of ${housesRuledBy(hit[0], chart.lagna).join("/")}) and ${hit[1]} (lord of ${housesRuledBy(hit[1], chart.lagna).join("/")}) are connected.` : "The wealth lords are not connected.",
  });
}

function exchanged(chart: Chart, a: Planet, b: Planet): boolean {
  // Parivartana: a sits in a sign ruled by b and b sits in a sign ruled by a.
  return SIGN_LORDS[chart.d1[a]] === b && SIGN_LORDS[chart.d1[b]] === a;
}

export function manglik(chart: Chart): Yoga {
  const h = chart.houseOf.Mars, sign = chart.d1.Mars;
  const present = [1, 2, 4, 7, 8, 12].includes(h);
  const reasons: string[] = [];
  if (present) {
    const dig = dignityOf(chart, "Mars");
    if (dig === "own" || dig === "exalted" || dig === "moolatrikona") reasons.push(`Mars is in its own or exalted sign (${sign})`);
    if (conjunct(chart, "Mars", "Jupiter") || aspects(chart, "Jupiter", "Mars")) reasons.push("Jupiter joins or aspects Mars");
    if (conjunct(chart, "Mars", "Moon")) reasons.push("the Moon is with Mars");
    if (h === 2 && (sign === "Gemini" || sign === "Virgo")) reasons.push("Mars in the 2nd in a Mercury sign");
    if (h === 4 && (sign === "Aries" || sign === "Scorpio")) reasons.push("Mars in the 4th in its own sign");
    if (h === 7 && (sign === "Cancer" || sign === "Capricorn")) reasons.push("Mars in the 7th in Cancer or Capricorn");
    if (h === 8 && (sign === "Sagittarius" || sign === "Pisces")) reasons.push("Mars in the 8th in a Jupiter sign");
    if (h === 12 && (sign === "Taurus" || sign === "Libra")) reasons.push("Mars in the 12th in a Venus sign");
    if (h === 1 && sign === "Aries") reasons.push("Mars in the 1st in Aries");
    if ((sign === "Leo" || sign === "Aquarius")) reasons.push("Mars in Leo or Aquarius, traditionally exempt");
  }
  return make(chart, {
    key: "manglik", name: "Mangal Dosha", kind: "dosha", present, cancelled: present && reasons.length > 0,
    cancellationReasons: reasons, participants: ["Mars"], houses: [h],
    summary: "Mars in house 1, 2, 4, 7, 8 or 12. Traditionally checked before marriage; many classical conditions soften or cancel it.",
    reason: present ? `Mars is in house ${h} (${sign}).` : `Mars is in house ${h}, not a Manglik house.`,
  });
}

// ── Raj Yoga family ──────────────────────────────────────────────────────

function connected(chart: Chart, a: Planet, b: Planet): string | null {
  if (a === b) return null;
  if (conjunct(chart, a, b)) return "conjunction";
  if (exchanged(chart, a, b)) return "sign exchange (parivartana)";
  if (mutualAspect(chart, a, b)) return "mutual aspect";
  return null;
}

const HOW_RANK: Record<string, number> = { conjunction: 3, "sign exchange (parivartana)": 2, "mutual aspect": 1 };

export function kendraTrikonaRajaYoga(chart: Chart): Yoga {
  const kendraLords = [...new Set([...KENDRA].map((h) => houseLord(h, chart.lagna)))];
  const trikonaLords = [...new Set([...TRIKONA].map((h) => houseLord(h, chart.lagna)))];
  const pairs: { a: Planet; b: Planet; how: string; grade: number }[] = [];
  for (const a of kendraLords) for (const b of trikonaLords) {
    if (a === b) continue;
    const how = connected(chart, a, b);
    if (how) pairs.push({ a, b, how, grade: gradeFrom(chart, [a, b]) });
  }
  // Strongest pair first: connection type, then dignity grade.
  pairs.sort((x, y) => HOW_RANK[y.how] - HOW_RANK[x.how] || y.grade - x.grade);
  const found = pairs[0];
  const present = !!found;
  const parts = found ? [found.a, found.b] : [];
  const cancelled = present && parts.some((p) => DUSTHANA.has(chart.houseOf[p]) && chart.houseOf[p] !== 6);
  const describe = (x: typeof pairs[number]) => `${x.a} (lord of ${housesRuledBy(x.a, chart.lagna).join("/")}) and ${x.b} (lord of ${housesRuledBy(x.b, chart.lagna).join("/")}) by ${x.how}`;
  return make(chart, {
    key: "kendra-trikona", name: "Kendra-Trikona Raja Yoga", kind: "rajayoga", present, cancelled,
    cancellationReasons: cancelled ? ["the yoga forms in the 8th or 12th house, which weakens its results"] : [],
    participants: parts, houses: parts.map((p) => chart.houseOf[p]),
    summary: "A kendra lord (1, 4, 7, 10) joins a trikona lord (1, 5, 9). The core Raja Yoga: rise in status, authority and recognition, strongest during its planets' dashas.",
    reason: found
      ? `${describe(found)}.${pairs.length > 1 ? ` Also: ${pairs.slice(1).map(describe).join("; ")}.` : ""}`
      : "No kendra lord is linked to a trikona lord.",
  });
}

export function dharmaKarmadhipati(chart: Chart): Yoga {
  const l9 = houseLord(9, chart.lagna), l10 = houseLord(10, chart.lagna);
  const how = connected(chart, l9, l10);
  const present = !!how;
  return make(chart, {
    key: "dharma-karmadhipati", name: "Dharma-Karmadhipati Yoga", kind: "rajayoga", present, cancelled: false, cancellationReasons: [],
    participants: present ? [l9, l10] : [], houses: present ? [chart.houseOf[l9], chart.houseOf[l10]] : [],
    summary: "The 9th lord (fortune) and 10th lord (career) join forces. One of the strongest Raja Yogas for a respected, purposeful career.",
    reason: how ? `${l9} (9th lord) and ${l10} (10th lord) are linked by ${how}.` : `${l9} (9th lord) and ${l10} (10th lord) are not linked.`,
  });
}

export function viparitaRajaYoga(chart: Chart): Yoga {
  const dus = [6, 8, 12];
  const hits: { lord: Planet; of: number; inHouse: number }[] = [];
  for (const h of dus) {
    const lord = houseLord(h, chart.lagna);
    const inH = chart.houseOf[lord];
    if (dus.includes(inH) && inH !== h) hits.push({ lord, of: h, inHouse: inH });
  }
  const present = hits.length > 0;
  const parts = [...new Set(hits.map((x) => x.lord))];
  return make(chart, {
    key: "viparita", name: "Viparita Raja Yoga", kind: "rajayoga", present, cancelled: false, cancellationReasons: [],
    participants: parts, houses: hits.map((x) => x.inHouse),
    summary: "Lords of the difficult houses (6, 8, 12) sit in each other's houses. Gains arrive through reversals: setbacks that turn into unexpected advantage.",
    reason: present ? hits.map((x) => `${x.lord}, lord of the ${x.of}th, sits in the ${x.inHouse}th`).join("; ") + "." : "No dusthana lord sits in another dusthana.",
  });
}

export function neechaBhanga(chart: Chart): Yoga {
  const hits: { planet: Planet; reasons: string[] }[] = [];
  for (const p of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as Planet[]) {
    if (dignityOf(chart, p) !== "debilitated") continue;
    const reasons: string[] = [];
    const dispositor = SIGN_LORDS[chart.d1[p]];
    const kendraFromLagna = (q: Planet) => KENDRA.has(chart.houseOf[q]);
    const kendraFromMoon = (q: Planet) => KENDRA.has(houseDistance(chart.houseOf.Moon, chart.houseOf[q]));
    if (kendraFromLagna(dispositor) || kendraFromMoon(dispositor)) reasons.push(`${dispositor}, lord of its sign, is in a kendra`);
    // exaltation lord: the planet that is exalted in the sign where p is debilitated
    const exaltLord = (["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as Planet[]).find((q) => q !== p && getDignity(q, chart.d1[p], 15) === "exalted");
    if (exaltLord && (kendraFromLagna(exaltLord) || kendraFromMoon(exaltLord))) reasons.push(`${exaltLord}, exalted in that sign, is in a kendra`);
    if (conjunct(chart, p, dispositor) || aspects(chart, dispositor, p)) reasons.push(`${dispositor} joins or aspects it`);
    if (exchanged(chart, p, dispositor)) reasons.push(`it exchanges signs with ${dispositor}`);
    if (reasons.length) hits.push({ planet: p, reasons });
  }
  const present = hits.length > 0;
  return make(chart, {
    key: "neecha-bhanga", name: "Neecha Bhanga Raja Yoga", kind: "rajayoga", present, cancelled: false, cancellationReasons: [],
    participants: hits.map((h) => h.planet), houses: hits.map((h) => chart.houseOf[h.planet]),
    summary: "A debilitated planet has its weakness cancelled. Classically a rise from difficulty: early struggle in that planet's area becomes a strength.",
    reason: present ? hits.map((h) => `${h.planet} is debilitated in ${chart.d1[h.planet]} but ${h.reasons.join(", and ")}`).join(". ") + "." : "No debilitated planet has its debilitation cancelled.",
  });
}

// ── Aggregate ────────────────────────────────────────────────────────────

const KIND_ORDER: Record<YogaKind, number> = { rajayoga: 0, yoga: 1, dosha: 2 };

/** All checks, present-first, Raja Yogas first, then by dasha activation and grade. */
export function detectYogas(chart: Chart): Yoga[] {
  const all = [
    kendraTrikonaRajaYoga(chart), dharmaKarmadhipati(chart), viparitaRajaYoga(chart), neechaBhanga(chart),
    gajakesari(chart), budhaditya(chart), chandraMangal(chart), dhana(chart),
    manglik(chart), kemadruma(chart),
  ];
  return all.sort((a, b) =>
    Number(b.present) - Number(a.present) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
    Number(b.activeInDasha) - Number(a.activeInDasha) || b.grade - a.grade);
}

