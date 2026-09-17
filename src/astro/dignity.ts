import { SIGNS, type Planet, type Sign } from "./signs";

export type Dignity = "exalted" | "moolatrikona" | "own" | "friendly" | "neutral" | "enemy" | "debilitated";

interface DignityRow {
  exaltation: { sign: Sign; degree: number };
  debilitation: { sign: Sign; degree: number };
  own: Sign[];
  moolatrikona?: { sign: Sign; from: number; to: number };
  friends: Planet[];
  enemies: Planet[];
}

const T: Record<Exclude<Planet, "Rahu" | "Ketu">, DignityRow> = {
  Sun: { exaltation: { sign: "Aries", degree: 10 }, debilitation: { sign: "Libra", degree: 10 }, own: ["Leo"], moolatrikona: { sign: "Leo", from: 0, to: 20 }, friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
  Moon: { exaltation: { sign: "Taurus", degree: 3 }, debilitation: { sign: "Scorpio", degree: 3 }, own: ["Cancer"], moolatrikona: { sign: "Taurus", from: 3, to: 30 }, friends: ["Sun", "Mercury"], enemies: [] },
  Mars: { exaltation: { sign: "Capricorn", degree: 28 }, debilitation: { sign: "Cancer", degree: 28 }, own: ["Aries", "Scorpio"], moolatrikona: { sign: "Aries", from: 0, to: 12 }, friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
  Mercury: { exaltation: { sign: "Virgo", degree: 15 }, debilitation: { sign: "Pisces", degree: 15 }, own: ["Gemini", "Virgo"], moolatrikona: { sign: "Virgo", from: 15, to: 20 }, friends: ["Sun", "Venus"], enemies: ["Moon"] },
  Jupiter: { exaltation: { sign: "Cancer", degree: 5 }, debilitation: { sign: "Capricorn", degree: 5 }, own: ["Sagittarius", "Pisces"], moolatrikona: { sign: "Sagittarius", from: 0, to: 10 }, friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
  Venus: { exaltation: { sign: "Pisces", degree: 27 }, debilitation: { sign: "Virgo", degree: 27 }, own: ["Taurus", "Libra"], moolatrikona: { sign: "Libra", from: 0, to: 15 }, friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
  Saturn: { exaltation: { sign: "Libra", degree: 20 }, debilitation: { sign: "Aries", degree: 20 }, own: ["Capricorn", "Aquarius"], moolatrikona: { sign: "Aquarius", from: 0, to: 20 }, friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] },
};

/** Nodes: commonly treated as exalted in Taurus/Scorpio (Rahu/Ketu), strong in Gemini/Virgo, debilitated opposite. Simplified. */
const NODE: Record<"Rahu" | "Ketu", { exalted: Sign[]; debilitated: Sign[]; friendly: Sign[] }> = {
  Rahu: { exalted: ["Taurus", "Gemini"], debilitated: ["Scorpio", "Sagittarius"], friendly: ["Virgo", "Aquarius", "Libra", "Capricorn"] },
  Ketu: { exalted: ["Scorpio", "Sagittarius"], debilitated: ["Taurus", "Gemini"], friendly: ["Pisces", "Aries", "Leo", "Cancer"] },
};

import { SIGN_LORDS } from "./signs";

export function getDignity(planet: Planet, sign: Sign, degInSign = 15): Dignity {
  if (planet === "Rahu" || planet === "Ketu") {
    const n = NODE[planet];
    if (n.exalted.includes(sign)) return "exalted";
    if (n.debilitated.includes(sign)) return "debilitated";
    return n.friendly.includes(sign) ? "friendly" : "neutral";
  }
  const row = T[planet];
  if (row.exaltation.sign === sign) return "exalted";
  if (row.debilitation.sign === sign) return "debilitated";
  if (row.moolatrikona && row.moolatrikona.sign === sign && degInSign >= row.moolatrikona.from && degInSign < row.moolatrikona.to) return "moolatrikona";
  if (row.own.includes(sign)) return "own";
  const lord = SIGN_LORDS[sign];
  if (row.friends.includes(lord)) return "friendly";
  if (row.enemies.includes(lord)) return "enemy";
  return "neutral";
}

export const DIGNITY_LABEL: Record<Dignity, string> = {
  exalted: "Exalted", moolatrikona: "Moolatrikona", own: "Own sign", friendly: "Friendly sign",
  neutral: "Neutral sign", enemy: "Enemy sign", debilitated: "Debilitated",
};

/** Dignity → 0–40 points for the strength score. */
export const DIGNITY_POINTS: Record<Dignity, number> = {
  exalted: 40, moolatrikona: 36, own: 32, friendly: 24, neutral: 16, enemy: 8, debilitated: 0,
};

/** Combustion orbs in degrees (retrograde values for Mercury/Venus). */
const COMBUST_ORB: Partial<Record<Planet, { direct: number; retro: number }>> = {
  Moon: { direct: 12, retro: 12 }, Mars: { direct: 17, retro: 17 }, Mercury: { direct: 14, retro: 12 },
  Jupiter: { direct: 11, retro: 11 }, Venus: { direct: 10, retro: 8 }, Saturn: { direct: 15, retro: 15 },
};

export function angularDistance(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 540) % 360 - 180);
  return d;
}

export function isCombust(planet: Planet, planetLon: number, sunLon: number, retrograde = false): boolean {
  const orb = COMBUST_ORB[planet];
  if (!orb) return false;
  return angularDistance(planetLon, sunLon) <= (retrograde ? orb.retro : orb.direct);
}

export const SIGN_INDEX = (s: Sign) => SIGNS.indexOf(s);
