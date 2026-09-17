import { PILLARS, PillarSchema, type Pillar } from "./types";

export const ALL_PILLARS: readonly Pillar[] = PILLARS;

export const PILLAR_LABELS: Record<Pillar, { en: string; hi: string }> = {
  career: { en: "Career & Karma", hi: "करियर और कर्म" },
  love: { en: "Love & Relationships", hi: "प्रेम और संबंध" },
  health: { en: "Health & Vitality", hi: "स्वास्थ्य और ऊर्जा" },
  wealth: { en: "Wealth & Money", hi: "धन और समृद्धि" },
};

/**
 * Normalise user input into a valid, ordered, de-duplicated pillar list.
 * Empty or fully invalid input means "all pillars".
 */
export function normalizePillars(input: unknown): Pillar[] {
  const raw = Array.isArray(input) ? input : typeof input === "string" ? [input] : [];
  const valid = new Set<Pillar>();
  for (const item of raw) {
    const parsed = PillarSchema.safeParse(typeof item === "string" ? item.toLowerCase().trim() : item);
    if (parsed.success) valid.add(parsed.data);
  }
  if (valid.size === 0) return [...ALL_PILLARS];
  return ALL_PILLARS.filter((p) => valid.has(p));
}

export function isAllPillars(pillars: readonly Pillar[]): boolean {
  return ALL_PILLARS.every((p) => pillars.includes(p));
}
