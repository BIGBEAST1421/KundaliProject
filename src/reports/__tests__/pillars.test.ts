import { describe, it, expect } from "vitest";
import { normalizePillars, isAllPillars } from "../pillars";

describe("normalizePillars", () => {
  it("keeps a single valid pillar", () => expect(normalizePillars(["career"])).toEqual(["career"]));
  it("orders and dedupes", () => expect(normalizePillars(["wealth", "Career", "wealth"])).toEqual(["career", "wealth"]));
  it("defaults to all for empty input", () => expect(normalizePillars([])).toEqual(["career", "love", "health", "wealth"]));
  it("defaults to all for garbage", () => expect(normalizePillars(["nope", 42])).toHaveLength(4));
  it("accepts a lone string", () => expect(normalizePillars("love")).toEqual(["love"]));
});

describe("isAllPillars", () => {
  it("is true only when all four present", () => {
    expect(isAllPillars(["career", "love", "health", "wealth"])).toBe(true);
    expect(isAllPillars(["career"])).toBe(false);
  });
});
