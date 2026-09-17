import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { computeChart } from "@/src/astro/chart";
import { computeGunaMilan, checkMangalDosha } from "@/src/astro/matching";
import { generateJson } from "@/src/ai/client";
import { MATCH_SCHEMA } from "@/src/ai/schemas";
import { matchPrompt } from "@/src/ai/prompts/match";
import { buildMatchReport, mangalSummary, toMatchPerson } from "@/src/reports/buildMatch";
import { CreateMatchSchema, type PersonInput } from "@/src/reports/input";
import type { Birth } from "@/src/reports/types";
import { repo } from "@/src/db/repo";
import { geocode } from "@/src/lib/geocode";
import { errorResponse } from "@/src/lib/errors";

export const maxDuration = 60;

async function resolveBirth(p: PersonInput): Promise<Birth> {
  const coords = p.lat != null && p.lon != null ? { lat: p.lat, lon: p.lon } : await geocode(p.city, p.state, p.country);
  return {
    dob: p.dob, time: p.timeKnown ? p.time : "", timeKnown: p.timeKnown,
    city: p.city, state: p.state, country: p.country, lat: coords.lat, lon: coords.lon,
  };
}

/** Create a compatibility report for two people. Responds with `{ uid }`. */
export async function POST(req: NextRequest) {
  try {
    const input = CreateMatchSchema.parse(await req.json());
    const [boyBirth, girlBirth] = await Promise.all([resolveBirth(input.boy), resolveBirth(input.girl)]);

    const boyChart = computeChart(boyBirth.dob, boyBirth.time, boyBirth.lat, boyBirth.lon);
    const girlChart = computeChart(girlBirth.dob, girlBirth.time, girlBirth.lat, girlBirth.lon);
    const guna = computeGunaMilan(boyChart, girlChart);
    const boyMangal = checkMangalDosha(boyChart);
    const girlMangal = checkMangalDosha(girlChart);
    const mangal = mangalSummary(boyMangal, girlMangal);

    const { prompt, system } = matchPrompt({
      boyName: input.boy.name, girlName: input.girl.name, boyChart, girlChart, guna,
      mangalNote: mangal.note, language: input.language,
    });
    const ai = await generateJson({ prompt, system, schema: MATCH_SCHEMA, maxOutputTokens: 4096 });

    const report = buildMatchReport({
      uid: randomUUID(), language: input.language,
      boy: toMatchPerson(input.boy.name, boyBirth, boyChart, boyMangal),
      girl: toMatchPerson(input.girl.name, girlBirth, girlChart, girlMangal),
      guna, boyMangal, girlMangal, ai,
    });

    const saved = await repo.createMatch(report);
    return NextResponse.json({ uid: saved.uid }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
