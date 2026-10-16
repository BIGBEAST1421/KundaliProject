import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repo } from "@/src/db/repo";
import { isOwner } from "@/src/lib/owner";
import { ReportView } from "@/components/report/ReportView";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await repo.getPersonByUid((await params).uid);
  return report ? { title: `${report.name} — birth report`, robots: { index: false } } : { title: "Report not found" };
}

/**
 * Public share route: /report/<uid>. No auth, no regeneration, invalid uid → not found.
 * The Ask chat and its log belong to the creator only, so other viewers never receive them.
 */
export default async function SharedReportPage({ params }: Props) {
  const report = await repo.getPersonByUid((await params).uid);
  if (!report) notFound();
  const owner = await isOwner(report.uid);
  return <ReportView report={owner ? report : { ...report, questions: [] }} mode="share" canAsk={owner} />;
}
