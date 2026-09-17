import { DateTime } from "luxon";
import type { Planet } from "./signs";
import { NAK_SPAN } from "./nakshatras";

export const DASHA_YEARS: Record<Planet, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

export const DASHA_ORDER: readonly Planet[] = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
];

/** Nakshatra index → Vimshottari lord (the 9-lord cycle repeats 3× across 27 nakshatras). */
export const NAKSHATRA_LORDS: readonly Planet[] = Array.from({ length: 27 }, (_, i) => DASHA_ORDER[i % 9]);

const YEAR_DAYS = 365.2425;

export interface DashaPeriod {
  lord: Planet;
  /** "MMM yyyy" e.g. "Dec 2011" */
  start: string;
  end: string;
  current: boolean;
}

export interface Dasha {
  mahadasha: Planet;
  mahadashaStart: string;
  mahadashaEnd: string;
  antardasha: Planet;
  antardashaStart: string;
  antardashaEnd: string;
  allMahadashas: DashaPeriod[];
  antardashas: DashaPeriod[];
}

interface Span {
  lord: Planet;
  start: DateTime;
  end: DateTime;
  durationYears: number;
}

const fmt = (d: DateTime) => d.toFormat("MMM yyyy");

/**
 * Vimshottari Mahadasha/Antardasha timeline from the Moon's longitude and the birth date
 * (calendar date, "YYYY-MM-DD"). `today` decides which periods are current.
 */
export function getVimshottariDasha(moonLongitude: number, birthDate: string, today: Date = new Date()): Dasha {
  const nakIdx = Math.floor(moonLongitude / NAK_SPAN);
  const fractionElapsed = (moonLongitude % NAK_SPAN) / NAK_SPAN;
  const startLord = NAKSHATRA_LORDS[nakIdx];
  const startIdx = DASHA_ORDER.indexOf(startLord);
  const balanceYears = DASHA_YEARS[startLord] * (1 - fractionElapsed);

  // Work in UTC so calendar math is timezone-independent.
  const birth = DateTime.fromISO(birthDate, { zone: "utc" });
  const now = DateTime.fromJSDate(today, { zone: "utc" });

  const timeline: Span[] = [];
  let cursor = birth;
  for (let i = 0; i < 12; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const dur = i === 0 ? balanceYears : DASHA_YEARS[lord];
    const end = cursor.plus({ days: dur * YEAR_DAYS });
    timeline.push({ lord, start: cursor, end, durationYears: Math.round(dur * 100) / 100 });
    cursor = end;
  }

  const currentMd = timeline.find((t) => t.start <= now && now < t.end) ?? timeline[0];
  const mdIdx = DASHA_ORDER.indexOf(currentMd.lord);

  const antardashas: Span[] = [];
  let adCursor = currentMd.start;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(mdIdx + i) % 9];
    const dur = (DASHA_YEARS[lord] * currentMd.durationYears) / 120;
    const end = adCursor.plus({ days: dur * YEAR_DAYS });
    antardashas.push({ lord, start: adCursor, end, durationYears: dur });
    adCursor = end;
  }
  const currentAd = antardashas.find((a) => a.start <= now && now < a.end) ?? antardashas[0];

  const toPeriod = (s: Span, currentLord: Planet): DashaPeriod => ({
    lord: s.lord, start: fmt(s.start), end: fmt(s.end), current: s.lord === currentLord,
  });

  return {
    mahadasha: currentMd.lord,
    mahadashaStart: fmt(currentMd.start),
    mahadashaEnd: fmt(currentMd.end),
    antardasha: currentAd.lord,
    antardashaStart: fmt(currentAd.start),
    antardashaEnd: fmt(currentAd.end),
    allMahadashas: timeline.slice(0, 9).map((t) => toPeriod(t, currentMd.lord)),
    antardashas: antardashas.map((a) => toPeriod(a, currentAd.lord)),
  };
}
