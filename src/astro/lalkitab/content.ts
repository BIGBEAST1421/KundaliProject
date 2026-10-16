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
  swa: {
    en: { name: "Swa Rin", meaning: "The self-debt, read from Venus, Saturn or Rahu in the 5th house. Lal Kitab links it to drifting from family faith and custom, felt as unearned blame or setbacks in one's own name." },
    hi: { name: "स्व ऋण", meaning: "पाँचवें खाने में शुक्र, शनि या राहु से बनने वाला स्वयं का ऋण। लाल किताब इसे पारिवारिक आस्था और रीति-रिवाज़ से दूरी से जोड़ती है, जो बिना दोष के दंड या रुकावटों के रूप में महसूस होता है।" },
  },
  matri: {
    en: { name: "Matri Rin", meaning: "The maternal debt, read from Ketu in the 4th house. Felt as effort that doesn't bear fruit and unease connected to one's mother or home." },
    hi: { name: "मातृ ऋण", meaning: "चौथे खाने में केतु से बनने वाला मातृ ऋण। प्रयासों के निष्फल होने और माँ या घर से जुड़ी बेचैनी के रूप में महसूस होता है।" },
  },
  parivarik: {
    en: { name: "Parivarik Rin", meaning: "The debt to relatives, read from Mercury or Ketu in the 1st or 8th house. Felt as strained ties with relatives and being let down by people close to you." },
    hi: { name: "पारिवारिक ऋण", meaning: "पहले या आठवें खाने में बुध या केतु से बनने वाला रिश्तेदारों का ऋण। रिश्तेदारों से तनाव और करीबी लोगों से धोखे के रूप में महसूस होता है।" },
  },
  behan: {
    en: { name: "Behan/Kanya Rin", meaning: "The debt to a sister or daughter, read from the Moon in the 3rd or 6th house. Felt as sudden reversals in money and family happiness." },
    hi: { name: "बहन/कन्या ऋण", meaning: "तीसरे या छठे खाने में चंद्रमा से बनने वाला बहन या बेटी का ऋण। धन और पारिवारिक सुख में अचानक उलटफेर के रूप में महसूस होता है।" },
  },
  pitra: {
    en: { name: "Pitra Rin", meaning: "The ancestral debt, read from Venus, Mercury or Rahu in the 2nd, 5th, 9th or 12th house. Felt as obstacles that seem to come from the family line rather than one's own actions." },
    hi: { name: "पितृ ऋण", meaning: "दूसरे, पाँचवें, नौवें या बारहवें खाने में शुक्र, बुध या राहु से बनने वाला पैतृक ऋण। ऐसी रुकावटों के रूप में महसूस होता है जो अपने कर्मों से नहीं, कुल-परंपरा से आती लगती हैं।" },
  },
  stri: {
    en: { name: "Stri Rin", meaning: "The debt connected to women, read from the Sun, Rahu or Ketu in the 2nd or 7th house. Classically felt in family harmony and in sudden upsets around joyful occasions." },
    hi: { name: "स्त्री ऋण", meaning: "दूसरे या सातवें खाने में सूर्य, राहु या केतु से बनने वाला स्त्री ऋण। परंपरागत रूप से पारिवारिक सामंजस्य और खुशी के अवसरों पर अचानक विघ्न के रूप में महसूस होता है।" },
  },
  nirdayi: {
    en: { name: "Nirdayi Rin", meaning: "The debt of cruelty, read from the Sun, Moon or Mars in the 10th or 11th house. Felt as disputes, litigation and setbacks around property." },
    hi: { name: "निर्दयी ऋण", meaning: "दसवें या ग्यारहवें खाने में सूर्य, चंद्र या मंगल से बनने वाला निर्दयी ऋण। झगड़ों, मुकदमों और संपत्ति से जुड़ी रुकावटों के रूप में महसूस होता है।" },
  },
  ajanma: {
    en: { name: "Ajanma Rin", meaning: "The debt of the unborn, read from the Sun or Venus in the 12th house. Felt as sudden losses and being deceived despite careful effort." },
    hi: { name: "अजन्मा ऋण", meaning: "बारहवें खाने में सूर्य या शुक्र से बनने वाला अजन्मा ऋण। सावधानी के बावजूद अचानक हानि और ठगी के रूप में महसूस होता है।" },
  },
  deva: {
    en: { name: "Ishwariya Rin", meaning: "The divine debt, read from the Moon in the 6th house. Felt as misplaced trust and setbacks around children and travel." },
    hi: { name: "ईश्वरीय ऋण", meaning: "छठे खाने में चंद्रमा से बनने वाला ईश्वरीय ऋण। गलत भरोसे और संतान व यात्रा से जुड़ी रुकावटों के रूप में महसूस होता है।" },
  },
};

const FAMILY = { en: "Collect an equal amount of money from every blood relative (grandparents, parents, siblings, uncles' families)", hi: "परिवार के हर खून के रिश्ते (दादा-दादी, माता-पिता, भाई-बहन, चाचा-ताया के परिवार) से बराबर-बराबर धन लेकर" };

export const DEBT_REMEDIES: Record<DebtKey, Localized<Remedy[]>> = {
  swa: {
    en: [{ icon: "🔥", title: "A family havan", desc: `${FAMILY.en} and perform a havan together.` }],
    hi: [{ icon: "🔥", title: "पारिवारिक हवन", desc: `${FAMILY.hi} मिलकर हवन करें।` }],
  },
  matri: {
    en: [{ icon: "🌊", title: "Silver in flowing water", desc: `${FAMILY.en}, buy silver with it and immerse it in flowing water on the same day.` }],
    hi: [{ icon: "🌊", title: "बहते पानी में चाँदी", desc: `${FAMILY.hi} उससे चाँदी खरीदें और उसी दिन बहते पानी में प्रवाहित करें।` }],
  },
  parivarik: {
    en: [{ icon: "🤝", title: "Help a local craftsman or healer", desc: `${FAMILY.en} and give it to a craftsman or doctor in your town to grow their work.` }],
    hi: [{ icon: "🤝", title: "स्थानीय कारीगर या वैद्य की मदद", desc: `${FAMILY.hi} अपने शहर/गाँव के किसी कारीगर या हकीम/डॉक्टर को उसका काम बढ़ाने के लिए दान दें।` }],
  },
  behan: {
    en: [{ icon: "🐚", title: "Yellow cowries in flowing water", desc: "Collect yellow cowries from family members, burn them to ash and immerse the ash in flowing water on the same day." }],
    hi: [{ icon: "🐚", title: "बहते पानी में पीली कौड़ियाँ", desc: "परिवार के सदस्यों से पीली कौड़ियाँ लेकर उन्हें जलाकर राख करें और उसी दिन राख बहते पानी में प्रवाहित करें।" }],
  },
  pitra: {
    en: [{ icon: "🛕", title: "A temple donation from the whole family", desc: `${FAMILY.en} and donate it at a temple on the same day.` }],
    hi: [{ icon: "🛕", title: "पूरे परिवार की ओर से मंदिर में दान", desc: `${FAMILY.hi} उसी दिन मंदिर में दान करें।` }],
  },
  stri: {
    en: [{ icon: "🐄", title: "Feed 100 cows", desc: `${FAMILY.en} and use it to feed 100 healthy cows at a gaushala.` }],
    hi: [{ icon: "🐄", title: "100 गायों को चारा", desc: `${FAMILY.hi} गौशाला में 100 स्वस्थ गायों को चारा खिलाएँ।` }],
  },
  nirdayi: {
    en: [{ icon: "🍲", title: "Feed 100 labourers", desc: `${FAMILY.en} and feed 100 labourers on a single day.` }],
    hi: [{ icon: "🍲", title: "100 मजदूरों को भोजन", desc: `${FAMILY.hi} एक ही दिन 100 मजदूरों को भोजन कराएँ।` }],
  },
  ajanma: {
    en: [{ icon: "🥥", title: "Coconuts in flowing water", desc: "Collect one coconut from each family member and immerse them all in flowing water on the same day." }],
    hi: [{ icon: "🥥", title: "बहते पानी में नारियल", desc: "परिवार के हर सदस्य से एक-एक नारियल लेकर उसी दिन सभी को बहते पानी में प्रवाहित करें।" }],
  },
  deva: {
    en: [{ icon: "🐕", title: "Feed dogs", desc: `${FAMILY.en} and use it to feed stray dogs.` }],
    hi: [{ icon: "🐕", title: "कुत्तों को भोजन", desc: `${FAMILY.hi} आवारा कुत्तों को भोजन कराएँ।` }],
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
