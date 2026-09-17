import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "@/src/astro/chart";
import { computeGunaMilan, checkMangalDosha } from "@/src/astro/matching";
import { buildPersonReport, summarizeChart, ReportBuildError } from "../buildPerson";
import { buildMatchReport, toMatchPerson, kootaVerdict } from "../buildMatch";

const UID = "8f3a2c91-1234-4abc-9def-0123456789ab";
const TODAY = new Date("2026-09-18T00:00:00Z");
const f = ref.delhi_1990;
const chart = computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon, TODAY);
const mangal = checkMangalDosha(chart);
const birth = { dob: f.input.dob, time: f.input.time, timeKnown: true, city: "New Delhi", state: "Delhi", country: "India", lat: f.input.lat, lon: f.input.lon };
const profile = { gender: "Male", occupation: "Employed", maritalStatus: "Unmarried", relationshipStatus: "unmarried" as const };

const section = (extra: object = {}) => ({ summary: "Summary.", positives: ["Good thing."], concerns: [], ...extra });
const fullAi = {
  soulPurpose: "Purpose.", overview: ["One.", "Two."], dashaAnalysis: "Dasha.",
  remedies: [{ icon: "🪬", title: "Mantra", desc: "Chant." }],
  career: section({ sectors: [{ sector: "Tech", reason: "Because." }], switchTiming: "Soon.", timeline: [] }),
  love: section({ partner: "Kind.", marriageWindows: [], notes: [] }),
  health: section({ watch: ["Sleep."] }),
  wealth: section({ pattern: "Steady", timeline: [], muhurta: [] }),
};
const base = { uid: UID, slug: "test", name: "Test", language: "en" as const, birth, profile, chart: summarizeChart(chart, mangal) };

describe("buildPersonReport", () => {
  it("keeps only the selected pillar", () => {
    const r = buildPersonReport({ ...base, pillars: ["career"], ai: fullAi });
    expect(Object.keys(r.sections)).toEqual(["career"]);
    expect(r.pillars).toEqual(["career"]);
  });
  it("keeps multiple selected pillars in canonical order", () => {
    const r = buildPersonReport({ ...base, pillars: ["wealth", "love"], ai: fullAi });
    expect(Object.keys(r.sections).sort()).toEqual(["love", "wealth"]);
    expect(r.pillars).toEqual(["love", "wealth"]);
  });
  it("keeps all four when all selected", () => {
    const r = buildPersonReport({ ...base, pillars: ["career", "love", "health", "wealth"], ai: fullAi });
    expect(Object.keys(r.sections)).toHaveLength(4);
  });
  it("preserves empty concerns without inventing any", () => {
    const r = buildPersonReport({ ...base, pillars: ["health"], ai: fullAi });
    expect(r.sections.health?.concerns).toEqual([]);
  });
  it("throws when a selected pillar is missing from the AI output", () => {
    const { career: _dropped, ...withoutCareer } = fullAi;
    expect(() => buildPersonReport({ ...base, pillars: ["career"], ai: withoutCareer })).toThrow(ReportBuildError);
  });
  it("throws on missing core insights", () => {
    expect(() => buildPersonReport({ ...base, pillars: ["career"], ai: { career: section() } })).toThrow(ReportBuildError);
  });
});

describe("buildMatchReport", () => {
  const g = ref.mumbai_1985;
  const girlChart = computeChart(g.input.dob, g.input.time, g.input.lat, g.input.lon, TODAY);
  const girlMangal = checkMangalDosha(girlChart);
  const guna = computeGunaMilan(chart, girlChart);
  const ai = {
    headline: "H", overall: "O", emotional: "E", romantic: "R", communication: "C",
    strengths: ["s"], concerns: [], guidance: ["g"], remedies: [],
  };
  it("builds 8 factors with verdicts and plain-language meaning", () => {
    const r = buildMatchReport({
      uid: UID, language: "en",
      boy: toMatchPerson("Boy", birth, chart, mangal),
      girl: toMatchPerson("Girl", { ...birth, dob: g.input.dob }, girlChart, girlMangal),
      guna, boyMangal: mangal, girlMangal, ai,
    });
    expect(r.factors).toHaveLength(8);
    expect(r.factors.every((x) => x.meaning.length > 20)).toBe(true);
    expect(r.guna.total).toBe(guna.total);
    expect(["strength", "concern", "neutral"]).toContain(r.mangal.verdict);
  });
  it("flags doshas as concerns and full marks as strengths", () => {
    expect(kootaVerdict({ name: "Nadi", max: 8, points: 0, dosha: true, note: "", boy: "", girl: "" })).toBe("concern");
    expect(kootaVerdict({ name: "Gana", max: 6, points: 6, dosha: false, note: "", boy: "", girl: "" })).toBe("strength");
    expect(kootaVerdict({ name: "Tara", max: 3, points: 1.5, dosha: false, note: "", boy: "", girl: "" })).toBe("neutral");
  });
});
