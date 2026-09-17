import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repo } from "@/src/db/repo";
import { slugFromParam, RESERVED_SLUGS } from "@/src/reports/slug";
import { ReportView } from "@/components/report/ReportView";

type Props = { params: Promise<{ slug: string }> };

async function load(param: string) {
  const slug = slugFromParam(param);
  if (RESERVED_SLUGS.has(slug)) return null;
  return repo.getPersonBySlug(slug);
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
