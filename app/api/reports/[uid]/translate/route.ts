import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { generateJson, AiError } from "@/src/ai/client";
import { buildPersonTranslationSchema } from "@/src/ai/schemas";
import { translatePrompt } from "@/src/ai/prompts/translate";
import { LanguageSchema, PersonNarrativeSchema, IndicationsNarrativeSchema } from "@/src/reports/types";
import { repo } from "@/src/db/repo";
import { errorResponse } from "@/src/lib/errors";

const BodySchema = z.object({ lang: LanguageSchema });
const ResponseSchema = PersonNarrativeSchema.extend({ indications: IndicationsNarrativeSchema });

export const maxDuration = 60;

const EMPTY_INDICATIONS = { career: [], marriage: [] };

/**
 * Translates a report's AI-generated narrative — plus the Classical Indications rule text,
 * which is deterministic template text baked in at report-creation time and never covered by
 * `core`/`sections` — into the requested language, caching the result so it's only ever
 * generated once per report. Static UI labels are handled entirely client-side by the i18n
 * dictionaries; this endpoint only covers freeform prose.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { lang } = BodySchema.parse(await req.json());
    const { uid } = await params;
    const report = await repo.getPersonByUid(uid);
    if (!report) return NextResponse.json({ error: "Report not found", code: "not_found" }, { status: 404 });

    if (report.language === lang) {
      const rules = report.facts?.rules;
      return NextResponse.json({
        core: report.core,
        sections: report.sections,
        indications: rules
          ? { career: rules.career.map((r) => ({ title: r.title, text: r.text, because: r.because })), marriage: rules.marriage.map((r) => ({ title: r.title, text: r.text, because: r.because })) }
          : EMPTY_INDICATIONS,
      });
    }
    if (report.translation && report.translation.language === lang) {
      const { core, sections, indications } = report.translation;
      return NextResponse.json({ core, sections, indications: indications ?? EMPTY_INDICATIONS });
    }

    const rules = report.facts?.rules;
    const indicationsCount = { career: rules?.career.length ?? 0, marriage: rules?.marriage.length ?? 0 };
    const schema = buildPersonTranslationSchema(report.pillars, report.profile.relationshipStatus, indicationsCount);
    const content = {
      ...report.core,
      ...report.sections,
      indications: rules
        ? { career: rules.career.map((r) => ({ title: r.title, text: r.text, because: r.because })), marriage: rules.marriage.map((r) => ({ title: r.title, text: r.text, because: r.because })) }
        : EMPTY_INDICATIONS,
    };
    const { prompt, system } = translatePrompt(content, lang);
    const raw = await generateJson({ prompt, system, schema });

    let parsed;
    try {
      parsed = ResponseSchema.parse(raw);
    } catch (err) {
      throw new AiError("parse", "The translation came back malformed.", err);
    }
    if (parsed.indications.career.length !== indicationsCount.career || parsed.indications.marriage.length !== indicationsCount.marriage) {
      throw new AiError("parse", "The translation lost track of the classical indications.");
    }

    const { soulPurpose, overview, dashaAnalysis, remedies, career, love, health, wealth, indications } = parsed;
    const core = { soulPurpose, overview, dashaAnalysis, remedies };
    const sections = { career, love, health, wealth };

    try {
      await repo.savePersonTranslation(report.uid, { language: lang, core, sections, indications });
    } catch (err) {
      console.error("[translate] failed to cache person translation", err);
    }

    return NextResponse.json({ core, sections, indications });
  } catch (err) {
    return errorResponse(err);
  }
}
