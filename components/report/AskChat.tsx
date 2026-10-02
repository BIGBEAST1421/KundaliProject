"use client";

import { useState } from "react";
import type { Dict } from "@/src/i18n/en";
import type { PersonReport, Language, QuestionEntry } from "@/src/reports/types";
import { CosmicLoader } from "@/components/ui/CosmicLoader";
import { Input } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";

const MAX_QUESTIONS = 15;

/**
 * Free-form Q&A about a report, answered strictly from that report's own computed facts (see
 * app/api/reports/[uid]/ask/route.ts). Capped at MAX_QUESTIONS per report, enforced server-side.
 * Not shown in print/PDF (a live chat widget has no place in a static export) and not covered by
 * the EN/हिं translate-on-toggle pipeline -- each entry stays in whichever language it was asked in,
 * like a real conversation log.
 */
export function AskChat({ report, d, lang }: { report: PersonReport; d: Dict; lang: Language }) {
  const [messages, setMessages] = useState<QuestionEntry[]>(report.questions);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const atLimit = messages.length >= MAX_QUESTIONS;

  async function send() {
    const question = input.trim();
    if (!question || pending || atLimit) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${report.uid}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.code === "limit" ? d.ask_limit_reached : d.ask_error);
        return;
      }
      const { answer } = await res.json();
      setMessages((prev) => [...prev, { q: question, a: answer, lang, ts: new Date().toISOString() }]);
      setInput("");
    } catch {
      setError(d.ask_error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="no-print">
      <p className="text-sm text-muted">{d.ask_sub}</p>

      <div className="mt-4 space-y-4">
        {messages.length === 0 && !pending && (
          <p className="rounded-[var(--radius-card)] border border-line bg-surface p-5 text-sm text-muted">{d.ask_empty}</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-line p-5">
            <p className="font-medium">{m.q}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{m.a}</p>
          </div>
        ))}
        {pending && <CosmicLoader message={d.ask_thinking} size="sm" />}
      </div>

      {error && <p className="mt-3 text-sm text-concern" role="alert">{error}</p>}

      {atLimit ? (
        <p className="mt-4 text-sm text-muted">{d.ask_limit_reached}</p>
      ) : (
        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={d.ask_placeholder}
            disabled={pending}
            aria-label={d.ask_placeholder}
          />
          <Button onClick={send} loading={pending} disabled={!input.trim()}>{d.ask_send}</Button>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">{messages.length}/{MAX_QUESTIONS}</p>
    </div>
  );
}
