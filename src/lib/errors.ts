import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AiError } from "@/src/ai/client";
import { ReportBuildError } from "@/src/reports/buildPerson";
import { RepoError } from "@/src/db/repo";

export interface ApiErrorBody {
  error: string;
  code: string;
  details?: unknown;
}

/** Map any thrown error to a user-safe JSON response. Technical details stay in the server log. */
export function errorResponse(err: unknown): NextResponse<ApiErrorBody> {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Some details look incomplete. Please check the form and try again.", code: "invalid_input", details: err.flatten().fieldErrors },
      { status: 400 },
    );
  }
  if (err instanceof AiError) {
    console.error("[ai]", err.code, err.cause);
    const status = err.code === "quota" ? 429 : 503;
    return NextResponse.json({ error: `${err.message} Please try again in a moment.`, code: `ai_${err.code}` }, { status });
  }
  if (err instanceof ReportBuildError) {
    console.error("[report]", err.message, err.issues);
    return NextResponse.json({ error: "We couldn't put your report together this time. Please try again.", code: "report_build" }, { status: 502 });
  }
  if (err instanceof RepoError) {
    console.error("[db]", err.message, err.cause);
    return NextResponse.json({ error: "We couldn't save or load the report right now. Please try again.", code: "storage" }, { status: 503 });
  }
  console.error("[unhandled]", err);
  return NextResponse.json({ error: "Something went wrong on our side. Please try again.", code: "internal" }, { status: 500 });
}
