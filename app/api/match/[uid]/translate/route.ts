import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { generateJson, AiError } from "@/src/ai/client";
import { buildMatchTranslationSchema } from "@/src/ai/schemas";
import { translatePrompt } from "@/src/ai/prompts/translate";
import { LanguageSchema, MatchTranslationSchema } from "@/src/reports/types";
import { repo } from "@/src/db/repo";
import { errorResponse } from "@/src/lib/errors";

const BodySchema = z.object({ lang: LanguageSchema });
const RawSchema = MatchTranslationSchema.omit({ language: true });

export const maxDuration = 60;

/** Translates a match report's narrative (insights, per-factor text, verdicts) — cached per report. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { lang } = BodySchema.parse(await req.json());
    const { uid } = await params;
    const report = await repo.getMatchByUid(uid);
    if (!report) return NextResponse.json({ error: "Match report not found", code: "not_found" }, { status: 404 });

    if (report.language === lang) {
      return NextResponse.json({
        insights: report.insights,
        factors: report.factors.map((f) => ({ title: f.title, meaning: f.meaning, result: f.result })),
        gunaVerdict: report.guna.verdict,
        mangalNote: report.mangal.note,
      });
    }
    if (report.translation && report.translation.language === lang) {
      const { insights, factors, gunaVerdict, mangalNote } = report.translation;
      return NextResponse.json({ insights, factors, gunaVerdict, mangalNote });
    }

    const schema = buildMatchTranslationSchema(report.factors.length);
    const content = {
      insights: report.insights,
      factors: report.factors.map((f) => ({ title: f.title, meaning: f.meaning, result: f.result })),
      gunaVerdict: report.guna.verdict,
      mangalNote: report.mangal.note,
    };
    const { prompt, system } = translatePrompt(content, lang);
    const raw = await generateJson({ prompt, system, schema });

    let parsed;
    try {
      parsed = RawSchema.parse(raw);
    } catch (err) {
      throw new AiError("parse", "The translation came back malformed.", err);
    }
    if (parsed.factors.length !== report.factors.length) {
      throw new AiError("parse", "The translation lost track of the factors.");
    }

    try {
      await repo.saveMatchTranslation(report.uid, { language: lang, ...parsed });
    } catch (err) {
      console.error("[translate] failed to cache match translation", err);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return errorResponse(err);
  }
}
