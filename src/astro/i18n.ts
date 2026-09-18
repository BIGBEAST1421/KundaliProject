/**
 * Static Hindi vocabulary for fixed astrological terms — signs, planets, nakshatras, dignities.
 * This is a finite, well-known vocabulary (12 signs, 9 planets, 27 nakshatras, 7 dignities), so
 * it's a lookup table rather than something routed through AI translation: instant, free, and
 * with no risk of the model mistranslating a technical term.
 */
import type { Sign, Body } from "./signs";
import type { Dignity } from "./dignity";
import type { Language } from "@/src/reports/types";

const SIGN_HI: Record<Sign, string> = {
  Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या",
  Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन",
};

const PLANET_HI: Record<Body, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र",
  Saturn: "शनि", Rahu: "राहु", Ketu: "केतु", Ascendant: "लग्न",
};

const PLANET_ABBR_HI: Record<Body, string> = {
  Sun: "सू", Moon: "चं", Mars: "मं", Mercury: "बु", Jupiter: "गु", Venus: "शु",
  Saturn: "श", Rahu: "रा", Ketu: "के", Ascendant: "लग्न",
};

const NAKSHATRA_HI: Record<string, string> = {
  Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी", Mrigashira: "मृगशिरा",
  Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य", Ashlesha: "आश्लेषा", Magha: "मघा",
  "Purva Phalguni": "पूर्वा फाल्गुनी", "Uttara Phalguni": "उत्तरा फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा",
  Swati: "स्वाति", Vishakha: "विशाखा", Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा", Mula: "मूल",
  "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा", Shravana: "श्रवण", Dhanishta: "धनिष्ठा",
  Shatabhisha: "शतभिषा", "Purva Bhadrapada": "पूर्वा भाद्रपद", "Uttara Bhadrapada": "उत्तरा भाद्रपद", Revati: "रेवती",
};

const DIGNITY_HI: Record<Dignity, string> = {
  exalted: "उच्च", moolatrikona: "मूलत्रिकोण", own: "स्वराशि", friendly: "मित्र राशि",
  neutral: "सम राशि", enemy: "शत्रु राशि", debilitated: "नीच",
};

export function signLabel(sign: string, lang: Language): string {
  return lang === "hi" ? (SIGN_HI[sign as Sign] ?? sign) : sign;
}
export function planetLabel(body: string, lang: Language): string {
  return lang === "hi" ? (PLANET_HI[body as Body] ?? body) : body;
}
export function planetAbbrLabel(body: string, lang: Language): string {
  return lang === "hi" ? (PLANET_ABBR_HI[body as Body] ?? body.slice(0, 2)) : body;
}
export function nakshatraLabel(name: string, lang: Language): string {
  return lang === "hi" ? (NAKSHATRA_HI[name] ?? name) : name;
}
export function dignityLabelHi(dignity: Dignity): string {
  return DIGNITY_HI[dignity];
}
