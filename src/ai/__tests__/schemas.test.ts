import { describe, it, expect } from "vitest";
import { buildPersonSchema, MATCH_SCHEMA } from "../schemas";

describe("buildPersonSchema", () => {
  it("includes only the selected pillars", () => {
    const s = buildPersonSchema(["career"], "unmarried");
    expect(Object.keys(s.properties!)).toEqual(["soulPurpose", "overview", "dashaAnalysis", "remedies", "career"]);
    expect(s.required).not.toContain("love");
  });
  it("includes all four when all selected", () => {
    const s = buildPersonSchema(["career", "love", "health", "wealth"], "married");
    expect(Object.keys(s.properties!)).toEqual(expect.arrayContaining(["career", "love", "health", "wealth"]));
  });
  it("every pillar has positives and concerns", () => {
    const s = buildPersonSchema(["career", "love", "health", "wealth"], "widowed");
    for (const p of ["career", "love", "health", "wealth"]) {
      const props = s.properties![p].properties!;
      expect(props.positives.type).toBe("ARRAY");
      expect(props.concerns.type).toBe("ARRAY");
      expect(props.concerns.description).toMatch(/EMPTY ARRAY/);
    }
  });
});

describe("MATCH_SCHEMA", () => {
  it("has balanced strengths/concerns", () => {
    expect(MATCH_SCHEMA.properties!.strengths.type).toBe("ARRAY");
    expect(MATCH_SCHEMA.properties!.concerns.description).toMatch(/EMPTY ARRAY/);
  });
});
