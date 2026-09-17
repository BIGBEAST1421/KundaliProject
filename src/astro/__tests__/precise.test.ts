import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "../chart";
import { toDMS, houseLord, planetDetails, housesRuledBy } from "../precise";
import { getDignity, isCombust, angularDistance } from "../dignity";
import { aspectedHouses, computeAspects, mutualAspect } from "../aspects";
import { computeStrengths, confidenceBand } from "../strength";
import { getD9Sign, getD7Sign, vargaChart } from "../varga";

const f = ref.delhi_1990;
const chart = computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon, new Date("2026-09-18T00:00:00Z"));

describe("precise", () => {
  it("formats DMS", () => {
    expect(toDMS(14.464722)).toBe(`14°27'53"`);
    expect(toDMS(0)).toBe(`0°00'00"`);
    expect(toDMS(29.99999)).toBe(`29°60'00"`); // second rollover carries into minutes
  });
  it("computes house lords from lagna", () => {
    expect(houseLord(1, "Cancer")).toBe("Moon");
    expect(houseLord(7, "Cancer")).toBe("Saturn");
    expect(houseLord(10, "Cancer")).toBe("Mars");
    expect(housesRuledBy("Saturn", "Cancer")).toEqual([7, 8]);
  });
  it("gives every body sign, dms, nakshatra, retro flag", () => {
    const d = planetDetails(chart);
    expect(d).toHaveLength(10);
    const moon = d.find((x) => x.body === "Moon")!;
    expect(moon.sign).toBe("Sagittarius");
    expect(moon.nakshatra.name).toBe("Uttara Ashadha");
    expect(moon.retro).toBe("never");
    expect(d.find((x) => x.body === "Rahu")!.retro).toBe("always-retrograde");
    expect(["direct", "retrograde"]).toContain(d.find((x) => x.body === "Saturn")!.retro);
    expect(moon.dms).toMatch(/^\d+°\d{2}'\d{2}"$/);
  });
});

describe("dignity", () => {
  it("classifies classical dignities", () => {
    expect(getDignity("Sun", "Aries", 10)).toBe("exalted");
    expect(getDignity("Saturn", "Libra", 20)).toBe("exalted");
    expect(getDignity("Moon", "Scorpio", 3)).toBe("debilitated");
    expect(getDignity("Mars", "Aries", 5)).toBe("moolatrikona");
    expect(getDignity("Mars", "Aries", 20)).toBe("own");
    expect(getDignity("Jupiter", "Leo", 10)).toBe("friendly");
    expect(getDignity("Venus", "Leo", 10)).toBe("enemy");
    expect(getDignity("Mercury", "Aquarius", 10)).toBe("neutral");
  });
  it("detects combustion by orb", () => {
    expect(angularDistance(350, 10)).toBe(20);
    expect(isCombust("Mercury", 12, 0)).toBe(true);
    expect(isCombust("Mercury", 13, 0, true)).toBe(false);
    expect(isCombust("Jupiter", 30, 0)).toBe(false);
  });
});

describe("aspects", () => {
  it("applies special aspects", () => {
    expect(aspectedHouses("Mars", 1).map((x) => x.house)).toEqual([7, 4, 8]);
    expect(aspectedHouses("Jupiter", 10).map((x) => x.house)).toEqual([4, 2, 6]);
    expect(aspectedHouses("Saturn", 12).map((x) => x.house)).toEqual([6, 2, 9]);
    expect(aspectedHouses("Venus", 3).map((x) => x.house)).toEqual([9]);
  });
  it("lists aspects for the chart with occupants", () => {
    const a = computeAspects(chart);
    expect(a.length).toBe(7 + 2 * 3); // 7 planets ×1 + Mars/Jupiter/Saturn ×2 extra
    expect(typeof mutualAspect(chart, "Sun", "Moon")).toBe("boolean");
  });
});

describe("strength", () => {
  it("scores every planet 0–100 with a band", () => {
    const s = computeStrengths(chart);
    expect(s).toHaveLength(9);
    for (const x of s) {
      expect(x.score).toBeGreaterThanOrEqual(0);
      expect(x.score).toBeLessThanOrEqual(100);
      expect(x.band).toBe(confidenceBand(x.score));
    }
  });
});

describe("varga", () => {
  it("computes navamsa by sign type", () => {
    expect(getD9Sign(0)).toBe("Aries");          // Aries 0° → Aries
    expect(getD9Sign(3.5)).toBe("Taurus");       // 2nd navamsa of Aries
    expect(getD9Sign(30)).toBe("Capricorn");     // Taurus (fixed) starts from 9th = Capricorn
    expect(getD9Sign(60)).toBe("Libra");         // Gemini (dual) starts from 5th = Libra
  });
  it("computes saptamsa", () => {
    expect(getD7Sign(0)).toBe("Aries");
    expect(getD7Sign(30)).toBe("Scorpio");       // Taurus (even) starts from 7th = Scorpio
  });
  it("builds a D9 chart with houses", () => {
    const d9 = vargaChart(chart, "D9");
    expect(d9.houseOf.Ascendant).toBe(1);
    expect(Object.keys(d9.signs)).toHaveLength(10);
  });
});
