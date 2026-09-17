import type { HTMLAttributes } from "react";

/** Single-level surface. Never nest cards. */
export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[var(--radius-card)] border border-line bg-bg shadow-card ${className}`} {...rest} />;
}
