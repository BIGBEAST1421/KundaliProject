import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { generateJson, AiError } from "@/src/ai/client";
import { ASK_SCHEMA } from "@/src/ai/schemas";
import { askPrompt } from "@/src/ai/prompts/ask";
import { factsForPrompt } from "@/src/reports/facts";
import { LanguageSchema } from "@/src/reports/types";
import { repo } from "@/src/db/repo";
import { errorResponse } from "@/src/lib/errors";

const BodySchema = z.object({ question: z.string().trim().min(3).max(300), lang: LanguageSchema });
const AnswerSchema = z.object({ answer: z.string() });

export const MAX_QUESTIONS = 15;
export const maxDuration = 30;

/**
 * Answers one free-form question about a report, grounded strictly in that report's own
 * deterministic facts (same data the report itself was generated from) so the chat can never
 * contradict the report or invent a fact. Capped at MAX_QUESTIONS per report, enforced here
 * since nothing in this app rate-limits anything yet.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { question, lang } = BodySchema.parse(await req.json());
    const { uid } = await params;
    const report = await repo.getPersonByUid(uid);
    if (!report) return NextResponse.json({ error: "Report not found", code: "not_found" }, { status: 404 });

    const existing = report.questions;
    if (existing.length >= MAX_QUESTIONS) {
      return NextResponse.json({ error: "This report has reached its question limit.", code: "limit" }, { status: 429 });
    }

    const { prompt, system } = askPrompt({
      name: report.name,
      dob: report.birth.dob,
      language: lang,
      chart: report.chart,
      factsBlock: report.facts ? factsForPrompt(report.facts) : undefined,
      question,
      history: existing.map((q) => ({ q: q.q, a: q.a })),
    });
    const raw = await generateJson({ prompt, system, schema: ASK_SCHEMA });

    let parsed;
    try {
      parsed = AnswerSchema.parse(raw);
    } catch (err) {
      throw new AiError("parse", "The answer came back malformed.", err);
    }

    const questions = [...existing, { q: question, a: parsed.answer, lang, ts: new Date().toISOString() }];
    try {
      await repo.savePersonQuestions(report.uid, questions);
    } catch (err) {
      console.error("[ask] failed to save question", err);
    }

    return NextResponse.json({ answer: parsed.answer, count: questions.length, limit: MAX_QUESTIONS });
  } catch (err) {
    return errorResponse(err);
  }
}
