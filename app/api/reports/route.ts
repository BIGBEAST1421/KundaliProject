import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { computeChart } from "@/src/astro/chart";
import { checkMangalDosha } from "@/src/astro/matching";
import { generateJson } from "@/src/ai/client";
import { buildPersonSchema } from "@/src/ai/schemas";
import { personPrompt, relationshipStatusFrom } from "@/src/ai/prompts/person";
import { buildPersonReport, summarizeChart } from "@/src/reports/buildPerson";
import { computeFacts, factsForPrompt } from "@/src/reports/facts";
import { pillarsForDob } from "@/src/reports/pillars";
import { toSlug, nextSlug } from "@/src/reports/slug";
import { CreateReportSchema } from "@/src/reports/input";
import { repo, isUniqueViolation } from "@/src/db/repo";
import { geocode } from "@/src/lib/geocode";
import { errorResponse } from "@/src/lib/errors";
import { grantOwnership } from "@/src/lib/owner";

export const maxDuration = 60;

/**
 * Create a person report: validate → chart → AI → structured report → Supabase.
 * Responds with `{ uid, slug }` and marks this browser as the report's owner (see
 * src/lib/owner.ts); the client navigates to `/<slug>`.
 */
export async function POST(req: NextRequest) {
  try {
    const input = CreateReportSchema.parse(await req.json());
    const pillars = pillarsForDob(input.pillars, input.dob);

    const coords = input.lat != null && input.lon != null
      ? { lat: input.lat, lon: input.lon }
      : await geocode(input.city, input.state, input.country);

    const chart = computeChart(input.dob, input.timeKnown ? input.time : "", coords.lat, coords.lon);
    const mangal = checkMangalDosha(chart);
    const relationshipStatus = relationshipStatusFrom(input.maritalStatus);
    const facts = computeFacts(chart);

    const { prompt, system } = personPrompt({
      name: input.name, dob: input.dob, time: input.time, timeKnown: input.timeKnown,
      location: [input.city, input.state, input.country].filter(Boolean).join(", "),
      gender: input.gender, occupation: input.occupation, maritalStatus: input.maritalStatus,
      relationshipStatus, pillars, chart, language: input.language, factsBlock: factsForPrompt(facts),
    });
    const ai = await generateJson({ prompt, system, schema: buildPersonSchema(pillars, relationshipStatus) });

    const base = toSlug(input.name);
    const report = buildPersonReport({
      uid: randomUUID(), slug: nextSlug(base, await repo.listSlugsLike(base)), name: input.name, language: input.language,
      birth: {
        dob: input.dob, time: input.timeKnown ? input.time : "", timeKnown: input.timeKnown,
        city: input.city, state: input.state, country: input.country, lat: coords.lat, lon: coords.lon,
      },
      profile: { gender: input.gender, occupation: input.occupation, maritalStatus: input.maritalStatus, relationshipStatus },
      pillars, chart: summarizeChart(chart, mangal), ai, facts,
    });

    // Two same-name reports saved at once can pick the same free slug; the loser re-picks
    // rather than throwing away an AI reading that has already been paid for.
    let saved;
    for (let attempt = 0; ; attempt++) {
      try {
        saved = await repo.createPerson(report);
        break;
      } catch (err) {
        if (attempt >= 2 || !isUniqueViolation(err)) throw err;
        report.slug = nextSlug(base, await repo.listSlugsLike(base));
      }
    }

    const res = NextResponse.json({ uid: saved.uid, slug: saved.slug }, { status: 201 });
    grantOwnership(req, res, saved.uid);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
