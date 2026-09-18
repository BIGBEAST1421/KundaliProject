import type { Rule } from "./types";

const MALEFICS = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"] as const;
const GOOD = ["exalted", "moolatrikona", "own", "friendly"] as const;
const WEAK = ["enemy", "debilitated"] as const;

/** Marriage and partnership: 7th house, Venus, Jupiter (for women, classically), D9, Mangal Dosha. */
export const MARRIAGE_RULES: Rule[] = [
  {
    id: "m-7lord-strong-kendra-trikona", domain: "marriage", weight: 3, positive: true,
    title: "A well-placed 7th lord",
    conditions: [{ type: "houseLordInHouse", house: 7, inHouses: [1, 4, 5, 7, 9, 10, 11] }, { type: "houseLordDignity", house: 7, in: [...GOOD] }],
    text: "a steady, supportive marriage where the partner adds to your standing. Partnership tends to strengthen you rather than drain you.",
  },
  {
    id: "m-7lord-dusthana-weak", domain: "marriage", weight: 3, positive: false,
    title: "7th lord in a difficult house",
    conditions: [{ type: "houseLordInHouse", house: 7, inHouses: [6, 8, 12] }, { type: "houseLordDignity", house: 7, in: [...WEAK, "neutral"] }],
    text: "friction or distance in partnership that needs conscious care: misunderstandings, health or money stress spilling into the relationship. Patience and honest conversation soften this a lot.",
  },
  {
    id: "m-venus-strong-7", domain: "marriage", weight: 3, positive: true,
    title: "Venus strong in the 7th",
    conditions: [{ type: "planetInHouse", planet: "Venus", houses: [7] }, { type: "planetDignity", planet: "Venus", in: [...GOOD] }],
    text: "warmth, romance and genuine affection in marriage, with a partner who values harmony and beauty. Attraction stays alive over time.",
  },
  {
    id: "m-venus-debilitated", domain: "marriage", weight: 2, positive: false,
    title: "Venus weak by sign",
    conditions: [{ type: "planetDignity", planet: "Venus", in: ["debilitated"] }, { type: "not", condition: { type: "yoga", key: "neecha-bhanga", present: true } }],
    text: "a tendency to over-give or to doubt your own worth in love. Learning to state needs clearly is the remedy the chart itself suggests.",
  },
  {
    id: "m-jupiter-aspect-7", domain: "marriage", weight: 2, positive: true,
    title: "Jupiter's protection on the 7th",
    conditions: [{ type: "aspect", from: "Jupiter", toHouse: 7 }, { type: "planetDignity", planet: "Jupiter", in: [...GOOD, "neutral"] }],
    text: "a wise, protective influence over marriage. Even in hard patches, good sense and elders' support tend to hold the bond together.",
  },
  {
    id: "m-manglik-active", domain: "marriage", weight: 3, positive: false,
    title: "Mangal Dosha (not cancelled)",
    conditions: [{ type: "yoga", key: "manglik", present: true, cancelled: false }],
    text: "heat and impatience around partnership. Classical advice is to match with a partner of similar temperament or another Manglik chart, and to give the relationship time before big decisions.",
    keyPlanets: ["Mars"],
  },
  {
    id: "m-manglik-cancelled", domain: "marriage", weight: 2, positive: true,
    title: "Mangal Dosha is cancelled",
    conditions: [{ type: "yoga", key: "manglik", present: true, cancelled: true }],
    text: "that although Mars sits in a Manglik house, classical conditions cancel the dosha. Energy in the relationship becomes drive and loyalty rather than conflict.",
    keyPlanets: ["Mars"],
  },
  {
    id: "m-saturn-7", domain: "marriage", weight: 2, positive: false,
    title: "Saturn in the 7th",
    conditions: [{ type: "planetInHouse", planet: "Saturn", houses: [7] }, { type: "planetDignity", planet: "Saturn", in: [...WEAK, "neutral"] }],
    text: "a later or slower marriage, sometimes with an older or serious partner. The bond that forms is usually durable; the delay is not a denial.",
  },
  {
    id: "m-saturn-7-strong", domain: "marriage", weight: 2, positive: true,
    title: "Saturn dignified in the 7th",
    conditions: [{ type: "planetInHouse", planet: "Saturn", houses: [7] }, { type: "planetDignity", planet: "Saturn", in: [...GOOD] }],
    text: "a mature, committed partnership built on responsibility and loyalty. Marriage may come a little later but rests on very firm ground.",
  },
  {
    id: "m-rahu-7", domain: "marriage", weight: 2, positive: false,
    title: "Rahu in the 7th",
    conditions: [{ type: "planetInHouse", planet: "Rahu", houses: [7] }],
    text: "unconventional pulls in love: a partner from a different background, culture or distance, and a need to check that attraction is not built on illusion.",
  },
  {
    id: "m-ketu-7", domain: "marriage", weight: 2, positive: false,
    title: "Ketu in the 7th",
    conditions: [{ type: "planetInHouse", planet: "Ketu", houses: [7] }],
    text: "a detached or spiritual streak in how you relate. Partnership works best when both people keep their own space and share a purpose beyond the two of you.",
  },
  {
    id: "m-7-malefic-free", domain: "marriage", weight: 1, positive: true,
    title: "7th house free of malefics",
    conditions: [{ type: "houseEmptyOf", house: 7, planets: [...MALEFICS] }, { type: "houseLordDignity", house: 7, in: [...GOOD, "neutral"] }],
    text: "fewer classical obstacles in marriage. The 7th house is clean, so the tone of partnership follows the 7th lord and Venus.",
    keyPlanets: ["Venus"],
  },
  {
    id: "m-d9-7lord-strong", domain: "marriage", weight: 2, positive: true,
    title: "Navamsa supports marriage",
    conditions: [{ type: "vargaHouseLordInHouse", varga: "D9", house: 7, inHouses: [1, 4, 5, 7, 9, 10, 11] }],
    text: "that the deeper Navamsa chart backs the marriage: the inner bond and the spouse's nature hold up well even when the outer chart shows bumps.",
  },
  {
    id: "m-d9-7lord-dusthana", domain: "marriage", weight: 2, positive: false,
    title: "Navamsa 7th lord in a hard house",
    conditions: [{ type: "vargaHouseLordInHouse", varga: "D9", house: 7, inHouses: [6, 8, 12] }],
    text: "that beneath the surface, partnership asks for inner work: expectations, past hurts or a tendency to withdraw. Awareness of this pattern is half the remedy.",
  },
  {
    id: "m-venus-d9-strong", domain: "marriage", weight: 1, positive: true,
    title: "Venus strong in Navamsa",
    conditions: [{ type: "vargaPlanetInHouse", varga: "D9", planet: "Venus", houses: [1, 4, 5, 7, 9, 10] }],
    text: "that love matures well. Whatever the early story, affection deepens with age and shared life.",
  },
  {
    id: "m-venus-dasha-window", domain: "marriage", weight: 2, positive: true,
    title: "Venus or 7th lord period is active",
    conditions: [{ type: "dashaLord", level: "any", planets: ["Venus"] }],
    text: "that the present period itself favours relationships: meeting someone, deepening a bond or formalising a commitment come more easily now.",
    keyPlanets: ["Venus"],
  },
  {
    id: "m-7lord-with-venus", domain: "marriage", weight: 2, positive: true,
    title: "7th lord joined with Venus",
    conditions: [{ type: "houseLordIs", house: 7, planets: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Saturn"] }, { type: "planetInHouse", planet: "Venus", houses: [7] }],
    text: "that marriage is a central theme of life: a partner who is charming and socially graceful, and a home life you invest in gladly.",
    keyPlanets: ["Venus"],
  },
  {
    id: "m-sun-7", domain: "marriage", weight: 1, positive: false,
    title: "Sun in the 7th",
    conditions: [{ type: "planetInHouse", planet: "Sun", houses: [7] }],
    text: "a proud, strong-willed partner or a marriage where ego needs managing. Respecting each other's authority keeps it warm.",
  },
];
