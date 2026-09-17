import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { getSign, SIGNS, SIGN_LORDS } from "../signs";
import { getNakshatra } from "../nakshatras";
import { getD10Sign } from "../d10";
import { getVimshottariDasha } from "../dasha";

type Fixture = (typeof ref)["delhi_1990"];
const charts: Fixture[] = [ref.delhi_1990, ref.mumbai_1985, ref.london_2000, ref.noon_fallback];
// Fixtures were generated on this date; dasha "current" flags depend on it.
const TODAY = new Date("2026-09-18T00:00:00Z");

describe("signs", () => {
  it("has 12 signs with lords", () => {
    expect(SIGNS).toHaveLength(12);
    expect(SIGN_LORDS.Aries).toBe("Mars");
    expect(SIGN_LORDS.Pisces).toBe("Jupiter");
  });
  it("matches Python d1 signs for every planet", () => {
    for (const f of charts) {
      for (const [p, lon] of Object.entries(f.chart.longitudes)) {
        expect(getSign(lon), `${p}`).toBe((f.chart.d1 as Record<string, string>)[p]);
      }
    }
  });
});

describe("nakshatras", () => {
  it("matches Python moon nakshatra, pada, lord, deity", () => {
    for (const f of charts) {
      const n = getNakshatra(f.chart.longitudes.Moon);
      expect(n.name).toBe(f.chart.nakshatra.name);
      expect(n.pada).toBe(f.chart.nakshatra.pada);
      expect(n.lord).toBe(f.chart.nakshatra.lord);
      expect(n.deity).toBe(f.chart.nakshatra.deity);
      expect(n.index).toBe(f.chart.nakshatra.index);
      expect(n.degree).toBeCloseTo(f.chart.nakshatra.degree, 3);
    }
  });
});

describe("d10", () => {
  it("matches Python D10 signs", () => {
    for (const f of charts) {
      for (const [p, lon] of Object.entries(f.chart.longitudes)) {
        expect(getD10Sign(lon), `${p}`).toBe((f.chart.d10 as Record<string, string>)[p]);
      }
    }
  });
});

describe("vimshottari dasha", () => {
  it("matches Python mahadasha timeline and current periods", () => {
    for (const f of charts) {
      const d = getVimshottariDasha(f.chart.longitudes.Moon, f.input.dob, TODAY);
      expect(d.mahadasha).toBe(f.chart.dasha.mahadasha);
      expect(d.antardasha).toBe(f.chart.dasha.antardasha);
      expect(d.mahadashaStart).toBe(f.chart.dasha.mahadasha_start);
      expect(d.mahadashaEnd).toBe(f.chart.dasha.mahadasha_end);
      expect(d.antardashaStart).toBe(f.chart.dasha.antardasha_start);
      expect(d.antardashaEnd).toBe(f.chart.dasha.antardasha_end);
      expect(d.allMahadashas.map((m) => [m.lord, m.start, m.end, m.current])).toEqual(
        f.chart.dasha.all_mahadashas.map((m) => [m.lord, m.start, m.end, m.current]),
      );
      expect(d.antardashas.map((a) => [a.lord, a.start, a.end, a.current])).toEqual(
        f.chart.dasha.antardashas.map((a) => [a.lord, a.start, a.end, a.current]),
      );
    }
  });
});
