import type { Language } from "@/src/reports/types";

const TARGET_NOTE: Record<Language, string> = {
  hi: `Translate every string value into warm, natural, everyday spoken Hindi (Devanagari script) — the way a well-read Indian astrologer talks to a client, not stiff textbook Hindi and not Hinglish. Common Jyotish words (Mahadasha, Antardasha, Nakshatra, Lagna, Rashi, Dasha) may stay as they are. JSON keys stay exactly as in the schema, in English.`,
  en: `Translate every string value into simple, friendly English. JSON keys stay exactly as in the schema.`,
};

/** Faithful translation, not fresh generation: same facts, same tone, no additions or omissions. */
const RULES = `Translate the given JSON content faithfully into the target language.
- Keep the exact same meaning, tone and level of detail as the source — this is a translation, not a rewrite. Do not add, remove or soften any claim.
- Keep proper nouns, planet names, house numbers and dasha period dates exactly as given.
- Write purely in the target language throughout. Never insert an English word with its translation in parentheses, and never leave a word half-translated or misspelled.
- Match the warm, plain-language voice of a trusted astrologer friend.
- Never use em dashes or en dashes anywhere. Return ONLY raw JSON matching the schema.`;

export function translatePrompt(content: unknown, target: Language): { prompt: string; system: string } {
  const prompt = `${TARGET_NOTE[target]}

SOURCE JSON:
${JSON.stringify(content)}

Return the same structure, fully translated.`;

  const system = `You are a precise bilingual (English/Hindi) translator specialising in Vedic astrology terminology. ${RULES}`;

  return { prompt, system };
}
