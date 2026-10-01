/**
 * Lal Kitab rules: sleeping/awake planet status and planetary debts (Rin), combined with
 * existing chart conditions (house placement, dasha). Lal Kitab's distinctive remedies live
 * separately in `src/astro/lalkitab/content.ts` as static bilingual data keyed by debt — these
 * rules supply the chart-specific narrative, not the remedy text itself.
 */
import type { Rule } from "./types";

export const LALKITAB_RULES: Rule[] = [
  // ── Debts: one catch-all per debt so every fired debt always has translatable narrative text ──
  {
    id: "lk-pitra-present", domain: "lalkitab", weight: 2, positive: false,
    title: "Pitra Rin (ancestral debt)",
    conditions: [{ type: "lalKitabDebt", key: "pitra", present: true }],
    text: "unresolved ancestral responsibility surfacing as recurring friction around your father or senior family figures, easing once the classical remedy is taken up.",
    keyPlanets: ["Sun"],
  },
  {
    id: "lk-pitra-active-dasha", domain: "lalkitab", weight: 3, positive: false,
    title: "Pitra Rin active in the current period",
    conditions: [{ type: "lalKitabDebt", key: "pitra", present: true }, { type: "dashaLord", level: "any", planets: ["Sun", "Saturn"] }],
    text: "that this ancestral debt is directly active right now, since the current dasha lord is tied to it, so the remedy is worth prioritising during this period.",
    keyPlanets: ["Sun", "Saturn"],
  },
  {
    id: "lk-matri-present", domain: "lalkitab", weight: 2, positive: false,
    title: "Matri Rin (maternal debt)",
    conditions: [{ type: "lalKitabDebt", key: "matri", present: true }],
    text: "an emotional unease tied to your mother or home life that Lal Kitab traces to this maternal debt, worth addressing with the matching remedy.",
    keyPlanets: ["Moon"],
  },
  {
    id: "lk-matri-moon-sleeping", domain: "lalkitab", weight: 3, positive: false,
    title: "Matri Rin compounded by a sleeping Moon",
    conditions: [{ type: "lalKitabDebt", key: "matri", present: true }, { type: "planetStatus", planet: "Moon", status: ["sleeping"] }],
    text: "a maternal-debt pattern that is currently dormant rather than active. Lal Kitab treats a sleeping significator as more stubborn, needing a deliberate remedy to wake it.",
    keyPlanets: ["Moon"],
  },
  {
    id: "lk-deva-present", domain: "lalkitab", weight: 2, positive: false,
    title: "Deva Rin (debt to the divine/teachers)",
    conditions: [{ type: "lalKitabDebt", key: "deva", present: true }],
    text: "blocked wisdom, guidance or growth in wealth that Lal Kitab ties to this debt toward teachers or the divine, until the matching remedy is taken up.",
    keyPlanets: ["Jupiter"],
  },
  {
    id: "lk-deva-active-dasha", domain: "lalkitab", weight: 3, positive: false,
    title: "Deva Rin active in the current period",
    conditions: [{ type: "lalKitabDebt", key: "deva", present: true }, { type: "dashaLord", level: "any", planets: ["Jupiter", "Rahu", "Ketu"] }],
    text: "that this debt is live right now, since the current dasha lord is directly tied to it.",
    keyPlanets: ["Jupiter"],
  },
  {
    id: "lk-stri-present", domain: "lalkitab", weight: 2, positive: false,
    title: "Stri Rin (debt connected to women)",
    conditions: [{ type: "lalKitabDebt", key: "stri", present: true }],
    text: "friction in relationship harmony that Lal Kitab traces to this debt, easing with consistent attention to the matching remedy.",
    keyPlanets: ["Venus"],
  },

  // ── Planet status + house: career (10th), wealth (2nd/11th), marriage (7th), health (6th), home (4th), children/wisdom (5th) ──
  {
    id: "lk-sun-awake-10", domain: "lalkitab", weight: 2, positive: true,
    title: "Sun awake in the 10th house",
    conditions: [{ type: "planetStatus", planet: "Sun", status: ["awake"] }, { type: "planetInHouse", planet: "Sun", houses: [10] }],
    text: "visible, recognised career growth. The Sun's authority is fully active here, with no remedy needed.",
  },
  {
    id: "lk-saturn-sleeping-10", domain: "lalkitab", weight: 2, positive: false,
    title: "Saturn sleeping in the 10th house",
    conditions: [{ type: "planetStatus", planet: "Saturn", status: ["sleeping"] }, { type: "planetInHouse", planet: "Saturn", houses: [10] }],
    text: "career discipline and steady recognition staying dormant until Saturn is woken with its remedy. Effort may feel like it isn't landing.",
  },
  {
    id: "lk-saturn-awake-11", domain: "lalkitab", weight: 2, positive: true,
    title: "Saturn awake in the 11th house",
    conditions: [{ type: "planetStatus", planet: "Saturn", status: ["awake"] }, { type: "planetInHouse", planet: "Saturn", houses: [11] }],
    text: "slow but durable gains that, once they arrive, tend to stay. Saturn's discipline here works fully in your favour.",
  },
  {
    id: "lk-jupiter-sleeping-5", domain: "lalkitab", weight: 2, positive: false,
    title: "Jupiter sleeping in the 5th house",
    conditions: [{ type: "planetStatus", planet: "Jupiter", status: ["sleeping"] }, { type: "planetInHouse", planet: "Jupiter", houses: [5] }],
    text: "children, education or wealth-building matters stalling until a Jupiter-specific remedy wakes this placement.",
  },
  {
    id: "lk-jupiter-awake-11", domain: "lalkitab", weight: 2, positive: true,
    title: "Jupiter awake in the 11th house",
    conditions: [{ type: "planetStatus", planet: "Jupiter", status: ["awake"] }, { type: "planetInHouse", planet: "Jupiter", houses: [11] }],
    text: "steady gains and a wide, supportive circle. This placement is fully active and needs no remedy.",
  },
  {
    id: "lk-venus-sleeping-7", domain: "lalkitab", weight: 2, positive: false,
    title: "Venus sleeping in the 7th house",
    conditions: [{ type: "planetStatus", planet: "Venus", status: ["sleeping"] }, { type: "planetInHouse", planet: "Venus", houses: [7] }],
    text: "partnership warmth staying muted until Venus is woken. The classical remedy is worth taking up before a major relationship decision.",
  },
  {
    id: "lk-venus-awake-7", domain: "lalkitab", weight: 2, positive: true,
    title: "Venus awake in the 7th house",
    conditions: [{ type: "planetStatus", planet: "Venus", status: ["awake"] }, { type: "planetInHouse", planet: "Venus", houses: [7] }],
    text: "warmth and ease in partnership. Venus's blessings here are fully active.",
  },
  {
    id: "lk-mars-sleeping-6", domain: "lalkitab", weight: 1, positive: false,
    title: "Mars sleeping in the 6th house",
    conditions: [{ type: "planetStatus", planet: "Mars", status: ["sleeping"] }, { type: "planetInHouse", planet: "Mars", houses: [6] }],
    text: "the drive to push through daily obstacles and health routines staying lower than it should, until Mars is woken.",
  },
  {
    id: "lk-mars-awake-3", domain: "lalkitab", weight: 2, positive: true,
    title: "Mars awake in the 3rd house",
    conditions: [{ type: "planetStatus", planet: "Mars", status: ["awake"] }, { type: "planetInHouse", planet: "Mars", houses: [3] }],
    text: "courage and initiative come through fully. Effort in communication, siblings or short journeys pays off directly.",
  },
  {
    id: "lk-mercury-sleeping-4", domain: "lalkitab", weight: 1, positive: false,
    title: "Mercury sleeping in the 4th house",
    conditions: [{ type: "planetStatus", planet: "Mercury", status: ["sleeping"] }, { type: "planetInHouse", planet: "Mercury", houses: [4] }],
    text: "peace of mind at home and clarity of thought staying muted until Mercury is woken with its remedy.",
  },
  {
    id: "lk-moon-sleeping-4", domain: "lalkitab", weight: 2, positive: false,
    title: "Moon sleeping in the 4th house",
    conditions: [{ type: "planetStatus", planet: "Moon", status: ["sleeping"] }, { type: "planetInHouse", planet: "Moon", houses: [4] }],
    text: "emotional comfort and a settled home feeling harder to access than the chart's other strengths would suggest, until the Moon is woken.",
  },
  {
    id: "lk-moon-awake-2", domain: "lalkitab", weight: 2, positive: true,
    title: "Moon awake in the 2nd house",
    conditions: [{ type: "planetStatus", planet: "Moon", status: ["awake"] }, { type: "planetInHouse", planet: "Moon", houses: [2] }],
    text: "a naturally warm relationship with family wealth and speech. This placement supports you fully as it is.",
  },
];
