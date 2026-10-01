/**
 * Static, hand-authored bilingual content for Lal Kitab debts and planet status — deliberately
 * never routed through AI translation (unlike the chart-specific rule prose, which is). This is
 * generic text that reads identically for every chart with a given debt/status, so it belongs
 * here as fixed data, the same way `KOOTA_INFO` in `src/reports/buildMatch.ts` holds generic
 * koota framing text.
 */
import type { DebtKey } from "./debts";
import type { PlanetStatus } from "./status";
import type { Language } from "@/src/reports/types";

interface Remedy { icon: string; title: string; desc: string }
interface Localized<T> { en: T; hi: T }

export const DEBT_INFO: Record<DebtKey, Localized<{ name: string; meaning: string }>> = {
  pitra: {
    en: { name: "Pitra Rin", meaning: "An ancestral debt Lal Kitab ties to an afflicted Sun. Often felt as friction with or unfinished duty toward one's father or senior family figures." },
    hi: { name: "पितृ ऋण", meaning: "लाल किताब के अनुसार यह पीड़ित सूर्य से जुड़ा एक पैतृक ऋण है। अक्सर पिता या परिवार के बड़ों के प्रति अधूरे कर्तव्य या तनाव के रूप में महसूस होता है।" },
  },
  matri: {
    en: { name: "Matri Rin", meaning: "A maternal debt tied to an afflicted Moon. Often felt as emotional unease connected to one's mother or home life." },
    hi: { name: "मातृ ऋण", meaning: "यह पीड़ित चंद्रमा से जुड़ा एक मातृ ऋण है। अक्सर माँ या घरेलू जीवन से जुड़ी भावनात्मक बेचैनी के रूप में महसूस होता है।" },
  },
  deva: {
    en: { name: "Deva Rin", meaning: "A debt to the divine or to one's teachers, tied to an afflicted Jupiter. Often felt as blocked wisdom, wealth or guidance until it is addressed." },
    hi: { name: "देव ऋण", meaning: "यह पीड़ित गुरु (बृहस्पति) से जुड़ा देवताओं या गुरुजनों का ऋण है। अक्सर ज्ञान, धन या मार्गदर्शन में रुकावट के रूप में महसूस होता है, जब तक इसका निवारण न हो।" },
  },
  stri: {
    en: { name: "Stri Rin", meaning: "A debt connected to women, tied to an afflicted Venus. Classically linked to past conduct toward women and felt in relationship harmony." },
    hi: { name: "स्त्री ऋण", meaning: "यह पीड़ित शुक्र से जुड़ा स्त्री ऋण है। परंपरागत रूप से स्त्रियों के प्रति आचरण से जुड़ा माना जाता है और रिश्तों के सामंजस्य में महसूस होता है।" },
  },
};

export const DEBT_REMEDIES: Record<DebtKey, Localized<Remedy[]>> = {
  pitra: {
    en: [
      { icon: "🐦", title: "Feed crows on Saturdays", desc: "Offer roti with jaggery to crows every Saturday morning, a classical Lal Kitab remedy for Sun-Saturn affliction." },
      { icon: "🌳", title: "Water the Peepal tree", desc: "Pour water on a Peepal tree at sunrise, and speak to your father (or father figures) with patience and respect." },
    ],
    hi: [
      { icon: "🐦", title: "शनिवार को कौवों को खिलाएँ", desc: "हर शनिवार सुबह कौवों को गुड़ के साथ रोटी खिलाएँ, सूर्य-शनि पीड़ा के लिए एक पारंपरिक लाल किताब उपाय।" },
      { icon: "🌳", title: "पीपल के पेड़ को जल चढ़ाएँ", desc: "सूर्योदय के समय पीपल के पेड़ पर जल चढ़ाएँ, और पिता (या पितृतुल्य व्यक्तियों) से धैर्य और सम्मान से बात करें।" },
    ],
  },
  matri: {
    en: [
      { icon: "🥛", title: "Offer milk on Mondays", desc: "Offer milk to a Shivling on Mondays, and keep your mother's wellbeing and comfort a visible priority." },
      { icon: "🍚", title: "Donate rice or milk to a woman in need", desc: "A simple donation of rice or milk to a woman in need, done consistently, is the classical remedy here." },
    ],
    hi: [
      { icon: "🥛", title: "सोमवार को दूध चढ़ाएँ", desc: "सोमवार को शिवलिंग पर दूध चढ़ाएँ, और अपनी माँ की भलाई और सुविधा को स्पष्ट प्राथमिकता दें।" },
      { icon: "🍚", title: "किसी ज़रूरतमंद महिला को चावल या दूध दान करें", desc: "किसी ज़रूरतमंद महिला को नियमित रूप से चावल या दूध दान करना यहाँ का पारंपरिक उपाय है।" },
    ],
  },
  deva: {
    en: [
      { icon: "📿", title: "Donate on Thursdays", desc: "Donate turmeric, chana dal or yellow items on Thursdays, and keep a visible habit of respecting teachers and elders." },
      { icon: "🙏", title: "Offer prayers to Vishnu or your guru", desc: "A brief, consistent prayer practice tied to Jupiter's day helps address this debt classically." },
    ],
    hi: [
      { icon: "📿", title: "गुरुवार को दान करें", desc: "गुरुवार को हल्दी, चना दाल या पीली वस्तुएँ दान करें, और गुरुजनों व बड़ों के सम्मान की आदत बनाए रखें।" },
      { icon: "🙏", title: "विष्णु या अपने गुरु की पूजा करें", desc: "बृहस्पति के दिन से जुड़ी एक संक्षिप्त, नियमित प्रार्थना इस ऋण के निवारण में पारंपरिक रूप से सहायक मानी जाती है।" },
    ],
  },
  stri: {
    en: [
      { icon: "🤍", title: "Donate white sweets on Fridays", desc: "Donate white sweets or clothing on Fridays, and make a conscious practice of respect and fairness toward women in daily life." },
    ],
    hi: [
      { icon: "🤍", title: "शुक्रवार को सफ़ेद मिठाई दान करें", desc: "शुक्रवार को सफ़ेद मिठाई या वस्त्र दान करें, और दैनिक जीवन में स्त्रियों के प्रति सम्मान और निष्पक्षता का सचेत अभ्यास करें।" },
    ],
  },
};

export const STATUS_LABEL: Record<PlanetStatus, Localized<string>> = {
  awake: { en: "Awake", hi: "जागृत" },
  sleeping: { en: "Sleeping", hi: "सुप्त" },
  static: { en: "Static", hi: "स्थिर" },
};

export function debtNameLabel(key: DebtKey, lang: Language): string {
  return DEBT_INFO[key][lang].name;
}
export function debtMeaningLabel(key: DebtKey, lang: Language): string {
  return DEBT_INFO[key][lang].meaning;
}
export function debtRemedies(key: DebtKey, lang: Language): Remedy[] {
  return DEBT_REMEDIES[key][lang];
}
export function planetStatusLabel(status: PlanetStatus, lang: Language): string {
  return STATUS_LABEL[status][lang];
}
