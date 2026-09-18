import type { Dict } from "@/src/i18n/en";
import type { ReportFacts } from "@/src/reports/facts-schema";
import type { Language } from "@/src/reports/types";
import { signLabel } from "@/src/astro/i18n";
import { NorthChart } from "../NorthChart";

export function VargaView({ f, d, lang = "en" }: { f: ReportFacts; d: Dict; lang?: Language }) {
  const blocks = [
    { title: d.d9_title, sub: d.d9_sub, v: f.vargas.D9 },
    { title: d.d10_title, sub: d.d10_sub, v: f.vargas.D10 },
  ];
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {blocks.map((b) => (
        <div key={b.title} className="print-avoid">
          <h3 className="font-sans text-base font-semibold">{b.title}</h3>
          <p className="mb-4 text-sm text-muted">{b.sub}</p>
          <NorthChart lagna={b.v.lagna} d1={b.v.signs} title={b.title} lang={lang} />
          <p className="mt-2 text-center text-xs text-muted">{d.lbl_lagna}: {signLabel(b.v.lagna, lang)}</p>
        </div>
      ))}
    </div>
  );
}
