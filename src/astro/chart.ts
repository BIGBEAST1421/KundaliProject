import sweph from "sweph";
import {
  SIGNS, SIGN_LORDS, PLANETS, getSign, getSignIndex,
  type Body, type Planet, type Sign,
} from "./signs";
import { getNakshatra, type Nakshatra } from "./nakshatras";
import { getD10Sign } from "./d10";
import { getVimshottariDasha, type Dasha } from "./dasha";
import { localToUtc } from "./timezone";

const { constants: C } = sweph;

// Lahiri ayanamsa — standard for Indian Jyotish. Moshier ephemeris needs no data files.
sweph.set_sid_mode(C.SE_SIDM_LAHIRI, 0, 0);
const FLAG = C.SEFLG_SIDEREAL | C.SEFLG_MOSEPH;

const PLANET_IDS: Record<Exclude<Planet, "Ketu">, number> = {
  Sun: C.SE_SUN, Moon: C.SE_MOON, Mars: C.SE_MARS, Mercury: C.SE_MERCURY,
  Jupiter: C.SE_JUPITER, Venus: C.SE_VENUS, Saturn: C.SE_SATURN, Rahu: C.SE_MEAN_NODE,
};

export type BodyMap<T> = Record<Body, T>;

export interface Chart {
  ayanamsa: number;
  julianDay: number;
  /** "YYYY-MM-DD HH:mm UTC" */
  utcTime: string;
  lagna: Sign;
  lagnaDegree: number;
  lagnaSignIndex: number;
  /** Moon sign */
  rashi: Sign;
  sunSign: Sign;
  nakshatra: Nakshatra;
  sunNakshatra: Nakshatra;
  lagnaNakshatra: Nakshatra;
  longitudes: BodyMap<number>;
  /** Daily motion in degrees; negative = retrograde. Nodes are 0 (always retrograde by convention). */
  speeds: BodyMap<number>;
  degreesInSign: BodyMap<number>;
  d1: BodyMap<Sign>;
  d10: BodyMap<Sign>;
  houseOf: BodyMap<number>;
  d10HouseOf: BodyMap<number>;
  d10Lagna: Sign;
  dasha: Dasha;
  signLords: BodyMap<Planet>;
}

const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places;

/**
 * Full D1 (Rashi) + D10 (Dashamsha) chart with nakshatras, whole-sign houses from the
 * Lagna, and the Vimshottari dasha timeline. `today` only affects which dasha is current.
 */
export function computeChart(dob: string, time: string, lat: number, lon: number, today: Date = new Date()): Chart {
  const utc = localToUtc(dob, time, lat, lon);
  const jd = sweph.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60, C.SE_GREG_CAL);

  const ayanamsa = sweph.get_ayanamsa_ut(jd);
  const houses = sweph.houses_ex(jd, FLAG, lat, lon, "P");
  const ascLon = houses.data.points[0];

  const longitudes = {} as BodyMap<number>;
  const speeds = {} as BodyMap<number>;
  for (const p of PLANETS) {
    if (p === "Ketu") continue;
    const res = sweph.calc_ut(jd, PLANET_IDS[p] , FLAG | C.SEFLG_SPEED);
    if (res.flag < 0) throw new Error(`Ephemeris error for ${p}: ${res.error}`);
    longitudes[p] = round(res.data[0], 6);
    speeds[p] = p === "Rahu" ? 0 : round(res.data[3], 6);
  }
  longitudes.Ketu = (longitudes.Rahu + 180) % 360;
  speeds.Ketu = 0;
  longitudes.Ascendant = round(ascLon, 6);
  speeds.Ascendant = 0;

  const d1 = {} as BodyMap<Sign>;
  const d10 = {} as BodyMap<Sign>;
  const degreesInSign = {} as BodyMap<number>;
  const houseOf = {} as BodyMap<number>;
  const signLords = {} as BodyMap<Planet>;
  const lagnaSignIndex = getSignIndex(ascLon);

  for (const body of Object.keys(longitudes) as Body[]) {
    const l = longitudes[body];
    d1[body] = getSign(l);
    d10[body] = getD10Sign(l);
    degreesInSign[body] = round(l % 30, 4);
    houseOf[body] = body === "Ascendant" ? 1 : ((getSignIndex(l) - lagnaSignIndex + 12) % 12) + 1;
    signLords[body] = SIGN_LORDS[d1[body]];
  }

  const d10LagnaIdx = SIGNS.indexOf(d10.Ascendant);
  const d10HouseOf = {} as BodyMap<number>;
  for (const body of Object.keys(d10) as Body[]) {
    d10HouseOf[body] = body === "Ascendant" ? 1 : ((SIGNS.indexOf(d10[body]) - d10LagnaIdx + 12) % 12) + 1;
  }

  return {
    ayanamsa: round(ayanamsa, 6),
    julianDay: round(jd, 6),
    utcTime: utc.toFormat("yyyy-MM-dd HH:mm 'UTC'"),
    lagna: d1.Ascendant,
    lagnaDegree: round(ascLon % 30, 4),
    lagnaSignIndex,
    rashi: d1.Moon,
    sunSign: d1.Sun,
    nakshatra: getNakshatra(longitudes.Moon),
    sunNakshatra: getNakshatra(longitudes.Sun),
    lagnaNakshatra: getNakshatra(ascLon),
    longitudes,
    speeds,
    degreesInSign,
    d1,
    d10,
    houseOf,
    d10HouseOf,
    d10Lagna: d10.Ascendant,
    dasha: getVimshottariDasha(longitudes.Moon, dob, today),
    signLords,
  };
}
