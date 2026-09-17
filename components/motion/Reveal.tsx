"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
/** If the viewport observer never fires (odd embed, headless, print), show anyway. */
const FALLBACK_MS = 1200;

export const item = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE, delay } },
});

type Tag = "div" | "section" | "ul" | "ol" | "li" | "header" | "p" | "span";

/**
 * Reveal-on-view: a soft rise + un-blur when the block enters the viewport. `stagger` reveals
 * direct <RevealItem> children one after another. SSR output is fully visible; the hidden
 * state only applies on the client and always resolves within FALLBACK_MS.
 */
export function Reveal({ children, delay = 0, stagger = 0, className = "", as = "div", once = true }: {
  children: ReactNode; delay?: number; stagger?: number; className?: string; as?: Tag; once?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -8% 0px" });
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setForced(true), FALLBACK_MS);
    return () => clearTimeout(id);
  }, []);

  const Tag = motion[as];
  if (reduce) return <Tag className={className}>{children}</Tag>;

  const show = inView || forced;
  const variants: Variants = stagger
    ? { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }
    : item(delay);

  return (
    <Tag ref={ref as never} className={className} initial="hidden" animate={show ? "show" : "hidden"} variants={variants}>
      {children}
    </Tag>
  );
}

/** Child of a staggered <Reveal>. */
export function RevealItem({ children, className = "", as = "div" }: { children: ReactNode; className?: string; as?: Tag }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return <Tag className={className} variants={item()}>{children}</Tag>;
}
