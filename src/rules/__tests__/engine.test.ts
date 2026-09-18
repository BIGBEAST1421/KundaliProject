import { describe, it, expect } from "vitest";
import { syntheticChart } from "@/src/astro/__tests__/synthetic";
import { detectYogas } from "@/src/astro/yogas";
import { computeStrengths } from "@/src/astro/strength";
import { vargaChart } from "@/src/astro/varga";
import { evaluate, check, type RuleFacts } from "../engine";
import { MARRIAGE_RULES } from "../marriage";
import { CAREER_RULES } from "../career";
import { evaluateAll } from "../index";
import type { Rule } from "../types";

function facts(chart: ReturnType<typeof syntheticChart>): RuleFacts {
  return { chart, yogas: detectYogas(chart), strengths: computeStrengths(chart), vargas: { D9: vargaChart(chart, "D9"), D10: vargaChart(chart, "D10") } };
}

describe("rule engine", () => {
  it("fires only when ALL conditions hold", () => {
    const rule: Rule = {
      id: "t", domain: "marriage", weight: 2, positive: true, title: "t",
      conditions: [{ type: "planetInHouse", planet: "Venus", houses: [7] }, { type: "planetDignity", planet: "Venus", in: ["own", "exalted"] }],
      text: "x",
    };
    // Aries lagna, Venus in Libra (7th, own) → fires
    expect(evaluate([rule], facts(syntheticChart("Aries", { Venus: "Libra" })))).toHaveLength(1);
    // Venus in Libra but lagna Taurus → Venus in 6th → no
    expect(evaluate([rule], facts(syntheticChart("Taurus", { Venus: "Libra" })))).toHaveLength(0);
    // Venus in 7th but Virgo (debilitated) for Pisces lagna → no
    expect(evaluate([rule], facts(syntheticChart("Pisces", { Venus: "Virgo" })))).toHaveLength(0);
  });

  it("adds a hedge prefix based on planet strength and traces why", () => {
    const f = facts(syntheticChart("Aries", { Venus: "Libra", Jupiter: "Cancer" }));
    const fired = evaluate(MARRIAGE_RULES, f);
    const venus = fired.find((r) => r.id === "m-venus-strong-7")!;
    expect(venus).toBeDefined();
    expect(venus.text).toMatch(/^This (indicates|suggests|may point to) /);
    expect(venus.because.join(" ")).toMatch(/Venus is in the 7th house/);
    expect(["direct", "moderate", "soft"]).toContain(venus.confidence);
  });

  it("uses softer wording for concerns", () => {
    const f = facts(syntheticChart("Aries", { Mars: "Libra", Jupiter: "Taurus", Moon: "Leo" }));
    const fired = evaluate(MARRIAGE_RULES, f);
    const m = fired.find((r) => r.id === "m-manglik-active")!;
    expect(m).toBeDefined();
    expect(m.positive).toBe(false);
    expect(m.text).toMatch(/^This (points to|can bring|may sometimes bring) /);
  });

  it("supports not, yoga and varga conditions", () => {
    const f = facts(syntheticChart("Aries", { Saturn: "Libra", Jupiter: "Libra" }));
    expect(check({ type: "yoga", key: "dharma-karmadhipati", present: true }, f)).toBeTruthy();
    expect(check({ type: "not", condition: { type: "yoga", key: "dharma-karmadhipati", present: true } }, f)).toBeNull();
    expect(check({ type: "vargaPlanetInHouse", varga: "D9", planet: "Sun", houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, f)).toBeTruthy();
  });

  it("ranks by weight and every corpus rule has unique ids and ≥1 condition", () => {
    const ids = new Set<string>();
    for (const r of [...MARRIAGE_RULES, ...CAREER_RULES]) {
      expect(ids.has(r.id)).toBe(false); ids.add(r.id);
      expect(r.conditions.length).toBeGreaterThan(0);
      expect(r.text).not.toMatch(/[—–]/);
    }
    const all = evaluateAll(facts(syntheticChart("Aries", { Saturn: "Capricorn", Jupiter: "Capricorn", Sun: "Capricorn" })));
    for (let i = 1; i < all.career.length; i++) expect(all.career[i - 1].weight).toBeGreaterThanOrEqual(all.career[i].weight);
    expect(MARRIAGE_RULES.length).toBeGreaterThanOrEqual(15);
    expect(CAREER_RULES.length).toBeGreaterThanOrEqual(15);
  });
});
