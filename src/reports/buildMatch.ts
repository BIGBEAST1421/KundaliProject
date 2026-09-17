import type { Chart } from "@/src/astro/chart";
import type { Guna, Koota, MangalDosha } from "@/src/astro/matching";
import {
  MatchInsightsSchema, MatchReportSchema,
  type Birth, type Language, type MatchFactor, type MatchPerson, type MatchReport, type Verdict,
} from "./types";
import { ReportBuildError } from "./buildPerson";

/** Plain-language framing for each koota, used by web, share and print. */
export const KOOTA_INFO: Record<Koota["name"], { key: string; title: string; meaning: string }> = {
  Varna: { key: "varna", title: "Temperament & ego", meaning: "Compares each person's natural temperament based on their Moon sign. It's a small factor about mutual respect and who tends to lead." },
  Vashya: { key: "vashya", title: "Mutual influence", meaning: "Looks at how naturally the two of you influence and adjust to each other, based on the animal group of your Moon signs." },
  Tara: { key: "tara", title: "Luck & wellbeing together", meaning: "Counts the distance between your birth stars in both directions. A good result suggests you tend to bring each other good fortune and health." },
  Yoni: { key: "yoni", title: "Intimacy & physical bond", meaning: "Matches the symbolic animal of each birth star. It speaks to physical comfort, attraction and how easily you relax around each other." },
  "Graha Maitri": { key: "maitri", title: "Mindset & friendship", meaning: "Compares the ruling planets of your Moon signs. Friendly planets usually mean similar values and easy day-to-day understanding." },
  Gana: { key: "gana", title: "Nature & attitude", meaning: "Groups birth stars into gentle, practical and intense natures. Matching or compatible groups suggest fewer clashes in outlook." },
  Bhakoot: { key: "bhakoot", title: "Emotional & financial harmony", meaning: "Looks at the distance between your Moon signs. It's about long-term emotional rhythm, family life and shared money matters." },
  Nadi: { key: "nadi", title: "Health & energy match", meaning: "Compares the 'pulse' type of each birth star. Traditionally the most weighted factor, tied to health and children." },
};

export function kootaVerdict(k: Koota): Verdict {
  if (k.dosha) return "concern";
  const ratio = k.points / k.max;
  if (ratio >= 0.75) return "strength";
  if (ratio <= 0.25) return "concern";
  return "neutral";
}

function kootaResult(k: Koota, verdict: Verdict): string {
  if (k.name === "Nadi") return k.dosha ? "Both share the same Nadi — a classical concern worth discussing with an astrologer." : "Different Nadis — a healthy complement.";
  if (k.name === "Bhakoot") return k.dosha ? "Your Moon signs sit at a challenging distance, which can create friction in shared life." : "Your Moon signs sit at a supportive distance.";
  if (verdict === "strength") return "A strong match here — this comes naturally to you both.";
  if (verdict === "concern") return "This is a weaker area — expect to put in conscious effort.";
  return "A middling result — neither a boost nor a problem on its own.";
}

export function toMatchFactors(guna: Guna): MatchFactor[] {
  return guna.kootas.map((k) => {
    const verdict = kootaVerdict(k);
    const info = KOOTA_INFO[k.name];
    return {
      key: info.key, name: k.name, title: info.title, points: k.points, max: k.max,
      verdict, meaning: info.meaning, result: kootaResult(k, verdict), boy: k.boy, girl: k.girl,
    };
  });
}

export function mangalSummary(boy: MangalDosha, girl: MangalDosha): { verdict: Verdict; note: string } {
  if (boy.isManglik && girl.isManglik) {
    return { verdict: "neutral", note: "Both are Manglik — classically this cancels the dosha between them." };
  }
  if (!boy.isManglik && !girl.isManglik) {
    return { verdict: "strength", note: "Neither is Manglik — no Mangal Dosha concern." };
  }
  const who = boy.isManglik ? "groom" : "bride";
  return { verdict: "concern", note: `Only the ${who} is Manglik — worth reviewing remedies with an astrologer.` };
}

export function toMatchPerson(name: string, birth: Birth, chart: Chart, mangal: MangalDosha): MatchPerson {
  return {
    name,
    birth,
    chart: {
      lagna: chart.lagna, rashi: chart.rashi, sunSign: chart.sunSign,
      nakshatra: { name: chart.nakshatra.name, pada: chart.nakshatra.pada, lord: chart.nakshatra.lord },
      d1: chart.d1, mahadasha: chart.dasha.mahadasha,
    },
    mangal: { isManglik: mangal.isManglik, marsHouse: mangal.marsHouse },
  };
}

export interface BuildMatchInput {
  uid: string;
  language: Language;
  boy: MatchPerson;
  girl: MatchPerson;
  guna: Guna;
  boyMangal: MangalDosha;
  girlMangal: MangalDosha;
  ai: unknown;
  createdAt?: string;
}

export function buildMatchReport(input: BuildMatchInput): MatchReport {
  const insights = MatchInsightsSchema.safeParse(input.ai ?? {});
  if (!insights.success) throw new ReportBuildError("AI response is missing compatibility insights", insights.error.issues);

  const report = MatchReportSchema.safeParse({
    uid: input.uid,
    language: input.language,
    boy: input.boy,
    girl: input.girl,
    guna: { total: input.guna.total, max: input.guna.max, verdict: input.guna.verdict, doshas: input.guna.doshas },
    factors: toMatchFactors(input.guna),
    mangal: mangalSummary(input.boyMangal, input.girlMangal),
    insights: insights.data,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
  if (!report.success) throw new ReportBuildError("Match report failed validation", report.error.issues);
  return report.data;
}
