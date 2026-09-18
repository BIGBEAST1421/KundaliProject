import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repo } from "@/src/db/repo";
import { MatchView } from "@/components/match/MatchView";

type Props = { params: Promise<{ uid: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await repo.getMatchByUid((await params).uid);
  return r ? { title: `${r.boy.name} & ${r.girl.name} — compatibility`, robots: { index: false } } : { title: "Report not found" };
}

/** Public, view-only compatibility report. */
export default async function SharedMatchPage({ params }: Props) {
  const report = await repo.getMatchByUid((await params).uid);
  if (!report) notFound();
  return <MatchView report={report} mode="share" />;
}
