import type { Chart } from "@/src/astro/chart";
import { buildChartSummary } from "@/src/astro/summary";
import type { Language, Pillar, RelationshipStatus } from "@/src/reports/types";
import { VOICE_RULES, languageNote } from "./shared";

export interface PersonPromptInput {
  name: string;
  dob: string;
  time: string;
  timeKnown: boolean;
  location: string;
  gender: string;
  occupation: string;
  maritalStatus: string;
  relationshipStatus: RelationshipStatus;
  pillars: readonly Pillar[];
  chart: Chart;
  language: Language;
}

export function relationshipStatusFrom(maritalStatus: string): RelationshipStatus {
  const s = maritalStatus.trim().toLowerCase();
  if (s === "married") return "married";
  if (["separated/divorced", "separated", "divorced"].includes(s)) return "separated";
  if (s === "widowed") return "widowed";
  return "unmarried";
}

const LOVE_INSTRUCTIONS: Record<RelationshipStatus, string> = {
  unmarried: `They are UNMARRIED. Give exactly TWO distinct plausible marriage windows, each tied to a specific dasha period from the scaffold, with reasoning (Venus / 7th-lord dasha, etc.).`,
  married: `They are MARRIED. Do NOT predict marriage timing. Instead add one note labelled "Where the marriage is now": 2-3 sentences on the current phase of the partnership under the active dasha — harmony, friction points, what nurtures the bond. Leave marriageWindows empty.`,
  separated: `They are SEPARATED OR DIVORCED. Handle with real sensitivity — no fresh "first marriage" predictions, no moralising. Add two notes: "What this chapter taught" (2-3 compassionate sentences on what these dasha/house dynamics tend to teach, framed as insight not diagnosis) and "Moving forward" (2-3 warm sentences on what the CURRENT dasha supports — healing alone or openness to new connection — as a possibility they can choose). Leave marriageWindows empty.`,
  widowed: `They have LOST THEIR SPOUSE. Handle with genuine warmth. Add two notes: "Grief and healing" (2-3 gentle sentences tied to the current dasha on honouring the bond) and "Companionship ahead" (2-3 sentences that GENTLY and OPTIONALLY note whether the chart suggests openness to companionship someday — entirely their own choice and timeline; it is fine to say this is not something to think about now). Leave marriageWindows empty.`,
};

const PILLAR_GUIDES: Record<Pillar, string> = {
  career: `CAREER: "summary" from the 10th house and D10 lagna. "sectors": 2-3 sectors/roles justified by the 10th house sign/lord, D10 lagna and planets there — never generic "Technology, Finance". "switchTiming": adapt to their life stage (student → exams/streams; unemployed → when doors open; government/army → postings and promotions; employed/business → growth or switch timing). "timeline": 2 items.`,
  love: `LOVE: "summary" from the 7th house and Venus. "partner": 25-30 words.`,
  health: `HEALTH: "summary" = Ayurvedic constitution from the Lagna in 1-2 sentences. "positives" = bodily strengths. "concerns" = genuine vulnerabilities only. "watch": 1-2 dasha-based things to keep an eye on.`,
  wealth: `WEALTH: "pattern" = one or two words. "summary" from the 2nd and 11th houses. "timeline": 2 items. "muhurta": exactly three windows (career switch, investment, business launch / major purchase) — each MUST be an exact period from the scaffold, with a one-line reason grounded in the 2nd/11th lords or dasha lord.`,
};

export function personPrompt(i: PersonPromptInput): { prompt: string; system: string } {
  const { chart } = i;
  const dasha = chart.dasha;
  const mark = (c: boolean) => (c ? "-> " : "   ");
  const mahadashaBlock = dasha.allMahadashas.map((m) => `  ${mark(m.current)}${m.lord} Mahadasha: ${m.start} - ${m.end}`).join("\n");
  const antardashaBlock = dasha.antardashas.map((a) => `  ${mark(a.current)}${a.lord} Antardasha: ${a.start} - ${a.end}`).join("\n");

  const timeCaveat = i.timeKnown ? "" : `
IMPORTANT: The exact birth time is NOT known — the chart uses an approximate time, so the Lagna, house placements and D10 may shift. Base insights primarily on the Moon sign, Nakshatra and Sun sign; phrase any Lagna/house-based point as a tendency, never a certainty.`;

  const prompt = `You are a master Vedic Jyotishi (5th-generation classical astrologer) and a genuinely warm human being.

${VOICE_RULES}
${languageNote(i.language)}

I computed this birth chart with Swiss Ephemeris (Lahiri ayanamsa).

Person: ${i.name} | DOB: ${i.dob} | Time: ${i.time || "unknown"}${i.timeKnown ? "" : " (approximate)"} | Place: ${i.location} | Gender: ${i.gender || "unspecified"} | Relationship status: ${i.maritalStatus} | Occupation / life stage: ${i.occupation || "unspecified"}

COMPUTED CHART:
${buildChartSummary(chart)}
${timeCaveat}

EXACT DASHA PERIODS (ephemeris-based; every date range you mention anywhere MUST be one of these or a sub-range within one — never invent dates):
Mahadasha timeline:
${mahadashaBlock}
Antardashas within the current ${dasha.mahadasha} Mahadasha:
${antardashaBlock}

Nakshatra deity: ${chart.nakshatra.deity}
Sections requested: ${i.pillars.join(", ")} (generate ONLY these, plus the core fields).

CORE:
- "soulPurpose": the soul mission of ${chart.nakshatra.name} nakshatra for this chart, 30-40 words.
- "overview": three insights specific to actual placements, 2 sentences each.
- "dashaAnalysis": 3-4 sentences on how the current ${dasha.mahadasha} Mahadasha and ${dasha.antardasha} Antardasha interact — are the two lords friends, neutral or enemies; which houses they own/occupy here; so does this period lean favourable, mixed or challenging, and in which area of life.
- "remedies": four (mantra, gemstone, practice, moon remedy), each naming the specific planet/dasha lord it addresses and WHY it fits this chart.

${i.pillars.map((p) => PILLAR_GUIDES[p]).join("\n")}
${i.pillars.includes("love") ? LOVE_INSTRUCTIONS[i.relationshipStatus] : ""}

Return ONLY the JSON object described by the schema.`;

  const system = `You are a warm, down-to-earth Vedic astrologer who talks to people like a trusted friend. Every sentence must be understandable to someone with zero astrology background. Be balanced: real strengths and real concerns, never invented ones. Return ONLY raw JSON.`;

  return { prompt, system };
}
