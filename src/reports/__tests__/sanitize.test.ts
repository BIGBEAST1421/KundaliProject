import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeDeep } from "../sanitize";

describe("sanitizeText", () => {
  it("replaces em and en dashes with commas", () => {
    expect(sanitizeText("Saturn is steady — patient, slow – but sure")).toBe("Saturn is steady, patient, slow, but sure");
  });
  it("does not leave a comma before a full stop", () => {
    expect(sanitizeText("A strong period —.")).toBe("A strong period.");
  });
  it("keeps hyphens and date ranges intact", () => {
    expect(sanitizeText("Oct 2023 - Oct 2026 is a well-timed window")).toBe("Oct 2023 - Oct 2026 is a well-timed window");
  });
});

describe("sanitizeDeep", () => {
  it("walks nested objects and arrays", () => {
    expect(sanitizeDeep({ a: ["x — y"], b: { c: "p – q" }, n: 3 })).toEqual({ a: ["x, y"], b: { c: "p, q" }, n: 3 });
  });
});
