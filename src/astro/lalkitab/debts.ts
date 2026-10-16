/**
 * Lal Kitab planetary debts (rin). Lal Kitab reads planets by house ("khana") from the Lagna, and
 * each debt is a fixed placement pattern — the same nine checks classical patrika software prints
 * under "लाल किताब के अनुसार ऋण भार". Keys `pitra`, `matri`, `deva` and `stri` predate the full set
 * and are kept so stored reports still parse; `deva` is the Ishwariya (divine) debt.
 */
import type { Chart } from "../chart";
import type { Planet } from "../signs";

export type DebtKey = "swa" | "matri" | "parivarik" | "behan" | "pitra" | "stri" | "nirdayi" | "ajanma" | "deva";

export interface LalKitabDebt {
  key: DebtKey;
  name: string;
  present: boolean;
  participants: Planet[];
  houses: number[];
  activeInDasha: boolean;
  reason: string;
}

interface DebtDef {
  key: DebtKey;
  name: string;
  planets: Planet[];
  houses: number[];
}

/** Any of `planets` in any of `houses` (from the Lagna) makes the debt present. */
const DEBTS: readonly DebtDef[] = [
  { key: "swa", name: "Swa Rin", planets: ["Venus", "Saturn", "Rahu"], houses: [5] },
  { key: "matri", name: "Matri Rin", planets: ["Ketu"], houses: [4] },
  { key: "parivarik", name: "Parivarik Rin", planets: ["Mercury", "Ketu"], houses: [1, 8] },
  { key: "behan", name: "Behan/Kanya Rin", planets: ["Moon"], houses: [3, 6] },
  { key: "pitra", name: "Pitra Rin", planets: ["Venus", "Mercury", "Rahu"], houses: [2, 5, 9, 12] },
  { key: "stri", name: "Stri Rin", planets: ["Sun", "Rahu", "Ketu"], houses: [2, 7] },
  { key: "nirdayi", name: "Nirdayi Rin", planets: ["Sun", "Moon", "Mars"], houses: [10, 11] },
  { key: "ajanma", name: "Ajanma Rin", planets: ["Sun", "Venus"], houses: [12] },
  { key: "deva", name: "Ishwariya Rin", planets: ["Moon"], houses: [6] },
];

const ord = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

function detect(chart: Chart, d: DebtDef): LalKitabDebt {
  const participants = d.planets.filter((p) => d.houses.includes(chart.houseOf[p]));
  const present = participants.length > 0;
  const md = chart.dasha.mahadasha as Planet, ad = chart.dasha.antardasha as Planet;
  return {
    key: d.key,
    name: d.name,
    present,
    participants,
    houses: [...new Set(participants.map((p) => chart.houseOf[p]))],
    activeInDasha: participants.includes(md) || participants.includes(ad),
    reason: present
      ? participants.map((p) => `${p} in the ${ord(chart.houseOf[p])} house`).join(", ")
      : `none of ${d.planets.join("/")} in house ${d.houses.join(", ")}`,
  };
}

export function detectDebts(chart: Chart): LalKitabDebt[] {
  return DEBTS.map((d) => detect(chart, d));
}
