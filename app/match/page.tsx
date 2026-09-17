import type { Metadata } from "next";
import { MatchForm } from "@/components/forms/MatchForm";
import { FormIntro } from "@/components/forms/FormIntro";

export const metadata: Metadata = { title: "Kundli matching" };

export default function MatchPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
      <FormIntro kind="match" />
      <div className="mt-10">
        <MatchForm />
      </div>
    </main>
  );
}
