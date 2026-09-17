import { describe, it, expect } from "vitest";
import { syntheticChart } from "./synthetic";
import { gajakesari, kemadruma, manglik, kendraTrikonaRajaYoga, dharmaKarmadhipati, viparitaRajaYoga, neechaBhanga, detectYogas, dhana } from "../yogas";

describe("gajakesari", () => {
  it("fires when Jupiter is in a kendra from the Moon", () => {
    const c = syntheticChart("Aries", { Moon: "Cancer", Jupiter: "Libra" }); // 4th from Moon
    expect(gajakesari(c).present).toBe(true);
  });
  it("does not fire otherwise", () => {
    expect(gajakesari(syntheticChart("Aries", { Moon: "Cancer", Jupiter: "Leo" })).present).toBe(false);
  });
});

describe("kemadruma", () => {
  it("fires when Moon has no neighbours and is cancelled by a kendra Moon", () => {
    const c = syntheticChart("Aries", { Moon: "Cancer", Sun: "Leo", Mars: "Sagittarius", Mercury: "Capricorn", Jupiter: "Aquarius", Venus: "Pisces", Saturn: "Aries", Rahu: "Libra", Ketu: "Aries" });
    const y = kemadruma(c);
    expect(y.present).toBe(true);
    expect(y.cancelled).toBe(true); // Moon in Cancer = 4th house (kendra) from Aries lagna
  });
});

describe("manglik", () => {
  it("is present for Mars in the 7th and cancelled when Mars is in own sign", () => {
    const y = manglik(syntheticChart("Aries", { Mars: "Libra", Jupiter: "Taurus", Moon: "Leo" }));
    expect(y.present).toBe(true);
    expect(y.cancelled).toBe(false);
    const own = manglik(syntheticChart("Taurus", { Mars: "Scorpio" })); // 7th from Taurus, own sign
    expect(own.present).toBe(true);
    expect(own.cancelled).toBe(true);
    expect(own.cancellationReasons[0]).toMatch(/own or exalted/);
  });
  it("is absent for Mars in the 3rd", () => {
    expect(manglik(syntheticChart("Aries", { Mars: "Gemini" })).present).toBe(false);
  });
});

describe("raja yogas", () => {
  it("detects kendra-trikona by conjunction with grade and dasha activation", () => {
    // Aries lagna: 10th lord Saturn (Capricorn) + 9th lord Jupiter (Sagittarius) conjunct in Capricorn (10th)
    const c = syntheticChart("Aries", { Saturn: "Capricorn", Jupiter: "Capricorn" }, { md: "Saturn", ad: "Venus" });
    const y = kendraTrikonaRajaYoga(c);
    expect(y.present).toBe(true);
    expect(y.participants.sort()).toEqual(["Jupiter", "Saturn"]);
    expect(y.activeInDasha).toBe(true);
    expect(y.grade).toBe(1); // Jupiter debilitated in Capricorn drags the grade down
  });
  it("detects dharma-karmadhipati separately", () => {
    const c = syntheticChart("Aries", { Saturn: "Libra", Jupiter: "Libra" });
    expect(dharmaKarmadhipati(c).present).toBe(true);
    expect(dharmaKarmadhipati(syntheticChart("Aries", { Saturn: "Libra", Jupiter: "Leo" })).present).toBe(false);
  });
  it("detects viparita when a dusthana lord sits in another dusthana", () => {
    // Aries lagna: 6th lord Mercury (Virgo) placed in Scorpio (8th)
    const c = syntheticChart("Aries", { Mercury: "Scorpio" });
    const y = viparitaRajaYoga(c);
    expect(y.present).toBe(true);
    expect(y.participants).toContain("Mercury");
  });
  it("detects neecha bhanga when the dispositor is in a kendra", () => {
    // Aries lagna: Moon debilitated in Scorpio (8th); Mars (dispositor) in Libra (7th, kendra)
    const c = syntheticChart("Aries", { Moon: "Scorpio", Mars: "Libra", Saturn: "Aquarius" });
    const y = neechaBhanga(c);
    expect(y.present).toBe(true);
    expect(y.participants).toEqual(["Moon"]);
  });
  it("ranks present raja yogas first", () => {
    const c = syntheticChart("Aries", { Saturn: "Capricorn", Jupiter: "Capricorn" });
    const list = detectYogas(c);
    expect(list[0].present).toBe(true);
    expect(list[0].kind).toBe("rajayoga");
    expect(list.filter((y) => y.present).every((y, i, arr) => i === 0 || Number(arr[i - 1].present) >= Number(y.present))).toBe(true);
  });
});

describe("dhana", () => {
  it("detects 2nd and 11th lords together", () => {
    // Aries lagna: 2nd lord Venus (Taurus), 11th lord Saturn (Aquarius), both in Gemini
    const c = syntheticChart("Aries", { Venus: "Gemini", Saturn: "Gemini" });
    expect(dhana(c).present).toBe(true);
  });
});
