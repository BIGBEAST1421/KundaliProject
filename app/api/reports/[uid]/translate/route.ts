import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { generateJson, AiError } from "@/src/ai/client";
import { buildPersonSchema } from "@/src/ai/schemas";
import { translatePrompt } from "@/src/ai/prompts/translate";
import { LanguageSchema, PersonNarrativeSchema } from "@/src/reports/types";
import { repo } from "@/src/db/repo";
import { errorResponse } from "@/src/lib/errors";

const BodySchema = z.object({ lang: LanguageSchema });

export const maxDuration = 60;

/**
 * Translates a report's AI-generated narrative into the requested language, caching the
 * result so it's only ever generated once per report. Static UI labels are handled entirely
 * client-side by the i18n dictionaries — this only covers the freeform prose.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { lang } = BodySchema.parse(await req.json());
    const { uid } = await params;
    const report = await repo.getPersonByUid(uid);
    if (!report) return NextResponse.json({ error: "Report not found", code: "not_found" }, { status: 404 });

    if (report.language === lang) {
      return NextResponse.json({ core: report.core, sections: report.sections });
    }
    if (report.translation?.language === lang) {
      return NextResponse.json({ core: report.translation.core, sections: report.translation.sections });
    }

    const schema = buildPersonSchema(report.pillars, report.profile.relationshipStatus);
    const content = { ...report.core, ...report.sections };
    const { prompt, system } = translatePrompt(content, lang);
    const raw = await generateJson({ prompt, system, schema });

    let narrative;
    try {
      narrative = PersonNarrativeSchema.parse(raw);
    } catch (err) {
      throw new AiError("parse", "The translation came back malformed.", err);
    }
    const { soulPurpose, overview, dashaAnalysis, remedies, career, love, health, wealth } = narrative;
    const core = { soulPurpose, overview, dashaAnalysis, remedies };
    const sections = { career, love, health, wealth };

    try {
      await repo.savePersonTranslation(report.uid, { language: lang, core, sections });
    } catch (err) {
      console.error("[translate] failed to cache person translation", err);
    }

    return NextResponse.json({ core, sections });
  } catch (err) {
    return errorResponse(err);
  }
}
