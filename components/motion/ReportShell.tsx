"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

export interface ShellTab {
  id: string;
  label: string;
  /** Extra words the quick-jump should match (e.g. "venus marriage 7th"). */
  keywords?: string;
  content: ReactNode;
}

export interface ShellGroup {
  id: string;
  label: string;
  icon?: ReactNode;
  tabs: ShellTab[];
}

interface Props {
  groups: ShellGroup[];
  jumpPlaceholder: string;
  jumpEmpty: string;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function parseHash(): [string, string] | null {
  const h = typeof window === "undefined" ? "" : window.location.hash.slice(1);
  if (!h) return null;
  const [g, t] = h.split("/");
  return [g, t ?? ""];
}

/**
 * Two-level report navigation: groups (left rail on desktop, segmented bar on mobile) → tabs.
 * URL hash `#group/tab` is the navigation state; Back/Forward restore it. A quick-jump box
 * filters every tab by label and keywords. Print renders everything in order.
 */
export function ReportShell({ groups, jumpPlaceholder, jumpEmpty, className = "" }: Props) {
  const reduce = useReducedMotion();
  const first = groups[0];
  const [gid, setGid] = useState(first.id);
  const [tid, setTid] = useState(first.tabs[0].id);
  const [q, setQ] = useState("");
  const [jumpOpen, setJumpOpen] = useState(false);
  const jumpRef = useRef<HTMLDivElement>(null);
  const prev = useRef({ g: 0, t: 0 });

  const group = groups.find((g) => g.id === gid) ?? first;
  const tab = group.tabs.find((t) => t.id === tid) ?? group.tabs[0];

  const select = useCallback((g: string, t?: string) => {
    const grp = groups.find((x) => x.id === g) ?? first;
    const tabId = t && grp.tabs.some((x) => x.id === t) ? t : grp.tabs[0].id;
    prev.current = { g: groups.indexOf(group), t: group.tabs.indexOf(tab) };
    setGid(grp.id); setTid(tabId); setQ(""); setJumpOpen(false);
    const isDefault = grp.id === first.id && tabId === first.tabs[0].id;
    history.replaceState(null, "", isDefault ? window.location.pathname : `#${grp.id}/${tabId}`);
  }, [groups, first, group, tab]);

  useEffect(() => {
    const read = () => { const h = parseHash(); if (h) select(h[0], h[1]); };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!jumpRef.current?.contains(e.target as Node)) setJumpOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const flat = useMemo(() => groups.flatMap((g) => g.tabs.map((t) => ({ g, t, hay: `${g.label} ${t.label} ${t.keywords ?? ""}`.toLowerCase() }))), [groups]);
  const matches = q.trim().length ? flat.filter((x) => x.hay.includes(q.trim().toLowerCase())).slice(0, 8) : [];

  const dir = groups.indexOf(group) * 10 + group.tabs.indexOf(tab) >= prev.current.g * 10 + prev.current.t ? 1 : -1;

  return (
    <div className={`grid gap-8 lg:grid-cols-[220px_1fr] ${className}`}>
      {/* Rail / mobile bars */}
      <aside className="no-print lg:sticky lg:top-24 lg:self-start">
        <div ref={jumpRef} className="relative mb-4">
          <input value={q} onChange={(e) => { setQ(e.target.value); setJumpOpen(true); }} onFocus={() => setJumpOpen(true)}
            placeholder={jumpPlaceholder} aria-label={jumpPlaceholder}
            className="h-10 w-full rounded-xl border border-line bg-surface px-3.5 pl-9 text-sm placeholder:text-muted focus:border-accent" />
          <svg className="pointer-events-none absolute left-3 top-3 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          {jumpOpen && q.trim() && (
            <ul role="listbox" className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-line bg-bg p-1 shadow-card">
              {matches.length === 0 && <li className="px-3 py-2 text-sm text-muted">{jumpEmpty}</li>}
              {matches.map((m) => (
                <li key={`${m.g.id}/${m.t.id}`} role="option" aria-selected={false}
                  onMouseDown={(e) => { e.preventDefault(); select(m.g.id, m.t.id); }}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-surface">
                  <span className="text-muted">{m.g.label} · </span><span className="font-medium">{m.t.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop rail */}
        <LayoutGroup id="rail">
          <nav aria-label="Report sections" className="hidden lg:block">
            <ul className="space-y-1">
              {groups.map((g) => {
                const active = g.id === group.id;
                return (
                  <li key={g.id}>
                    <button type="button" onClick={() => select(g.id)} aria-current={active ? "true" : undefined}
                      className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}>
                      {active && <motion.span layoutId="rail-pill" className="absolute inset-0 rounded-xl bg-surface-2" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 40 }} aria-hidden />}
                      <span className="relative z-10 flex items-center gap-2.5">{g.icon}{g.label}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {active && g.tabs.length > 1 && (
                        <motion.ul initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }} className="ml-3 overflow-hidden border-l border-line">
                          {g.tabs.map((t) => (
                            <li key={t.id}>
                              <button type="button" onClick={() => select(g.id, t.id)} aria-current={t.id === tab.id ? "page" : undefined}
                                className={`relative -ml-px block w-full border-l-2 px-3 py-1.5 text-left text-sm transition-colors ${t.id === tab.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                                {t.label}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </nav>
        </LayoutGroup>

        {/* Mobile bars */}
        <div className="lg:hidden">
          <div role="tablist" aria-label="Report groups" className="grid grid-cols-4 gap-1 rounded-xl bg-surface-2 p-1">
            {groups.map((g) => (
              <button key={g.id} type="button" role="tab" aria-selected={g.id === group.id} onClick={() => select(g.id)}
                className={`h-9 rounded-lg text-xs font-semibold transition-colors ${g.id === group.id ? "bg-bg text-ink shadow-sm" : "text-muted"}`}>
                {g.label}
              </button>
            ))}
          </div>
          {group.tabs.length > 1 && (
            <div role="tablist" aria-label={group.label} className="mt-2 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {group.tabs.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={t.id === tab.id} onClick={() => select(group.id, t.id)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${t.id === tab.id ? "border-accent bg-accent-soft text-ink" : "border-line text-muted"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Screen content */}
      <div className="min-w-0 print:hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section key={`${group.id}/${tab.id}`} role="tabpanel" aria-label={`${group.label}: ${tab.label}`}
            initial={reduce ? false : { opacity: 0, y: 12 * dir, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? undefined : { opacity: 0, y: -8 * dir, filter: "blur(4px)", transition: { duration: 0.16 } }}
            transition={{ duration: 0.4, ease: EASE }}>
            {tab.content}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Print: everything */}
      <div className="hidden print:block lg:col-span-2">
        {groups.map((g) => g.tabs.map((t) => (
          <section key={`${g.id}/${t.id}`} className="print-avoid mt-12 first:mt-0">
            <p className="text-xs text-muted">{g.label}</p>
            <h2 className="mb-6 text-2xl">{t.label}</h2>
            {t.content}
          </section>
        )))}
      </div>
    </div>
  );
}
