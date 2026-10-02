import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}

/** Report section: heading + optional caption + content. The heading is kept from being
 * orphaned alone at a page bottom in print, but the section as a whole is NOT print-avoid --
 * some sections (Yogas, Remedies) hold more content than fits on one page, and forcing the
 * whole thing unsplittable strands the heading and wastes the rest of that page. Content that
 * genuinely shouldn't be split (a table, a single card) declares print-avoid itself. */
export function Section({ id, title, caption, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`} aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="mb-4 print-keep">
        <h2 id={id ? `${id}-h` : undefined} className="text-2xl md:text-[1.75rem] leading-tight">{title}</h2>
        {caption && <p className="mt-1 text-sm text-muted">{caption}</p>}
      </div>
      {children}
    </section>
  );
}
