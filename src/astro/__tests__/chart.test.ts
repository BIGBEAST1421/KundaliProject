import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "../chart";
import { localToUtc } from "../timezone";

const TODAY = new Date("2026-09-18T00:00:00Z");
const cases = [ref.delhi_1990, ref.mumbai_1985, ref.london_2000, ref.noon_fallback];

/** The Python reference used the mean node; we use the true node, so Rahu/Ketu are compared separately. */
const NODES = new Set(["Rahu", "Ketu"]);
const withoutNodes = <T,>(m: Record<string, T>) => Object.fromEntries(Object.entries(m).filter(([k]) => !NODES.has(k)));

describe("localToUtc", () => {
  it("converts Delhi local time to UTC", () => {
    expect(localToUtc("1990-05-15", "10:30", 28.6139, 77.209).toFormat("yyyy-MM-dd HH:mm 'UTC'")).toBe("1990-05-15 05:00 UTC");
  });
  it("falls back to noon when time is unknown", () => {
    expect(localToUtc("1975-08-10", "", 26.8467, 80.9462).toFormat("yyyy-MM-dd HH:mm 'UTC'")).toBe("1975-08-10 06:30 UTC");
  });
});

describe("computeChart", () => {
  for (const f of cases) {
    it(`matches Python for ${f.input.dob} ${f.input.time || "(noon)"}`, () => {
      const c = computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon, TODAY);
      const p = f.chart;
      expect(c.utcTime).toBe(p.utc_time);
      expect(c.ayanamsa).toBeCloseTo(p.ayanamsa, 4);
      expect(c.lagna).toBe(p.lagna);
      expect(c.lagnaDegree).toBeCloseTo(p.lagna_degree, 2);
      expect(c.rashi).toBe(p.rashi);
      expect(c.sunSign).toBe(p.sun_sign);
      expect(c.nakshatra.name).toBe(p.nakshatra.name);
      expect(c.nakshatra.pada).toBe(p.nakshatra.pada);
      expect(c.lagnaNakshatra.name).toBe(p.lagna_nakshatra.name);
      expect(withoutNodes(c.d1)).toEqual(withoutNodes(p.d1));
      expect(withoutNodes(c.d10)).toEqual(withoutNodes(p.d10));
      expect(withoutNodes(c.houseOf)).toEqual(withoutNodes(p.house_of));
      expect(withoutNodes(c.d10HouseOf)).toEqual(withoutNodes(p.d10_house_of));
      expect(c.d10Lagna).toBe(p.d10_lagna);
      expect(c.dasha.mahadasha).toBe(p.dasha.mahadasha);
      expect(c.dasha.antardasha).toBe(p.dasha.antardasha);
      for (const [body, lon] of Object.entries(withoutNodes(p.longitudes))) {
        expect(c.longitudes[body as keyof typeof c.longitudes], body).toBeCloseTo(lon, 2);
      }
      // True and mean node never differ by more than ~1.8°.
      expect(Math.abs(((c.longitudes.Rahu - p.longitudes.Rahu + 540) % 360) - 180)).toBeLessThan(2);
      expect(c.longitudes.Ketu).toBeCloseTo((c.longitudes.Rahu + 180) % 360, 6);
    });
  }
});
