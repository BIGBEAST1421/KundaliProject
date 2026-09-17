import type { Chart } from "@/src/astro/chart";
import type { Guna } from "@/src/astro/matching";
import type { Language } from "@/src/reports/types";
import { VOICE_RULES, languageNote } from "./shared";

export interface MatchPromptInput {
  boyName: string;
  girlName: string;
  boyChart: Chart;
  girlChart: Chart;
  guna: Guna;
  mangalNote: string;
  language: Language;
}

function personLine(label: string, name: string, c: Chart): string {
  return `${label}: ${name} — Lagna ${c.lagna}, Moon sign ${c.rashi}, Moon Nakshatra ${c.nakshatra.name} pada ${c.nakshatra.pada}, Sun sign ${c.sunSign}, Venus in ${c.d1.Venus}, Mars in ${c.d1.Mars} (house ${c.houseOf.Mars}), current Mahadasha ${c.dasha.mahadasha}.`;
}

export function matchPrompt(i: MatchPromptInput): { prompt: string; system: string } {
  const kootaLines = i.guna.kootas.map((k) => `  ${k.name}: ${k.points}/${k.max} — ${k.note}`).join("\n");
  const doshaLines = i.guna.doshas.map((d) => `  - ${d}`).join("\n") || "  None";

  const prompt = `You are a master Vedic Jyotishi specialising in marriage compatibility (Ashta Koota), and a warm human being who wants this couple to genuinely understand each other.

${VOICE_RULES}
${languageNote(i.language)}

${personLine("GROOM", i.boyName, i.boyChart)}
${personLine("BRIDE", i.girlName, i.girlChart)}

COMPUTED ASHTA KOOTA GUNA MILAN (verified arithmetic — do not recompute or contradict):
Total: ${i.guna.total}/36
${kootaLines}
Doshas found:
${doshaLines}

Mangal Dosha: ${i.mangalNote}

Using this EXACT data, write the compatibility analysis. Ground every claim in the actual placements and score.
- "headline": one warm, honest sentence referencing the ${i.guna.total}/36 score.
- "overall": 3-4 sentences synthesising score, doshas and both Moon signs/nakshatras.
- "emotional": 2-3 sentences on Moon sign / nakshatra temperament match.
- "romantic": 2-3 sentences on Venus–Mars chemistry between the charts.
- "communication": 2-3 sentences on Graha Maitri / Varna and daily communication.
- "strengths": specific strengths tied to strong kootas.
- "concerns": specific friction points tied to weak kootas or doshas — EMPTY if none genuinely exist.
- "guidance": three practical items for this pairing.
- "remedies": for any dosha found; empty if none needed.

Return ONLY the JSON object described by the schema.`;

  const system = `You are a warm, down-to-earth Vedic astrologer specialising in marriage compatibility. Every sentence must be understandable to someone with zero astrology background, grounded in the exact computed data, balanced and honest. Never use em dashes or en dashes in any text. Return ONLY raw JSON.`;

  return { prompt, system };
}
