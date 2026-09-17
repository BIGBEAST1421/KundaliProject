"use client";

import Link from "next/link";
import { useI18n } from "@/src/i18n";
import { LinkButton } from "@/components/ui/Button";
import { VerdictBadge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { ConstellationArt } from "./ConstellationArt";

export function Landing() {
  const { t } = useI18n();

  return (
    <main>
      {/* Hero */}
      <section className="sky">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
          <div className="fade-up">
            <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.05]">{t("hero_title")}</h1>
            <p className="mt-6 max-w-[38rem] text-lg leading-relaxed text-muted">{t("hero_sub")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href="/app" size="lg">{t("hero_cta")}</LinkButton>
              <LinkButton href="/match" variant="secondary" size="lg">{t("hero_cta2")}</LinkButton>
            </div>
            <p className="mt-4 text-sm text-muted">{t("hero_note")}</p>
          </div>
          <div className="fade-up mx-auto w-full max-w-md md:max-w-none" style={{ animationDelay: "120ms" }}>
            <ConstellationArt />
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, so numbers earn their place */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl md:text-4xl">{t("how_title")}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {([1, 2, 3] as const).map((n) => (
              <li key={n} className="flex gap-4">
                <span className="font-display text-4xl leading-none text-accent">{n}</span>
                <div>
                  <h3 className="font-sans text-lg font-medium">{t(`how_${n}_t`)}</h3>
                  <p className="mt-1.5 text-muted leading-relaxed">{t(`how_${n}_d`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Reports */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl md:text-4xl">{t("reports_title")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{t("reports_d")}</p>
            <Link href="/app" className="mt-6 inline-block font-medium underline decoration-accent decoration-2 underline-offset-4">{t("hero_cta")} →</Link>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line p-6 shadow-card">
            <p className="text-xs text-muted">Career & Karma</p>
            <p className="mt-3 font-medium">{t("strengths")}</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed">
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-strength" />{t("example_1")}</li>
            </ul>
            <p className="mt-5 font-medium">{t("concerns")}</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed">
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-concern" />{t("example_2")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Matching */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div className="md:order-2">
            <h2 className="text-3xl md:text-4xl">{t("match_title")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{t("match_d")}</p>
            <Link href="/match" className="mt-6 inline-block font-medium underline decoration-accent decoration-2 underline-offset-4">{t("hero_cta2")} →</Link>
          </div>
          <div className="md:order-1 rounded-[var(--radius-card)] border border-line bg-bg p-6 shadow-card">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">{t("guna_score")}</span>
              <span className="font-display text-3xl">26.5 <span className="text-base text-muted">/ 36</span></span>
            </div>
            <div className="mt-3"><Meter value={26.5} max={36} label="Guna score" /></div>
            <ul className="mt-6 divide-y divide-line text-sm">
              {[
                ["Gana · Nature & attitude", "strength"],
                ["Bhakoot · Emotional harmony", "strength"],
                ["Nadi · Health & energy", "concern"],
                ["Tara · Luck together", "neutral"],
              ].map(([label, v]) => (
                <li key={label} className="flex items-center justify-between py-2.5">
                  <span>{label}</span>
                  <VerdictBadge verdict={v as "strength"} label={t(`verdict_${v as "strength"}`)} />
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-muted">{t("example_3")}</p>
          </div>
        </div>
      </section>

      {/* Features — deliberately varied: a definition list, not a card grid */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl md:text-4xl">{t("features_title")}</h2>
        <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} className="border-t border-line pt-5">
              <dt className="font-medium">{t(`feat_${n}_t`)}</dt>
              <dd className="mt-1.5 text-muted leading-relaxed">{t(`feat_${n}_d`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <div className="rounded-[var(--radius-card)] bg-surface p-8 text-center">
          <h2 className="text-2xl">{t("trust_title")}</h2>
          <p className="mx-auto mt-3 max-w-prose leading-relaxed text-muted">{t("trust_d")}</p>
          <div className="mt-6"><LinkButton href="/app" size="lg">{t("hero_cta")}</LinkButton></div>
        </div>
      </section>
    </main>
  );
}
