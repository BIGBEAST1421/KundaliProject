import { DateTime } from "luxon";
import type { Language } from "@/src/reports/types";

export const VOICE_RULES = `VOICE AND BALANCE RULES (follow strictly):
- Speak directly to the person as "you", like a warm, trusted astrologer friend — never like a textbook or a report.
- Plain language first. When you mention a placement (10th house, D10, Antardasha…), say what it MEANS for their life in everyday words, then briefly name the technical reason. Never stack two technical terms in one sentence.
- Be balanced and honest. Every section has "positives" and "concerns". Only list a concern when the chart genuinely shows one — if there is none, return an empty array. Never pad, never invent, never exaggerate.
- Be specific to THIS chart. No generic filler ("you are hardworking"), no repeating the same idea in different words, no hype.
- Keep sentences short and easy to scan. Keep the gentle, classical charm of Jyotish without jargon.
- Be informative: every sentence should tell the person something useful about their life, not just describe a planet.
- PUNCTUATION: never use em dashes or en dashes (— or –) anywhere. Use a comma, a full stop, or start a new sentence instead. Do not use semicolons either.
- Write like a caring human, not a report generator. Contractions are fine. No bullet-style fragments inside sentences.`;

export function languageNote(language: Language): string {
  if (language === "hi") {
    return `Write EVERY string value in warm, natural, everyday spoken Hindi (Devanagari script) — the way a well-read Indian astrologer talks to a client, not stiff textbook Hindi and not Hinglish. Common Jyotish words (Mahadasha, Antardasha, Nakshatra, Lagna, Rashi, Dasha) may stay as they are. JSON keys stay exactly as in the schema, in English.`;
  }
  return `Write every string value in simple, friendly English. JSON keys stay exactly as in the schema.`;
}

interface DashaPeriodLike { lord: string; start: string; end: string; current: boolean }
/** Minimal dasha shape needed for prompt text -- satisfied by both the live `Chart` and the
 * persisted `ChartSummary`, so this is shared between report generation and the ask-a-question
 * chat without either needing the other's full type. */
export interface DashaLike {
  mahadasha: string;
  allMahadashas: DashaPeriodLike[];
  antardashas: DashaPeriodLike[];
}

/** The exact Mahadasha/Antardasha listing text used in every AI prompt that needs dasha timing. */
export function dashaTimelineBlock(dasha: DashaLike): string {
  const mark = (c: boolean) => (c ? "-> " : "   ");
  const mahadashaBlock = dasha.allMahadashas.map((m) => `  ${mark(m.current)}${m.lord} Mahadasha: ${m.start} - ${m.end}`).join("\n");
  const antardashaBlock = dasha.antardashas.map((a) => `  ${mark(a.current)}${a.lord} Antardasha: ${a.start} - ${a.end}`).join("\n");
  return `Mahadasha timeline:\n${mahadashaBlock}\nAntardashas within the current ${dasha.mahadasha} Mahadasha:\n${antardashaBlock}`;
}

/** Guards every AI prompt against describing a pre-adult period (child/student years) as a
 * career, marriage, business or financial-timing period. */
export function lifeStageAccuracy(dob: string, currentMahadashaLord: string): { adultDate: string; todayLine: string; guard: string } {
  const today = DateTime.now();
  const adultDate = DateTime.fromISO(dob).plus({ years: 18 }).toFormat("MMM yyyy");
  const todayLine = `TODAY: ${today.toFormat("MMM yyyy")}. This person turned 18 in ${adultDate}.`;
  const guard = `LIFE-STAGE ACCURACY (critical): never describe any date range, or any part of one, before ${adultDate} as a career, marriage, business or financial-timing period — the person was a child or student then, not an adult making those decisions. If a Mahadasha or Antardasha you want to reference started before ${adultDate}, either narrow it to the portion from ${adultDate} onward (state it as a sub-range, e.g. "${currentMahadashaLord} Mahadasha, from ${adultDate}") or pick a different period from the scaffold that falls entirely after it. This applies to every "timeline", "switchTiming", "marriageWindows" and "muhurta" entry in any section — not just the current one.`;
  return { adultDate, todayLine, guard };
}
