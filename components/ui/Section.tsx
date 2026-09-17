import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}

/** Report section: heading + optional caption + content. Page-break-safe in print. */
export function Section({ id, title, caption, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`print-avoid scroll-mt-24 ${className}`} aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="mb-4">
        <h2 id={id ? `${id}-h` : undefined} className="text-2xl md:text-[1.75rem] leading-tight">{title}</h2>
        {caption && <p className="mt-1 text-sm text-muted">{caption}</p>}
      </div>
      {children}
    </section>
  );
}
