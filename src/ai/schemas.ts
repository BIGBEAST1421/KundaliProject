/**
 * Gemini response schemas. Built per request so only the selected pillars are generated —
 * the model physically cannot return a section the user did not ask for.
 */
import { Type, type Schema } from "@google/genai";
import type { Pillar, RelationshipStatus } from "@/src/reports/types";

const S = (description?: string): Schema => ({ type: Type.STRING, description });
const arr = (items: Schema, description?: string): Schema => ({ type: Type.ARRAY, items, description });
const obj = (properties: Record<string, Schema>, required = Object.keys(properties)): Schema => ({
  type: Type.OBJECT, properties, required,
});

const TIMELINE_ITEM = obj({ period: S("Exact Mahadasha/Antardasha label from the scaffold"), desc: S("2 sentences") });
const REMEDY = obj({ icon: S("single emoji"), title: S(), desc: S() });

const BALANCE = {
  summary: S("2-3 plain, warm sentences"),
  positives: arr(S(), "Genuine strengths/favourable points, 1 sentence each. 2-4 items."),
  concerns: arr(S(), "Genuine weaknesses/challenges, 1 sentence each. EMPTY ARRAY if none truly exist — never invent one."),
};

export const CAREER_SCHEMA = obj({
  ...BALANCE,
  sectors: arr(obj({ sector: S(), reason: S("1 sentence tied to 10th house / D10") })),
  switchTiming: S("2 sentences of dasha-based timing advice adapted to their life stage"),
  timeline: arr(TIMELINE_ITEM),
});

export function loveSchema(status: RelationshipStatus): Schema {
  const notesDesc: Record<RelationshipStatus, string> = {
    unmarried: "Leave empty.",
    married: 'One note labelled "Where the marriage is now" (2-3 sentences on the current phase under the active dasha).',
    separated: 'Two notes: "What this chapter taught" (2-3 compassionate sentences) and "Moving forward" (2-3 sentences on what the current dasha supports, framed as their choice).',
    widowed: 'Two notes: "Grief and healing" (2-3 gentle sentences) and "Companionship ahead" (2-3 sentences, entirely optional and framed as their own timeline).',
  };
  return obj({
    ...BALANCE,
    partner: S("Partner reflection in 25-30 words"),
    marriageWindows: arr(obj({ period: S(), reason: S("2 sentences") }),
      status === "unmarried" ? "Exactly two distinct plausible marriage windows tied to dasha periods" : "Leave empty."),
    notes: arr(obj({ label: S(), text: S() }), notesDesc[status]),
  });
}

export const HEALTH_SCHEMA = obj({
  ...BALANCE,
  watch: arr(S(), "1-2 things to keep an eye on during the current dasha"),
});

export const WEALTH_SCHEMA = obj({
  ...BALANCE,
  pattern: S("One or two word wealth trajectory"),
  timeline: arr(TIMELINE_ITEM),
  muhurta: arr(obj({ type: S(), window: S("exact dasha period from scaffold"), reason: S("1 sentence") }),
    "Exactly three: career switch, investment, business launch / major purchase"),
});

export function buildPersonSchema(pillars: readonly Pillar[], status: RelationshipStatus): Schema {
  const props: Record<string, Schema> = {
    soulPurpose: S("Soul mission of the Moon nakshatra for this chart, 30-40 words"),
    overview: arr(S(), "Three chart insights specific to placements, 2 sentences each"),
    dashaAnalysis: S("3-4 sentences on the current Mahadasha–Antardasha combination"),
    remedies: arr(REMEDY, "Four remedies: mantra, gemstone, practice, moon remedy — each tied to a specific placement"),
  };
  if (pillars.includes("career")) props.career = CAREER_SCHEMA;
  if (pillars.includes("love")) props.love = loveSchema(status);
  if (pillars.includes("health")) props.health = HEALTH_SCHEMA;
  if (pillars.includes("wealth")) props.wealth = WEALTH_SCHEMA;
  return obj(props);
}

/**
 * Translation output shape: the full `insights` object plus the narrative strings that live
 * outside it (per-factor meaning/result, the guna verdict, the mangal note) — everything a
 * viewer actually reads that isn't already covered by the static i18n dictionary.
 */
export function buildMatchTranslationSchema(factorCount: number): Schema {
  return obj({
    insights: MATCH_SCHEMA,
    factors: arr(
      obj({ title: S(), meaning: S(), result: S() }),
      `Exactly ${factorCount} items, in the same order as the input factors array — translate "title", "meaning" and "result" for each, do not reorder, omit or add items.`,
    ),
    gunaVerdict: S("Translation of the guna score verdict sentence"),
    mangalNote: S("Translation of the Mangal Dosha note"),
  });
}

export const MATCH_SCHEMA = obj({
  headline: S("One warm, honest sentence with the overall verdict, referencing the score"),
  overall: S("3-4 sentences synthesising the score, doshas and both Moon signs"),
  emotional: S("2-3 sentences on emotional temperament match"),
  romantic: S("2-3 sentences on Venus–Mars chemistry"),
  communication: S("2-3 sentences on values and day-to-day communication"),
  strengths: arr(S(), "Specific strengths tied to strong kootas, 1-2 sentences each"),
  concerns: arr(S(), "Specific friction points tied to weak kootas/doshas. EMPTY ARRAY if none truly exist."),
  guidance: arr(S(), "Three practical guidance items for this pairing"),
  remedies: arr(REMEDY, "Remedies for any dosha found; empty if none needed"),
});
