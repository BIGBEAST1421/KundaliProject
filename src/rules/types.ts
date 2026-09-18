import type { Planet, Sign } from "@/src/astro/signs";
import type { Dignity } from "@/src/astro/dignity";

export type Domain = "marriage" | "career";

export type Condition =
  | { type: "planetInHouse"; planet: Planet; houses: number[] }
  | { type: "planetInSign"; planet: Planet; signs: Sign[] }
  | { type: "planetDignity"; planet: Planet; in: Dignity[] }
  | { type: "planetWith"; a: Planet; b: Planet }
  | { type: "houseLordInHouse"; house: number; inHouses: number[] }
  | { type: "houseLordDignity"; house: number; in: Dignity[] }
  | { type: "houseLordIs"; house: number; planets: Planet[] }
  | { type: "houseOccupiedBy"; house: number; anyOf: Planet[] }
  | { type: "houseEmptyOf"; house: number; planets: Planet[] }
  | { type: "aspect"; from: Planet; toHouse?: number; toPlanet?: Planet }
  | { type: "yoga"; key: string; present?: boolean; cancelled?: boolean }
  | { type: "dashaLord"; level: "maha" | "antar" | "any"; planets: Planet[] }
  | { type: "vargaPlanetInHouse"; varga: "D9" | "D10"; planet: Planet; houses: number[] }
  | { type: "vargaHouseLordInHouse"; varga: "D9" | "D10"; house: number; inHouses: number[] }
  | { type: "planetStrength"; planet: Planet; min?: number; max?: number }
  | { type: "not"; condition: Condition };

export interface Rule {
  id: string;
  domain: Domain;
  /** ALL conditions must hold. */
  conditions: Condition[];
  /** 1 minor · 2 notable · 3 major. Fired rules are ranked by weight. */
  weight: 1 | 2 | 3;
  /** Favourable (true) or a concern (false). */
  positive: boolean;
  /** Short heading, e.g. "Venus strong in the 7th". */
  title: string;
  /** Plain-language meaning, no hedge prefix; the engine adds one. */
  text: string;
  /** Planets whose strength decides the confidence band. */
  keyPlanets?: Planet[];
}

export type ConfidenceBand = "direct" | "moderate" | "soft";

export interface FiredRule {
  id: string;
  domain: Domain;
  title: string;
  /** Text with hedge prefix applied. */
  text: string;
  weight: 1 | 2 | 3;
  positive: boolean;
  confidence: ConfidenceBand;
  /** Planets that decided the confidence. */
  keyPlanets: Planet[];
  /** Human-readable trace of why it fired. */
  because: string[];
}
