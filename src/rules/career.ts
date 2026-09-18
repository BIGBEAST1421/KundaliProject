import type { Rule } from "./types";

const GOOD = ["exalted", "moolatrikona", "own", "friendly"] as const;
const WEAK = ["enemy", "debilitated"] as const;

/** Career and status: 10th house, its lord, Sun, Saturn, D10, Raja Yogas, dasha timing. */
export const CAREER_RULES: Rule[] = [
  {
    id: "c-10lord-kendra-trikona-strong", domain: "career", weight: 3, positive: true,
    title: "A strong 10th lord",
    conditions: [{ type: "houseLordInHouse", house: 10, inHouses: [1, 4, 5, 7, 9, 10, 11] }, { type: "houseLordDignity", house: 10, in: [...GOOD] }],
    text: "a career that rises steadily with recognition. Authority comes to you and you handle it well.",
  },
  {
    id: "c-10lord-dusthana", domain: "career", weight: 3, positive: false,
    title: "10th lord in a difficult house",
    conditions: [{ type: "houseLordInHouse", house: 10, inHouses: [6, 8, 12] }, { type: "not", condition: { type: "yoga", key: "viparita", present: true } }],
    text: "detours in career: jobs that change, service roles, or work behind the scenes before recognition arrives. Persistence and a specialised skill turn this around.",
  },
  {
    id: "c-dharma-karma", domain: "career", weight: 3, positive: true,
    title: "Dharma-Karmadhipati Yoga",
    conditions: [{ type: "yoga", key: "dharma-karmadhipati", present: true }],
    text: "a career with purpose and public respect. Work and fortune support each other, and mentors or seniors open doors.",
  },
  {
    id: "c-rajayoga-active", domain: "career", weight: 3, positive: true,
    title: "Raja Yoga active in the current dasha",
    conditions: [{ type: "yoga", key: "kendra-trikona", present: true, cancelled: false }],
    text: "a rise in position and status. The effect is strongest while the dasha of a participating planet runs, so timing matters more than the yoga alone.",
  },
  {
    id: "c-viparita", domain: "career", weight: 2, positive: true,
    title: "Viparita Raja Yoga",
    conditions: [{ type: "yoga", key: "viparita", present: true }],
    text: "gains through reversals: a setback, a closed door or a rival's mistake becomes your opening. Careers in crisis handling, law, medicine or turnaround roles fit this pattern.",
  },
  {
    id: "c-sun-10", domain: "career", weight: 2, positive: true,
    title: "Sun in the 10th",
    conditions: [{ type: "planetInHouse", planet: "Sun", houses: [10] }, { type: "planetDignity", planet: "Sun", in: [...GOOD, "neutral"] }],
    text: "a natural pull toward leadership, government, administration or any role with visible authority. You are meant to be seen at work.",
  },
  {
    id: "c-saturn-10-strong", domain: "career", weight: 2, positive: true,
    title: "Saturn dignified in the 10th",
    conditions: [{ type: "planetInHouse", planet: "Saturn", houses: [10] }, { type: "planetDignity", planet: "Saturn", in: [...GOOD] }],
    text: "slow, solid growth through discipline. Institutions, engineering, law, real estate or long-term organisations reward you; shortcuts do not.",
  },
  {
    id: "c-saturn-10-weak", domain: "career", weight: 2, positive: false,
    title: "Saturn weak in the 10th",
    conditions: [{ type: "planetInHouse", planet: "Saturn", houses: [10] }, { type: "planetDignity", planet: "Saturn", in: [...WEAK] }],
    text: "delays and heavy workloads early in the career, sometimes under difficult bosses. Results arrive later than peers but last longer.",
  },
  {
    id: "c-mercury-10", domain: "career", weight: 2, positive: true,
    title: "Mercury influences the 10th",
    conditions: [{ type: "planetInHouse", planet: "Mercury", houses: [10] }, { type: "planetDignity", planet: "Mercury", in: [...GOOD, "neutral"] }],
    text: "success through communication, analysis, trade or technology. Writing, consulting, finance and teaching all fit.",
  },
  {
    id: "c-jupiter-aspect-10", domain: "career", weight: 2, positive: true,
    title: "Jupiter blesses the 10th",
    conditions: [{ type: "aspect", from: "Jupiter", toHouse: 10 }, { type: "planetDignity", planet: "Jupiter", in: [...GOOD, "neutral"] }],
    text: "ethical standing and good counsel in your work. Roles in advising, teaching, law, finance or guidance suit you, and your reputation protects you.",
  },
  {
    id: "c-rahu-10", domain: "career", weight: 2, positive: true,
    title: "Rahu in the 10th",
    conditions: [{ type: "planetInHouse", planet: "Rahu", houses: [10] }],
    text: "an unconventional, ambitious career path: technology, foreign connections, media or anything new. Big rises are possible; keep your ethics tight.",
  },
  {
    id: "c-ketu-10", domain: "career", weight: 1, positive: false,
    title: "Ketu in the 10th",
    conditions: [{ type: "planetInHouse", planet: "Ketu", houses: [10] }],
    text: "a detached attitude to status. Work that has meaning matters more than titles, and you may change fields to find it.",
  },
  {
    id: "c-d10-lagna-lord-strong", domain: "career", weight: 2, positive: true,
    title: "Dasamsa supports the career",
    conditions: [{ type: "vargaHouseLordInHouse", varga: "D10", house: 10, inHouses: [1, 4, 5, 7, 9, 10, 11] }],
    text: "that the career chart (D10) backs your ambitions. The profession itself becomes a source of identity and pride.",
  },
  {
    id: "c-d10-10lord-dusthana", domain: "career", weight: 2, positive: false,
    title: "Dasamsa 10th lord in a hard house",
    conditions: [{ type: "vargaHouseLordInHouse", varga: "D10", house: 10, inHouses: [6, 8, 12] }],
    text: "that in the career chart, growth comes through service, research or working abroad or in the background. Visibility takes effort.",
  },
  {
    id: "c-10lord-dasha", domain: "career", weight: 3, positive: true,
    title: "10th lord's period is running",
    conditions: [{ type: "houseLordIs", house: 10, planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] }, { type: "dashaLord", level: "any", planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] }],
    text: "that this period can activate career results directly, since a dasha lord is tied to the 10th house. Promotions, new roles or a change of direction are timely now.",
  },
  {
    id: "c-mars-10", domain: "career", weight: 2, positive: true,
    title: "Mars in the 10th",
    conditions: [{ type: "planetInHouse", planet: "Mars", houses: [10] }, { type: "planetDignity", planet: "Mars", in: [...GOOD, "neutral"] }],
    text: "drive and courage at work. Engineering, defence, sports, surgery, property or any field where decisive action counts rewards you.",
  },
  {
    id: "c-moon-10", domain: "career", weight: 1, positive: true,
    title: "Moon in the 10th",
    conditions: [{ type: "planetInHouse", planet: "Moon", houses: [10] }],
    text: "public-facing work and a career that moves with the public mood: hospitality, care, marketing, arts or anything people-centred.",
  },
  {
    id: "c-10-empty-lord-weak", domain: "career", weight: 1, positive: false,
    title: "Quiet 10th with a weak lord",
    conditions: [{ type: "houseEmptyOf", house: 10, planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"] }, { type: "houseLordDignity", house: 10, in: [...WEAK] }],
    text: "that career direction may take time to crystallise. Following the 10th lord's dasha and the D10 chart gives clearer timing than the main chart alone.",
  },
];
