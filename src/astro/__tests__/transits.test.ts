import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "../chart";
import { computeTransits } from "../transits";

const f = ref.delhi_1990;
const chart = computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon, new Date("2026-09-18T00:00:00Z"));

describe("computeTransits", () => {
  it("returns all 9 planets with houses from Lagna and Moon", () => {
    const t = computeTransits(chart, new Date("2026-09-18T12:00:00Z"));
    expect(t.planets).toHaveLength(9);
    for (const p of t.planets) {
      expect(p.houseFromLagna).toBeGreaterThanOrEqual(1);
      expect(p.houseFromLagna).toBeLessThanOrEqual(12);
    }
    expect(t.date).toBe("2026-09-18");
    expect(t.planets.find((p) => p.planet === "Rahu")!.retrograde).toBe(true);
  });
  it("is deterministic for a fixed date", () => {
    const a = computeTransits(chart, new Date("2026-09-18T12:00:00Z"));
    const b = computeTransits(chart, new Date("2026-09-18T12:00:00Z"));
    expect(a).toEqual(b);
  });
});
