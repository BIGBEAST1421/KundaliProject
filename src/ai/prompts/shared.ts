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
export function lifeStageAccuracy(dob: string, currentMahadashaLord: string): { adultDate: string; todayLine: string; guard: string; ageYears: number; isMinor: boolean } {
  const today = DateTime.now();
  const birth = DateTime.fromISO(dob);
  const ageYears = Math.floor(today.diff(birth, "years").years);
  const isMinor = ageYears < 18;
  const adultDate = birth.plus({ years: 18 }).toFormat("MMM yyyy");
  const turnedPhrase = isMinor ? `will turn 18 in ${adultDate}` : `turned 18 in ${adultDate}`;
  const todayLine = `TODAY: ${today.toFormat("MMM yyyy")}. This person is currently ${ageYears} years old and ${turnedPhrase}.`;
  const guard = `LIFE-STAGE ACCURACY (critical): never describe any date range, or any part of one, before ${adultDate} as a career, marriage, business or financial-timing period — the person was a child or student then, not an adult making those decisions. If a Mahadasha or Antardasha you want to reference started before ${adultDate}, either narrow it to the portion from ${adultDate} onward (state it as a sub-range, e.g. "${currentMahadashaLord} Mahadasha, from ${adultDate}") or pick a different period from the scaffold that falls entirely after it. This applies to every "timeline", "switchTiming", "marriageWindows" and "muhurta" entry in any section — not just the current one.

FORWARD-LOOKING ONLY (critical): "timeline", "marriageWindows" and "muhurta" entries are guidance for what's ahead, not a historical record — every one of them must be the CURRENT period or a period that starts after TODAY. Never present a Mahadasha or Antardasha that has already fully ended as if it were upcoming (this matters most for someone unmarried whose earlier dasha periods have already passed without a marriage happening — do not cite those as "windows"). If every period in the scaffold that would otherwise fit has already ended, say plainly that the chart doesn't point to a clear near-term window rather than citing a stale one.`;
  return { adultDate, todayLine, guard, ageYears, isMinor };
}

/**
 * Adapts tone and content for the person's actual current life stage, beyond just the
 * timing guard above. Without this, a report for an 8-year-old or a 70-year-old reads
 * identically to one for a 28-year-old -- same "job sectors", same "marriage windows" -- which
 * is exactly the complaint this exists to fix. Returns "" for the broad working-age-adult
 * range where the existing occupation/relationship-status instructions already suffice.
 */
/** A gentler tone for a child/teen's report is not license to go content-free. Without this,
 * a model asked to be "supportive" for a kid tends to drop every genuinely fired negative-weight
 * rule from "concerns" entirely, leaving a report that's all encouragement and no real signal --
 * exactly the "too generic, can't see what's actually going on" complaint this fixes. */
const HONESTY_REMINDER = `This gentler framing is about TONE, not about hiding real signal. MANDATORY: for every rule listed under "CLASSICAL RULES THAT FIRED" below whose domain matches a requested section and whose weight is marked "concern" (not "favourable"), you MUST put a reframed version of it into that section's "concerns" array -- this is not optional and not something to decide against. Translate it into constructive, parent-facing language (e.g. a 10th-lord-in-a-hard-house rule about career visibility becomes "may need extra encouragement to get noticed, since recognition tends to come quietly and through effort rather than attention-seeking" -- still name the real pattern, just in words that fit a child). If a section has no "concern"-marked rule in its domain, it is fine for "concerns" to be empty for that section specifically -- do not invent one. But never drop a real fired concern rule just because the person is young: a report where every single section comes back with zero concerns is almost certainly wrong, not a sign the chart is flawless.`;

export function lifeStageFraming(ageYears: number): string {
  if (ageYears < 13) {
    return `LIFE STAGE (critical, overrides generic section guidance below): this person is a CHILD, currently ${ageYears} years old. Every section must be written for a child, regardless of which sections were requested. "career": natural aptitudes, learning style, the kind of environment that brings out their strengths -- never job sectors, switch timing or the working world. "wealth": family resources and habits worth encouraging -- never personal investment, muhurta or business timing; if "muhurta" windows are requested, relabel the three "type" values in child-appropriate terms (e.g. "Learning a new skill", "Starting a savings habit", "A big expense like schooling") instead of "Career Switch" / "Investment" / "Business Launch". "love": their social and emotional temperament -- friendships, family bonds, how they connect with others -- never romance, dating or marriage in any form. "health": a child's constitution and what supports healthy growth. Remedies, if any, must be gentle and family-appropriate. Do not use adult framing anywhere just because a section schema uses adult field names.

${HONESTY_REMINDER}`;
  }
  if (ageYears < 18) {
    return `LIFE STAGE (critical, overrides generic section guidance below): this person is a TEENAGER, currently ${ageYears} years old, still years of school/college ahead. "career": academic strengths, subject aptitude and the kind of path suited to them -- never job sectors or switch timing framed as imminent. "wealth": habits and family context, not personal investment or business timing; if "muhurta" windows are requested, relabel the three "type" values for a teenager (e.g. "A first job or internship", "Starting a savings or investment habit", "A big purchase like a laptop for studies") instead of "Career Switch" / "Investment" / "Business Launch". "love": do not predict marriage or discuss romance/dating in any section -- if requested, frame it around their social and emotional temperament instead. "health": age-appropriate, nothing adult-specific.

${HONESTY_REMINDER}`;
  }
  if (ageYears >= 60) {
    return `LIFE STAGE: this person is ${ageYears} years old. "career" (if requested): frame around legacy, mentorship, or how this life stage's work feels -- not job-hunting, switching roles or early-career growth. "wealth": frame around preserving and enjoying what's been built -- not aggressive investment growth or launching a new business; if "muhurta" windows are requested, relabel the three "type" values for this life stage (e.g. "Passing on responsibilities", "Preserving savings", "A major purchase or gift to family") instead of "Career Switch" / "Investment" / "Business Launch", and keep the "reason" text consistent with that relabeled type. Do not assume they are job-hunting or building a career from scratch.`;
  }
  return "";
}
