"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Gentle lift + shadow on hover for interactive surfaces. */
export function HoverLift({ children, className = "", as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag className={className} whileHover={reduce ? undefined : { y: -3 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
      {children}
    </Tag>
  );
}
