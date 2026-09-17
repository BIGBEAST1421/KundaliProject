import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "../chart";
import { localToUtc } from "../timezone";

const TODAY = new Date("2026-09-18T00:00:00Z");
const cases = [ref.delhi_1990, ref.mumbai_1985, ref.london_2000, ref.noon_fallback];

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
      expect(c.d1).toEqual(p.d1);
      expect(c.d10).toEqual(p.d10);
      expect(c.houseOf).toEqual(p.house_of);
      expect(c.d10HouseOf).toEqual(p.d10_house_of);
      expect(c.d10Lagna).toBe(p.d10_lagna);
      expect(c.dasha.mahadasha).toBe(p.dasha.mahadasha);
      expect(c.dasha.antardasha).toBe(p.dasha.antardasha);
      for (const [body, lon] of Object.entries(p.longitudes)) {
        expect(c.longitudes[body as keyof typeof c.longitudes], body).toBeCloseTo(lon, 2);
      }
    });
  }
});
