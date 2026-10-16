import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repo } from "@/src/db/repo";
import { slugFromParam, RESERVED_SLUGS } from "@/src/reports/slug";
import { isOwner } from "@/src/lib/owner";
import { ReportView } from "@/components/report/ReportView";

type Props = { params: Promise<{ slug: string }> };

/**
 * Name slugs are guessable (/rahul-sharma, /rahul-sharma-2, …), so this route only resolves for
 * the browser that created the report. Everyone else gets the same 404 as a missing report, so
 * it doesn't even confirm that a report exists.
 */
async function load(param: string) {
  const slug = slugFromParam(param);
  if (RESERVED_SLUGS.has(slug)) return null;
  const report = await repo.getPersonBySlug(slug);
  return report && (await isOwner(report.uid)) ? report : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await load((await params).slug);
  return report ? { title: `${report.name} — birth report`, robots: { index: false } } : { title: "Report not found" };
}

/** Human-friendly route: /rahul → the report whose slug is "rahul". Never regenerates. */
export default async function PersonPage({ params }: Props) {
  const report = await load((await params).slug);
  if (!report) notFound();
  return <ReportView report={report} />;
}
