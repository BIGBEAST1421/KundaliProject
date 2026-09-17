/** Build a Chart from sign placements for yoga/rule tests (degrees default to 15° in sign). */
import type { Chart } from "../chart";
import { SIGNS, SIGN_LORDS, type Body, type Sign, type Planet } from "../signs";
import { getNakshatra } from "../nakshatras";
import { getD10Sign } from "../d10";

const QUIET: Record<Planet, Sign> = { Sun: "Leo", Moon: "Cancer", Mars: "Gemini", Mercury: "Virgo", Jupiter: "Pisces", Venus: "Taurus", Saturn: "Aquarius", Rahu: "Sagittarius", Ketu: "Gemini" };

export function syntheticChart(lagna: Sign, placements: Partial<Record<Planet, Sign | [Sign, number]>>, dasha = { md: "Saturn", ad: "Jupiter" }): Chart {
  const li = SIGNS.indexOf(lagna);
  const bodies: Body[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Ascendant"];
  const longitudes = {} as Record<Body, number>;
  for (const b of bodies) {
    if (b === "Ascendant") { longitudes[b] = li * 30 + 10; continue; }
    // Unplaced planets go to a quiet spread so they do not accidentally form yogas.
    const p = placements[b] ?? QUIET[b as Planet];
    const [sign, deg] = Array.isArray(p) ? p : [p, 15];
    longitudes[b] = SIGNS.indexOf(sign) * 30 + deg;
  }
  const d1 = {} as Record<Body, Sign>, d10 = {} as Record<Body, Sign>, houseOf = {} as Record<Body, number>;
  const degreesInSign = {} as Record<Body, number>, speeds = {} as Record<Body, number>, signLords = {} as Record<Body, Planet>, d10HouseOf = {} as Record<Body, number>;
  for (const b of bodies) {
    d1[b] = SIGNS[Math.floor(longitudes[b] / 30)];
    d10[b] = getD10Sign(longitudes[b]);
    houseOf[b] = b === "Ascendant" ? 1 : ((SIGNS.indexOf(d1[b]) - li + 12) % 12) + 1;
    degreesInSign[b] = longitudes[b] % 30;
    speeds[b] = 1;
    signLords[b] = SIGN_LORDS[d1[b]];
    d10HouseOf[b] = 1;
  }
  const period = { lord: dasha.md, start: "Jan 2020", end: "Jan 2040", current: true };
  return {
    ayanamsa: 24, julianDay: 0, utcTime: "", lagna, lagnaDegree: 10, lagnaSignIndex: li,
    rashi: d1.Moon, sunSign: d1.Sun, nakshatra: getNakshatra(longitudes.Moon), sunNakshatra: getNakshatra(longitudes.Sun), lagnaNakshatra: getNakshatra(longitudes.Ascendant),
    longitudes, speeds, degreesInSign, d1, d10, houseOf, d10HouseOf, d10Lagna: d10.Ascendant, signLords,
    dasha: { mahadasha: dasha.md as Planet, mahadashaStart: "Jan 2020", mahadashaEnd: "Jan 2040", antardasha: dasha.ad as Planet, antardashaStart: "Jan 2025", antardashaEnd: "Jan 2028", allMahadashas: [period as never], antardashas: [{ ...period, lord: dasha.ad } as never] },
  };
}
