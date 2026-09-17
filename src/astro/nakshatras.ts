import type { Planet } from "./signs";
import { normalizeDegrees } from "./signs";

export interface NakshatraDef {
  name: string;
  lord: Planet;
  deity: string;
}

export const NAKSHATRAS: readonly NakshatraDef[] = [
  { name: "Ashwini", lord: "Ketu", deity: "Ashwini Kumaras" },
  { name: "Bharani", lord: "Venus", deity: "Yama" },
  { name: "Krittika", lord: "Sun", deity: "Agni" },
  { name: "Rohini", lord: "Moon", deity: "Brahma" },
  { name: "Mrigashira", lord: "Mars", deity: "Soma" },
  { name: "Ardra", lord: "Rahu", deity: "Rudra" },
  { name: "Punarvasu", lord: "Jupiter", deity: "Aditi" },
  { name: "Pushya", lord: "Saturn", deity: "Brihaspati" },
  { name: "Ashlesha", lord: "Mercury", deity: "Nagas" },
  { name: "Magha", lord: "Ketu", deity: "Pitrs" },
  { name: "Purva Phalguni", lord: "Venus", deity: "Bhaga" },
  { name: "Uttara Phalguni", lord: "Sun", deity: "Aryaman" },
  { name: "Hasta", lord: "Moon", deity: "Savitar" },
  { name: "Chitra", lord: "Mars", deity: "Vishvakarma" },
  { name: "Swati", lord: "Rahu", deity: "Vayu" },
  { name: "Vishakha", lord: "Jupiter", deity: "Indra-Agni" },
  { name: "Anuradha", lord: "Saturn", deity: "Mitra" },
  { name: "Jyeshtha", lord: "Mercury", deity: "Indra" },
  { name: "Mula", lord: "Ketu", deity: "Nirriti" },
  { name: "Purva Ashadha", lord: "Venus", deity: "Apas" },
  { name: "Uttara Ashadha", lord: "Sun", deity: "Vishvedevas" },
  { name: "Shravana", lord: "Moon", deity: "Vishnu" },
  { name: "Dhanishta", lord: "Mars", deity: "Eight Vasus" },
  { name: "Shatabhisha", lord: "Rahu", deity: "Varuna" },
  { name: "Purva Bhadrapada", lord: "Jupiter", deity: "Aja Ekapada" },
  { name: "Uttara Bhadrapada", lord: "Saturn", deity: "Ahir Budhanya" },
  { name: "Revati", lord: "Mercury", deity: "Pushan" },
];

export const NAK_NAMES: readonly string[] = NAKSHATRAS.map((n) => n.name);

/** 13°20′ — the arc of one nakshatra. */
export const NAK_SPAN = 360 / 27;

export interface Nakshatra extends NakshatraDef {
  index: number;
  pada: number;
  /** Degrees travelled within this nakshatra. */
  degree: number;
}

export function getNakshatra(longitude: number): Nakshatra {
  const lon = normalizeDegrees(longitude);
  const index = Math.floor(lon / NAK_SPAN);
  const posInNak = lon % NAK_SPAN;
  const pada = Math.floor(posInNak / (NAK_SPAN / 4)) + 1;
  return { ...NAKSHATRAS[index], index, pada, degree: round(posInNak, 4) };
}

function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}
