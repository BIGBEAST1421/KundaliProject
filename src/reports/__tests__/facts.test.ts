import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "@/src/astro/chart";
import { computeFacts, factsForPrompt, ReportFactsSchema } from "../facts";

const f = ref.delhi_1990;
const chart = computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon, new Date("2026-09-18T00:00:00Z"));

describe("computeFacts", () => {
  it("produces a schema-valid facts object with all parts", () => {
    const facts = computeFacts(chart, new Date("2026-09-18T12:00:00Z"));
    expect(ReportFactsSchema.safeParse(facts).success).toBe(true);
    expect(facts.planets).toHaveLength(10);
    expect(Object.keys(facts.houseLords)).toHaveLength(12);
    expect(facts.yogas.length).toBeGreaterThanOrEqual(10);
    expect(facts.strengths).toHaveLength(9);
    expect(facts.rules.marriage.length + facts.rules.career.length).toBeGreaterThan(0);
  });
  it("renders a prompt block without dashes", () => {
    const txt = factsForPrompt(computeFacts(chart, new Date("2026-09-18T12:00:00Z")));
    expect(txt).toMatch(/PLANET DETAILS/);
    expect(txt).toMatch(/HOUSE LORDS/);
    expect(txt).not.toMatch(/[—–]/);
  });
});
