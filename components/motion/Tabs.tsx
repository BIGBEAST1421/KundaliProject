"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

export interface TabPanel {
  id: string;
  label: string;
  /** Small count or hint shown beside the label. */
  hint?: string;
  content: ReactNode;
}

interface TabsProps {
  panels: TabPanel[];
  /** Hash-sync the active tab into the URL (#career) so links, Back/Forward and refresh keep the tab. */
  syncHash?: boolean;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Accessible tabs with a layout-animated indicator and a directional crossfade between panels.
 * All panels stay in the DOM (inactive ones hidden) so print shows the complete report.
 */
export function Tabs({ panels, syncHash = true, className = "" }: TabsProps) {
  const ids = useMemo(() => panels.map((p) => p.id), [panels]);
  const [active, setActive] = useState(ids[0]);
  const prevIdx = useRef(0);
  const reduce = useReducedMotion();
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  // Hash → state on load and Back/Forward.
  useEffect(() => {
    if (!syncHash) return;
    const read = () => {
      const h = window.location.hash.slice(1);
      if (h && ids.includes(h)) setActive(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [ids, syncHash]);

  const select = useCallback((id: string) => {
    prevIdx.current = ids.indexOf(active);
    setActive(id);
    if (syncHash) history.replaceState(null, "", id === ids[0] ? window.location.pathname : `#${id}`);
    // keep the active tab in view on narrow screens
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [active, ids, syncHash, reduce]);

  const onKey = (e: React.KeyboardEvent) => {
    const i = ids.indexOf(active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % ids.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + ids.length) % ids.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ids.length - 1;
    else return;
    e.preventDefault();
    select(ids[next]);
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${ids[next]}"]`)?.focus();
  };

  const dir = ids.indexOf(active) >= prevIdx.current ? 1 : -1;

  return (
    <div className={className}>
      <div className="no-print sticky top-[104px] md:top-16 z-20 -mx-4 border-b border-line bg-bg/85 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <LayoutGroup id={baseId}>
          <div ref={listRef} role="tablist" aria-label="Report sections" onKeyDown={onKey}
            className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {panels.map((p) => {
              const selected = p.id === active;
              return (
                <button key={p.id} type="button" role="tab" data-tab={p.id} id={`${baseId}-tab-${p.id}`}
                  aria-selected={selected} aria-controls={`${baseId}-panel-${p.id}`} tabIndex={selected ? 0 : -1}
                  onClick={() => select(p.id)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${selected ? "text-ink" : "text-muted hover:text-ink"}`}>
                  {selected && (
                    <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-surface-2" aria-hidden
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }} />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {p.label}
                    {p.hint && <span className="text-xs text-muted">{p.hint}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* Screen: only the active panel, with a directional crossfade. */}
      <div className="relative mt-10 print:hidden">
        <AnimatePresence mode="wait" initial={false}>
          {panels.filter((p) => p.id === active).map((p) => (
            <motion.div key={p.id} role="tabpanel" id={`${baseId}-panel-${p.id}`} aria-labelledby={`${baseId}-tab-${p.id}`}
              initial={reduce ? false : { opacity: 0, x: 24 * dir, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, x: -16 * dir, filter: "blur(4px)", transition: { duration: 0.18 } }}
              transition={{ duration: 0.45, ease: EASE }}>
              {p.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Print: every panel with its heading, so the PDF is the complete report. */}
      <div className="hidden print:block">
        {panels.map((p) => (
          <section key={p.id} className="mt-12 first:mt-0 print-avoid">
            <h2 className="mb-6 text-2xl">{p.label}</h2>
            {p.content}
          </section>
        ))}
      </div>
    </div>
  );
}
