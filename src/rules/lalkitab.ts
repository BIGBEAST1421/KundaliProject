/**
 * Lal Kitab rules: sleeping/awake planet status and planetary debts (Rin), combined with
 * existing chart conditions (house placement, dasha). Lal Kitab's distinctive remedies live
 * separately in `src/astro/lalkitab/content.ts` as static bilingual data keyed by debt — these
 * rules supply the chart-specific narrative, not the remedy text itself.
 */
import type { Rule } from "./types";
import type { Planet } from "@/src/astro/signs";
import type { DebtKey } from "@/src/astro/lalkitab/debts";

/** One entry per debt: who causes it (for "active in the current period") and its chart-specific gist. */
const DEBT_RULES: { key: DebtKey; title: string; planets: Planet[]; gist: string }[] = [
  { key: "swa", title: "Swa Rin (self-debt)", planets: ["Venus", "Saturn", "Rahu"], gist: "setbacks or blame that land on you without clear fault, which Lal Kitab ties to drifting from family faith and custom" },
  { key: "matri", title: "Matri Rin (maternal debt)", planets: ["Ketu"], gist: "effort that doesn't bear fruit and unease around your mother or home, which Lal Kitab traces to this maternal debt" },
  { key: "parivarik", title: "Parivarik Rin (debt to relatives)", planets: ["Mercury", "Ketu"], gist: "strained ties with relatives and being let down by people close to you" },
  { key: "behan", title: "Behan/Kanya Rin (debt to a sister or daughter)", planets: ["Moon"], gist: "sudden reversals in money and family happiness" },
  { key: "pitra", title: "Pitra Rin (ancestral debt)", planets: ["Venus", "Mercury", "Rahu"], gist: "obstacles that seem to come from the family line rather than your own actions" },
  { key: "stri", title: "Stri Rin (debt connected to women)", planets: ["Sun", "Rahu", "Ketu"], gist: "friction in family harmony and upsets around joyful occasions" },
  { key: "nirdayi", title: "Nirdayi Rin (debt of cruelty)", planets: ["Sun", "Moon", "Mars"], gist: "disputes, litigation and setbacks around property" },
  { key: "ajanma", title: "Ajanma Rin (debt of the unborn)", planets: ["Sun", "Venus"], gist: "sudden losses and being deceived despite careful effort" },
  { key: "deva", title: "Ishwariya Rin (divine debt)", planets: ["Moon"], gist: "misplaced trust and setbacks around children and travel" },
];

export const LALKITAB_RULES: Rule[] = [
  // ── Debts: a catch-all per debt so every fired debt always has narrative text, plus a stronger
  // version when the current dasha lord is one of the planets forming it ──
  ...DEBT_RULES.flatMap(({ key, title, planets, gist }): Rule[] => [
    {
      id: `lk-${key}-present`, domain: "lalkitab", weight: 2, positive: false, title,
      conditions: [{ type: "lalKitabDebt", key, present: true }],
      text: `${gist}, easing once the classical remedy is taken up.`,
      keyPlanets: planets,
    },
    {
      id: `lk-${key}-active-dasha`, domain: "lalkitab", weight: 3, positive: false, title: `${title.split(" (")[0]} active in the current period`,
      conditions: [{ type: "lalKitabDebt", key, present: true }, { type: "dashaLord", level: "any", planets }],
      text: "that this debt is live right now, since the current dasha lord is one of the planets forming it, so the remedy is worth prioritising during this period.",
      keyPlanets: planets,
    },
  ]),

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
