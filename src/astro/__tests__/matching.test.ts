import { describe, it, expect } from "vitest";
import ref from "@/fixtures/python_reference.json";
import { computeChart } from "../chart";
import { computeGunaMilan, checkMangalDosha } from "../matching";
import { syntheticChart } from "./synthetic";

const TODAY = new Date("2026-09-18T00:00:00Z");
const chart = (f: typeof ref.delhi_1990) => computeChart(f.input.dob, f.input.time, f.input.lat, f.input.lon, TODAY);

/** Kootas the Python reference scored the classical way. Yoni and Graha Maitri now use the
 * standard tables (the Python port collapsed them), so they are tested on their own below. */
const UNCHANGED = new Set(["Varna", "Vashya", "Tara", "Gana", "Bhakoot", "Nadi"]);

describe("computeGunaMilan", () => {
  const pairs = [
    [ref.delhi_1990, ref.mumbai_1985, ref.guna_delhi_mumbai],
    [ref.london_2000, ref.delhi_1990, ref.guna_london_delhi],
  ] as const;
  for (const [a, b, expected] of pairs) {
    it(`matches Python scores for ${a.input.dob} × ${b.input.dob} on the unchanged kootas`, () => {
      const g = computeGunaMilan(chart(a), chart(b));
      expect(g.max).toBe(36);
      expect(g.kootas.filter((k) => UNCHANGED.has(k.name)).map((k) => [k.name, k.points, k.max])).toEqual(
        expected.kootas.filter((k) => UNCHANGED.has(k.name)).map((k) => [k.name, k.points, k.max]),
      );
      expect(g.total).toBe(g.kootas.reduce((s, k) => s + k.points, 0));
    });
  }

  const koota = (boyMoon: [string, number], girlMoon: [string, number], name: string) =>
    computeGunaMilan(
      syntheticChart("Aries", { Moon: boyMoon as never }),
      syntheticChart("Aries", { Moon: girlMoon as never }),
    ).kootas.find((k) => k.name === name)!;

  it("scores Graha Maitri from the standard table", () => {
    expect(koota(["Cancer", 5], ["Gemini", 5], "Graha Maitri").points).toBe(1); // Moon→Mercury friend, Mercury→Moon enemy
    expect(koota(["Leo", 5], ["Taurus", 5], "Graha Maitri").points).toBe(0); // Sun↔Venus enemies
    expect(koota(["Cancer", 5], ["Capricorn", 5], "Graha Maitri").points).toBe(0.5); // Moon neutral, Saturn enemy
    expect(koota(["Leo", 5], ["Aries", 5], "Graha Maitri").points).toBe(5); // Sun↔Mars friends
  });

  it("scores Yoni from the standard matrix", () => {
    expect(koota(["Aries", 5], ["Aries", 5], "Yoni").points).toBe(4); // Ashwini × Ashwini: same yoni
    expect(koota(["Aries", 5], ["Libra", 10], "Yoni").points).toBe(0); // Horse × Buffalo (Swati): sworn enemies
    expect(koota(["Aries", 5], ["Capricorn", 15], "Yoni").points).toBe(3); // Horse × Monkey (Shravana): friendly
  });
});

describe("checkMangalDosha", () => {
  for (const f of [ref.delhi_1990, ref.mumbai_1985, ref.london_2000, ref.noon_fallback]) {
    it(`places Mars in the same house as Python for ${f.input.dob}`, () => {
      expect(checkMangalDosha(chart(f)).marsHouse).toBe(f.mangal.mars_house);
    });
  }

  it("is Manglik when a placement is left uncancelled", () => {
    const m = checkMangalDosha(syntheticChart("Aries", { Mars: "Libra", Moon: "Leo" })); // 7th from Lagna, not exempt
    expect(m.present).toBe(true);
    expect(m.isManglik).toBe(true);
  });

  it("is not Manglik when every placement is cancelled", () => {
    // Mars in Cancer: 4th from Aries lagna is not exempt, so use a Lagna where Mars is not Manglik
    // and a Moon that puts it 7th in Cancer — the classical 7th-house exemption.
    const m = checkMangalDosha(syntheticChart("Taurus", { Mars: "Cancer", Moon: "Capricorn", Jupiter: "Gemini" }));
    expect(m.fromLagna).toBe(false);
    expect(m.fromMoon).toBe(true);
    expect(m.cancelled).toBe(true);
    expect(m.isManglik).toBe(false);
  });
});
