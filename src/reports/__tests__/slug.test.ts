import { describe, it, expect } from "vitest";
import { toSlug, nextSlug, slugFromParam } from "../slug";

describe("toSlug", () => {
  it("lowercases and hyphenates", () => expect(toSlug("Rahul Sharma")).toBe("rahul-sharma"));
  it("strips accents and punctuation", () => expect(toSlug("  Rāhul!! ")).toBe("rahul"));
  it("falls back for empty/unsupported names", () => expect(toSlug("   ")).toBe("person"));
  it("never shadows reserved routes", () => {
    expect(toSlug("app")).toBe("app-1");
    expect(toSlug("Report")).toBe("report-1");
  });
});

describe("nextSlug", () => {
  it("returns base when free", () => expect(nextSlug("rahul", [])).toBe("rahul"));
  it("skips taken suffixes", () => expect(nextSlug("rahul", ["rahul", "rahul-2"])).toBe("rahul-3"));
});

describe("slugFromParam", () => {
  it("decodes URL encoding", () => expect(slugFromParam("Rahul%2DSharma")).toBe("rahul-sharma"));
});
