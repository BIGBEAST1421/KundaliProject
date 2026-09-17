import type { Metadata } from "next";
import { ReportForm } from "@/components/forms/ReportForm";
import { FormIntro } from "@/components/forms/FormIntro";

export const metadata: Metadata = { title: "Birth report" };

export default function AppPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <FormIntro kind="report" />
      <div className="mt-10">
        <ReportForm />
      </div>
    </main>
  );
}
