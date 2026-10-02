"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/src/i18n/en";
import type { PersonReport, Language, QuestionEntry } from "@/src/reports/types";
import { CosmicLoader } from "@/components/ui/CosmicLoader";
import { Input } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";

const MAX_QUESTIONS = 15;

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
);

/**
 * Floating ask-a-question chat, anchored to the right edge of the viewport. Free-form questions
 * are answered strictly from this report's own computed facts (see
 * app/api/reports/[uid]/ask/route.ts), so the chat can never contradict the report. Capped at
 * MAX_QUESTIONS per report, enforced server-side. Not shown in print/PDF (a live widget has no
 * place in a static export) and not covered by the EN/हिं translate-on-toggle pipeline -- each
 * entry stays in whichever language it was asked in, like a real conversation log.
 */
export function AskChat({ report, d, lang }: { report: PersonReport; d: Dict; lang: Language }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<QuestionEntry[]>(report.questions);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const atLimit = messages.length >= MAX_QUESTIONS;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!panelRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={d.grp_ask}
        className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_1px_0_oklch(1_0_0/0.25)_inset,0_10px_22px_-8px_var(--accent)] transition-transform hover:brightness-105 active:translate-y-px"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={d.grp_ask}
          className="fixed bottom-24 right-6 z-40 flex max-h-[70vh] w-[min(380px,calc(100vw-3rem))] flex-col rounded-[var(--radius-card)] border border-line bg-bg shadow-card"
        >
          <div className="border-b border-line p-4">
            <p className="font-sans text-base font-semibold">{d.grp_ask}</p>
            <p className="mt-1 text-sm text-muted">{d.ask_sub}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !pending && (
              <p className="rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm text-muted">{d.ask_empty}</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className="rounded-[var(--radius-card)] border border-line p-4">
                <p className="font-medium">{m.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{m.a}</p>
              </div>
            ))}
            {pending && <CosmicLoader message={d.ask_thinking} size="sm" />}
          </div>

          {error && <p className="px-4 text-sm text-concern" role="alert">{error}</p>}

          <div className="border-t border-line p-4">
            {atLimit ? (
              <p className="text-sm text-muted">{d.ask_limit_reached}</p>
            ) : (
              <div className="flex gap-2">
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
        </div>
      )}
    </div>
  );
}
