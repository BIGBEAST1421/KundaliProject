import { SIGNS, type Sign, normalizeDegrees } from "./signs";

/**
 * Dashamsha (D10) sign from a natal longitude. Each sign is split into ten 3° parts;
 * odd signs count from themselves, even signs from the 9th sign onward.
 */
export function getD10Sign(longitude: number): Sign {
  const lon = normalizeDegrees(longitude);
  const signNum = Math.floor(lon / 30);
  const part = Math.floor((lon % 30) / 3);
  const start = signNum % 2 === 0 ? signNum : (signNum + 8) % 12;
  return SIGNS[(start + part) % 12];
}
