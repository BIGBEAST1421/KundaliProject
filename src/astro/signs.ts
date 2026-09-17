/** Sidereal zodiac signs, in order from Aries. */
export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type Sign = (typeof SIGNS)[number];

export const SIGN_LORDS: Record<Sign, Planet> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun",
  Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter",
  Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

export const PLANETS = [
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu",
] as const;
export type Planet = (typeof PLANETS)[number];

/** Planet or the Ascendant — the keys used in chart maps. */
export type Body = Planet | "Ascendant";

export const PLANET_ABBREVIATIONS: Record<Body, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve",
  Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "Asc",
};

export function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function getSignIndex(longitude: number): number {
  return Math.floor(normalizeDegrees(longitude) / 30);
}

export function getSign(longitude: number): Sign {
  return SIGNS[getSignIndex(longitude)];
}
