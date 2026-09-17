import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "../chart";
import { computeGunaMilan, checkMangalDosha } from "../matching";

const TODAY = new Date("2026-09-18T00:00:00Z");
const chart = (f: typeof ref.delhi_1990) => computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon, TODAY);

describe("computeGunaMilan", () => {
  const pairs = [
    [ref.delhi_1990, ref.mumbai_1985, ref.guna_delhi_mumbai],
    [ref.london_2000, ref.delhi_1990, ref.guna_london_delhi],
  ] as const;
  for (const [a, b, expected] of pairs) {
    it(`matches Python scores for ${a.input.dob} × ${b.input.dob}`, () => {
      const g = computeGunaMilan(chart(a), chart(b));
      expect(g.total).toBe(expected.total);
      expect(g.max).toBe(36);
      expect(g.kootas.map((k) => [k.name, k.points, k.max])).toEqual(
        expected.kootas.map((k) => [k.name, k.points, k.max]),
      );
      expect(g.doshas).toHaveLength(expected.doshas.length);
    });
  }
});

describe("checkMangalDosha", () => {
  for (const f of [ref.delhi_1990, ref.mumbai_1985, ref.london_2000, ref.noon_fallback]) {
    it(`matches Python for ${f.input.dob}`, () => {
      const m = checkMangalDosha(chart(f));
      expect(m.isManglik).toBe(f.mangal.is_manglik);
      expect(m.marsHouse).toBe(f.mangal.mars_house);
    });
  }
});
