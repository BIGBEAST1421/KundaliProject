import { bhriguPredictions } from "@/src/astro/bhrigu";
import type { Language } from "@/src/reports/types";
import { VOICE_RULES, languageNote, dashaTimelineBlock, lifeStageAccuracy, type DashaLike } from "./shared";

export interface AskPromptInput {
  name: string;
  dob: string;
  language: Language;
  chart: { lagna: string; houseOf: Record<string, number>; dasha: DashaLike };
  /** Output of factsForPrompt(report.facts); absent for reports created before facts shipped. */
  factsBlock?: string;
  question: string;
  /** Prior Q&A on this report, oldest first, so a follow-up question reads naturally. */
  history: { q: string; a: string }[];
}

/**
 * One free-form question about an already-generated report, answered strictly from the same
 * deterministic facts that report was built from -- so the chat can never contradict the report,
 * and never invents a placement, yoga or date the facts don't support.
 */
export function askPrompt(i: AskPromptInput): { prompt: string; system: string } {
  const { todayLine, guard } = lifeStageAccuracy(i.dob, i.chart.dasha.mahadasha);

  const bhrigu = bhriguPredictions(i.chart, "en");
  const bhriguBlock = bhrigu.length
    ? `BHRIGU SAMHITA READINGS (classical, verified text):\n${bhrigu.map((p) => `  ${p.planet} in house ${p.house}${p.planet === i.chart.dasha.mahadasha ? " [current Mahadasha lord]" : ""}: ${p.text}`).join("\n")}\n`
    : "";

  const historyBlock = i.history.length
    ? `EARLIER IN THIS CONVERSATION:\n${i.history.map((h) => `Q: ${h.q}\nA: ${h.a}`).join("\n\n")}\n\n`
    : "";

  const prompt = `You are a master Vedic Jyotishi (5th-generation classical astrologer) answering a direct question from ${i.name} about their own birth chart, which you have already analysed in full elsewhere in their report.

${VOICE_RULES}
${languageNote(i.language)}

${todayLine}

EXACT DASHA PERIODS (ephemeris-based; every date range you mention MUST be one of these or a sub-range within one — never invent dates):
${dashaTimelineBlock(i.chart.dasha)}

${guard}

${i.factsBlock ? `COMPUTED FACTS (deterministic, verified). Ground your answer in these. Do not state any placement, yoga, debt or period that is not listed here.\n${i.factsBlock}\n` : ""}
${bhriguBlock}
${historyBlock}THEIR QUESTION: "${i.question}"

Answer in 3-5 warm, direct sentences, speaking to them as "you". Rules:
- Ground every claim strictly in the facts above — never invent a placement, yoga, dasha period or date that is not listed.
- If their question needs something the facts above don't cover (an external event, a system this app doesn't compute, a date far outside the dasha scaffold), say plainly that the chart doesn't specify that, then share the closest relevant thing it DOES show on the theme.
- If the question has nothing to do with astrology or this chart, gently decline and invite them to ask something about their chart instead.
- Never give medical, legal or financial directives — frame things as classical tendencies, not guarantees or instructions.
- Respect LIFE-STAGE ACCURACY exactly as above if the question touches timing.
- Never use em dashes or en dashes.

Return ONLY the JSON object described by the schema.`;

  const system = `You are a warm, grounded Vedic astrologer answering one direct question about a chart you already have full computed data for. Never invent facts beyond what's given. Never use em dashes or en dashes. Return ONLY raw JSON.`;

  return { prompt, system };
}
