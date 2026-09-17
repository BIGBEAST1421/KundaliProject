/**
 * Ashta Koota (36-guna) marriage compatibility plus Mangal Dosha.
 * Simplified classical implementation — whole-rashi Varna/Vashya, no degree-level splits.
 */
import { SIGNS, SIGN_LORDS, type Planet, type Sign } from "./signs";
import { NAK_NAMES } from "./nakshatras";
import type { Chart } from "./chart";

export type KootaName = "Varna" | "Vashya" | "Tara" | "Yoni" | "Graha Maitri" | "Gana" | "Bhakoot" | "Nadi";

export interface Koota {
  name: KootaName;
  max: number;
  points: number;
  /** Short technical note, e.g. "Groom: Deva · Bride: Manushya". */
  note: string;
  /** Each side's raw value for side-by-side display. */
  boy: string;
  girl: string;
  /** True when this koota flags a classical dosha. */
  dosha: boolean;
}

export interface Guna {
  total: number;
  max: 36;
  verdict: string;
  kootas: Koota[];
  doshas: string[];
}

// 1. Varna
const VARNA_RANK: Record<Sign, number> = {
  Cancer: 4, Scorpio: 4, Pisces: 4, Aries: 3, Leo: 3, Sagittarius: 3,
  Taurus: 2, Virgo: 2, Capricorn: 2, Gemini: 1, Libra: 1, Aquarius: 1,
};
const VARNA_NAME: Record<number, string> = { 4: "Brahmin", 3: "Kshatriya", 2: "Vaishya", 1: "Shudra" };

// 2. Vashya
const VASHYA_GROUP: Record<Sign, string> = {
  Aries: "Chatushpada", Taurus: "Chatushpada", Leo: "Vanachara", Gemini: "Manava", Virgo: "Manava",
  Libra: "Manava", Aquarius: "Manava", Cancer: "Jalachara", Pisces: "Jalachara", Capricorn: "Jalachara",
  Scorpio: "Keeta", Sagittarius: "Chatushpada",
};
const pairKey = (a: string, b: string) => [a, b].sort().join("|");
const VASHYA_SCORE = new Map<string, number>([
  [pairKey("Chatushpada", "Manava"), 1], [pairKey("Chatushpada", "Jalachara"), 1],
  [pairKey("Chatushpada", "Vanachara"), 0], [pairKey("Chatushpada", "Keeta"), 1],
  [pairKey("Manava", "Jalachara"), 1], [pairKey("Manava", "Vanachara"), 0],
  [pairKey("Manava", "Keeta"), 1], [pairKey("Jalachara", "Vanachara"), 1],
  [pairKey("Jalachara", "Keeta"), 1], [pairKey("Vanachara", "Keeta"), 1],
]);

// 4. Yoni — indexed by nakshatra
const YONI: readonly [string, "M" | "F"][] = [
  ["Horse", "M"], ["Elephant", "M"], ["Sheep", "F"], ["Serpent", "M"], ["Serpent", "F"],
  ["Dog", "F"], ["Cat", "F"], ["Sheep", "M"], ["Cat", "M"], ["Rat", "M"],
  ["Rat", "F"], ["Cow", "F"], ["Buffalo", "F"], ["Tiger", "F"], ["Buffalo", "M"],
  ["Tiger", "M"], ["Deer", "F"], ["Deer", "M"], ["Dog", "M"], ["Monkey", "F"],
  ["Mongoose", "F"], ["Monkey", "M"], ["Lion", "F"], ["Horse", "F"], ["Lion", "M"],
  ["Cow", "M"], ["Elephant", "F"],
];
const YONI_ENEMIES = new Set([
  pairKey("Horse", "Buffalo"), pairKey("Elephant", "Lion"), pairKey("Sheep", "Monkey"),
  pairKey("Dog", "Deer"), pairKey("Rat", "Cat"), pairKey("Cow", "Tiger"), pairKey("Serpent", "Mongoose"),
]);

// 5. Graha Maitri
const FRIENDS: Partial<Record<Planet, Planet[]>> = {
  Sun: ["Moon", "Mars", "Jupiter"], Moon: ["Sun", "Mercury"], Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"], Jupiter: ["Sun", "Moon", "Mars"], Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
};
const ENEMIES: Partial<Record<Planet, Planet[]>> = {
  Sun: ["Venus", "Saturn"], Moon: [], Mars: ["Mercury"], Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"], Venus: ["Sun", "Moon"], Saturn: ["Sun", "Moon", "Mars"],
};
const leaning = (a: Planet, b: Planet) => (FRIENDS[a]?.includes(b) ? 1 : ENEMIES[a]?.includes(b) ? -1 : 0);
const MAITRI_POINTS: Record<number, number> = { 2: 5, 1: 4, 0: 3, [-1]: 1, [-2]: 0 };

// 6. Gana
const GANA: Record<string, "Deva" | "Manushya" | "Rakshasa"> = {
  Ashwini: "Deva", Mrigashira: "Deva", Punarvasu: "Deva", Pushya: "Deva", Hasta: "Deva", Swati: "Deva",
  Anuradha: "Deva", Shravana: "Deva", Revati: "Deva",
  Bharani: "Manushya", Rohini: "Manushya", Ardra: "Manushya", "Purva Phalguni": "Manushya",
  "Uttara Phalguni": "Manushya", "Purva Ashadha": "Manushya", "Uttara Ashadha": "Manushya",
  "Purva Bhadrapada": "Manushya", "Uttara Bhadrapada": "Manushya",
  Krittika: "Rakshasa", Ashlesha: "Rakshasa", Magha: "Rakshasa", Chitra: "Rakshasa", Vishakha: "Rakshasa",
  Jyeshtha: "Rakshasa", Mula: "Rakshasa", Dhanishta: "Rakshasa", Shatabhisha: "Rakshasa",
};
const GANA_SCORE = new Map<string, number>([
  [pairKey("Deva", "Manushya"), 5], [pairKey("Deva", "Rakshasa"), 1], [pairKey("Manushya", "Rakshasa"), 0],
]);

// 8. Nadi
const NADI_AADI = new Set(["Ashwini", "Ardra", "Punarvasu", "Uttara Phalguni", "Hasta", "Jyeshtha", "Mula", "Shatabhisha", "Purva Bhadrapada"]);
const NADI_MADHYA = new Set(["Bharani", "Mrigashira", "Pushya", "Purva Phalguni", "Chitra", "Anuradha", "Purva Ashadha", "Dhanishta", "Uttara Bhadrapada"]);
const nadiOf = (nak: string) => (NADI_AADI.has(nak) ? "Aadi" : NADI_MADHYA.has(nak) ? "Madhya" : "Antya");

const BAD_BHAKOOT_DIFFS = new Set([2, 5, 6, 8, 9, 12]);

const SCORE_INTERPRETATION: [number, string][] = [
  [32, "Excellent match — highly compatible on classical Ashta Koota grounds."],
  [24, "Good match — compatible, with a few small things to keep in mind."],
  [18, "Average match — workable, but worth discussing the concerns below with an astrologer."],
  [0, "Below the classical threshold — the score alone suggests real effort would be needed."],
];

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeGunaMilan(boy: Chart, girl: Chart): Guna {
  const bRashi = boy.rashi, gRashi = girl.rashi;
  const bNak = boy.nakshatra.name, gNak = girl.nakshatra.name;
  const bNakIdx = NAK_NAMES.indexOf(bNak), gNakIdx = NAK_NAMES.indexOf(gNak);
  const bRashiIdx = SIGNS.indexOf(bRashi), gRashiIdx = SIGNS.indexOf(gRashi);
  const kootas: Koota[] = [];

  // 1. Varna
  const bv = VARNA_RANK[bRashi], gv = VARNA_RANK[gRashi];
  kootas.push({
    name: "Varna", max: 1, points: bv >= gv ? 1 : 0, dosha: false,
    boy: VARNA_NAME[bv], girl: VARNA_NAME[gv], note: `Groom: ${VARNA_NAME[bv]} · Bride: ${VARNA_NAME[gv]}`,
  });

  // 2. Vashya
  const bg = VASHYA_GROUP[bRashi], gg = VASHYA_GROUP[gRashi];
  kootas.push({
    name: "Vashya", max: 2, points: bg === gg ? 2 : VASHYA_SCORE.get(pairKey(bg, gg)) ?? 1, dosha: false,
    boy: bg, girl: gg, note: `Groom: ${bg} · Bride: ${gg}`,
  });

  // 3. Tara
  const taraGood = (diff: number) => {
    const t = diff % 9 || 9;
    return [2, 4, 6, 8, 9].includes(t);
  };
  const diff1 = ((gNakIdx - bNakIdx + 27) % 27) + 1;
  const diff2 = ((bNakIdx - gNakIdx + 27) % 27) + 1;
  kootas.push({
    name: "Tara", max: 3, points: (taraGood(diff1) ? 1.5 : 0) + (taraGood(diff2) ? 1.5 : 0), dosha: false,
    boy: bNak, girl: gNak, note: "Birth-star counting cycle both ways",
  });

  // 4. Yoni
  const [bAnimal, bSex] = YONI[bNakIdx];
  const [gAnimal, gSex] = YONI[gNakIdx];
  const yoniPts = bAnimal === gAnimal ? (bSex === gSex ? 4 : 3) : YONI_ENEMIES.has(pairKey(bAnimal, gAnimal)) ? 0 : 2;
  kootas.push({
    name: "Yoni", max: 4, points: yoniPts, dosha: false,
    boy: bAnimal, girl: gAnimal, note: `Groom: ${bAnimal} · Bride: ${gAnimal}`,
  });

  // 5. Graha Maitri
  const bLord = SIGN_LORDS[bRashi], gLord = SIGN_LORDS[gRashi];
  const maitriPts = bLord === gLord ? 5 : MAITRI_POINTS[leaning(bLord, gLord) + leaning(gLord, bLord)];
  kootas.push({
    name: "Graha Maitri", max: 5, points: maitriPts, dosha: false,
    boy: bLord, girl: gLord, note: `Groom's Moon lord: ${bLord} · Bride's Moon lord: ${gLord}`,
  });

  // 6. Gana
  const bGana = GANA[bNak], gGana = GANA[gNak];
  kootas.push({
    name: "Gana", max: 6, points: bGana === gGana ? 6 : GANA_SCORE.get(pairKey(bGana, gGana)) ?? 6, dosha: false,
    boy: bGana, girl: gGana, note: `Groom: ${bGana} · Bride: ${gGana}`,
  });

  // 7. Bhakoot
  const bhakootDiff = ((gRashiIdx - bRashiIdx + 12) % 12) + 1;
  const bhakootDosha = BAD_BHAKOOT_DIFFS.has(bhakootDiff);
  kootas.push({
    name: "Bhakoot", max: 7, points: bhakootDosha ? 0 : 7, dosha: bhakootDosha,
    boy: bRashi, girl: gRashi,
    note: bhakootDosha ? "Bhakoot Dosha — rashi distance is inauspicious (2/12, 5/9 or 6/8)" : "Rashi distance is favourable",
  });

  // 8. Nadi
  const bNadi = nadiOf(bNak), gNadi = nadiOf(gNak);
  const nadiDosha = bNadi === gNadi;
  kootas.push({
    name: "Nadi", max: 8, points: nadiDosha ? 0 : 8, dosha: nadiDosha,
    boy: bNadi, girl: gNadi,
    note: nadiDosha ? `Nadi Dosha — both are ${bNadi} Nadi` : `Groom: ${bNadi} · Bride: ${gNadi}`,
  });

  const total = round2(kootas.reduce((s, k) => s + k.points, 0));
  const verdict = SCORE_INTERPRETATION.find(([t]) => total >= t)![1];

  const doshas: string[] = [];
  if (nadiDosha) {
    doshas.push("Nadi Dosha (same Nadi) — classically the most significant dosha; traditionally reviewed carefully as it relates to health and children.");
  }
  if (bhakootDosha) {
    doshas.push("Bhakoot Dosha (2-12 / 5-9 / 6-8 rashi distance) — can point to friction in money or emotional harmony; often softened when Graha Maitri and Gana score well.");
  }

  return { total, max: 36, verdict, kootas, doshas };
}

const MANGAL_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

export interface MangalDosha {
  isManglik: boolean;
  marsHouse: number;
}

/** Basic Mangal (Manglik) Dosha: Mars in houses 1, 2, 4, 7, 8 or 12 from the Lagna. */
export function checkMangalDosha(chart: Chart): MangalDosha {
  const marsHouse = chart.houseOf.Mars;
  return { isManglik: MANGAL_HOUSES.has(marsHouse), marsHouse };
}
