import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repo } from "@/src/db/repo";
import { ReportView } from "@/components/report/ReportView";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await repo.getPersonByUid((await params).uid);
  return report ? { title: `${report.name} — birth report`, robots: { index: false } } : { title: "Report not found" };
}

/** Public share route: /report/<uid>. No auth, no regeneration, invalid uid → not found. */
export default async function SharedReportPage({ params }: Props) {
  const report = await repo.getPersonByUid((await params).uid);
  if (!report) notFound();
  return <ReportView report={report} />;
}
