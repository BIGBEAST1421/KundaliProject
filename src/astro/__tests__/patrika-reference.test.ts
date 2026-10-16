/**
 * External reference: a classical Parashari patrika ("ParasharPatrika" model, Chitrapaksha
 * ayanamsa, true Rahu) printed for 14 Aug 2000, 03:23, Bareilly. Every expectation below is read
 * off that document, so these tests pin the engine to what established Indian software produces.
 */
import { describe, it, expect } from "vitest";
import { computeChart } from "../chart";
import { checkMangalDosha, computeGunaMilan } from "../matching";
import { getDignity } from "../dignity";
import { gajakesari, viparitaRajaYoga } from "../yogas";
import { detectDebts } from "../lalkitab/debts";
import { getD9Sign } from "../varga";
import type { Body } from "../signs";

const c = computeChart("2000-08-14", "03:23", 28.367, 79.43, new Date("2026-10-16T00:00:00Z"));

/** Patrika degrees as "sign, d, m, s". */
const PATRIKA: Partial<Record<Body, [string, number, number, number]>> = {
  Sun: ["Cancer", 27, 33, 57], Moon: ["Capricorn", 13, 9, 27], Mars: ["Cancer", 14, 25, 50],
  Mercury: ["Cancer", 18, 56, 59], Jupiter: ["Taurus", 14, 0, 27], Venus: ["Leo", 14, 57, 58],
  Saturn: ["Taurus", 6, 20, 40], Rahu: ["Cancer", 0, 41, 33], Ketu: ["Capricorn", 0, 41, 33],
  Ascendant: ["Gemini", 27, 10, 1],
};

describe("patrika reference: Shivang, 14 Aug 2000 03:23 Bareilly", () => {
  it("places every body in the patrika's sign within a few arcminutes", () => {
    for (const [body, [sign, d, m, s]] of Object.entries(PATRIKA)) {
      expect(c.d1[body as Body], body).toBe(sign);
      // The Lagna differs by ~2′ from slightly different town coordinates; planets match to the arcsecond.
      expect(Math.abs(c.degreesInSign[body as Body] - (d + m / 60 + s / 3600)), body).toBeLessThan(body === "Ascendant" ? 0.05 : 0.01);
    }
  });

  it("uses the true node: Rahu in the 2nd, Ketu in the 8th", () => {
    expect(c.houseOf.Rahu).toBe(2);
    expect(c.houseOf.Ketu).toBe(8);
  });

  it("matches the patrika's dignities (स्थिति)", () => {
    const dig = (p: "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu") => getDignity(p, c.d1[p], c.degreesInSign[p]);
    expect(dig("Sun")).toBe("friendly");
    expect(dig("Moon")).toBe("neutral");
    expect(dig("Mars")).toBe("debilitated");
    expect(dig("Mercury")).toBe("enemy");
    expect(dig("Jupiter")).toBe("enemy");
    expect(dig("Venus")).toBe("enemy");
    expect(dig("Saturn")).toBe("friendly");
    expect(dig("Rahu")).toBe("enemy");
    expect(dig("Ketu")).toBe("enemy");
  });

  it("matches the Navamsa (Rahu in Cancer, Ketu in Capricorn) and Dashamsha Lagna", () => {
    expect(getD9Sign(c.longitudes.Ascendant)).toBe("Gemini");
    expect(getD9Sign(c.longitudes.Rahu)).toBe("Cancer");
    expect(getD9Sign(c.longitudes.Ketu)).toBe("Capricorn");
    expect(c.d10Lagna).toBe("Pisces");
  });

  it("matches the Vimshottari timeline", () => {
    expect(c.nakshatra.name).toBe("Shravana");
    expect(c.nakshatra.pada).toBe(1);
    expect(c.dasha.allMahadashas.slice(0, 4).map((m) => [m.lord, m.end])).toEqual([
      ["Moon", "Apr 2008"], ["Mars", "Apr 2015"], ["Rahu", "Apr 2033"], ["Jupiter", "Apr 2049"],
    ]);
    expect(c.dasha.mahadasha).toBe("Rahu");
    expect(c.dasha.antardasha).toBe("Ketu");
    expect(c.dasha.antardashaEnd).toBe("Oct 2026");
  });

  it("matches the Avakahada chakra", () => {
    const k = Object.fromEntries(computeGunaMilan(c, c).kootas.map((x) => [x.name, x.boy]));
    expect(k.Varna).toBe("Vaishya");
    expect(k.Vashya).toBe("Jalachara");
    expect(k.Yoni).toBe("Monkey");
    expect(k.Gana).toBe("Deva");
    expect(k.Nadi).toBe("Antya");
  });

  it("is Manglik from the Moon only, and that placement is cancelled (मांगलिक, दोष समाप्त)", () => {
    const m = checkMangalDosha(c);
    expect(m.fromLagna).toBe(false); // Mars in the 2nd is not counted
    expect(m.fromMoon).toBe(true); // 7th from the Moon
    expect(m.cancelled).toBe(true);
    expect(m.isManglik).toBe(false);
  });

  it("finds Gajakesari and Vipreet Raj Yoga", () => {
    expect(gajakesari(c).present).toBe(true);
    expect(viparitaRajaYoga(c).present).toBe(true);
  });

  it("finds exactly the patrika's Lal Kitab debts: Parivarik, Pitra and Stri", () => {
    expect(detectDebts(c).filter((d) => d.present).map((d) => d.key).sort()).toEqual(["parivarik", "pitra", "stri"]);
  });
});
