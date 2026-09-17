/**
 * Live Gemini smoke test — opt in with `RUN_AI=1 pnpm test`. Verifies that the per-pillar
 * response schema is accepted and that the output normalises into a PersonReport.
 */
import { describe, it, expect, vi } from "vitest";
import ref from "@/fixtures/python_reference.json";

vi.mock("server-only", () => ({}));

const run = process.env.RUN_AI === "1";

describe.skipIf(!run)("gemini live", () => {
  it("generates a single-pillar report that builds", { timeout: 90_000 }, async () => {
    const { computeChart } = await import("@/src/astro/chart");
    const { checkMangalDosha } = await import("@/src/astro/matching");
    const { generateJson } = await import("../client");
    const { buildPersonSchema } = await import("../schemas");
    const { personPrompt } = await import("../prompts/person");
    const { buildPersonReport, summarizeChart } = await import("@/src/reports/buildPerson");

    const f = ref.delhi_1990;
    const chart = computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon);
    const pillars = ["career"] as const;
    const { prompt, system } = personPrompt({
      name: "Test Person", dob: f.input.dob, time: f.input.time, timeKnown: true, location: "New Delhi, India",
      gender: "Male", occupation: "Employed", maritalStatus: "Unmarried", relationshipStatus: "unmarried",
      pillars, chart, language: "en",
    });
    const ai = await generateJson({ prompt, system, schema: buildPersonSchema(pillars, "unmarried") });
    expect(ai).toBeTypeOf("object");
    expect((ai as Record<string, unknown>).love).toBeUndefined();

    const report = buildPersonReport({
      uid: "8f3a2c91-1234-4abc-9def-0123456789ab", slug: "test-person", name: "Test Person", language: "en",
      birth: { dob: f.input.dob, time: f.input.time, timeKnown: true, city: "New Delhi", state: "Delhi", country: "India", lat: f.input.lat, lon: f.input.lon },
      profile: { gender: "Male", occupation: "Employed", maritalStatus: "Unmarried", relationshipStatus: "unmarried" },
      pillars: [...pillars], chart: summarizeChart(chart, checkMangalDosha(chart)), ai,
    });
    expect(Object.keys(report.sections)).toEqual(["career"]);
    expect(report.sections.career!.positives.length).toBeGreaterThan(0);
    console.log(JSON.stringify({ summary: report.sections.career!.summary, concerns: report.sections.career!.concerns }, null, 1));
  });
});
