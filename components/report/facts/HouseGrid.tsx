import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import { SIGNS } from "@/src/astro/signs";
import { signLabel, planetLabel } from "@/src/astro/i18n";

const HOUSE_MEANING_EN = ["Self & body", "Wealth & family", "Siblings & courage", "Home & mother", "Children & creativity", "Health & service", "Marriage & partners", "Change & secrets", "Fortune & father", "Career & status", "Gains & friends", "Loss & liberation"];
const HOUSE_MEANING_HI = ["स्वयं और शरीर", "धन और परिवार", "भाई-बहन और साहस", "घर और माता", "संतान और रचनात्मकता", "स्वास्थ्य और सेवा", "विवाह और साथी", "परिवर्तन और रहस्य", "भाग्य और पिता", "करियर और प्रतिष्ठा", "लाभ और मित्र", "व्यय और मोक्ष"];

/** 12 houses: sign, lord, occupants, plain meaning. */
export function HouseGrid({ f, d, lagna, lang }: { f: ReportFacts; d: Dict; lagna: string; lang: "en" | "hi" }) {
  const li = SIGNS.indexOf(lagna as (typeof SIGNS)[number]);
  const meanings = lang === "hi" ? HOUSE_MEANING_HI : HOUSE_MEANING_EN;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
        const sign = SIGNS[(li + h - 1) % 12];
        const occ = f.planetsInHouses[String(h)] ?? [];
        return (
          <li key={h} className="rounded-[var(--radius-card)] border border-line p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl">{h}</span>
              <span className="text-xs text-muted">{meanings[h - 1]}</span>
            </div>
            <p className="mt-1 font-medium">{signLabel(sign, lang)}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted">{d.house_lord}</dt><dd>{planetLabel(f.houseLords[String(h)], lang)}</dd>
              <dt className="text-muted">{d.house_occupants}</dt><dd>{occ.length ? occ.map((p) => planetLabel(p, lang)).join(", ") : <span className="text-muted">{d.house_empty}</span>}</dd>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
