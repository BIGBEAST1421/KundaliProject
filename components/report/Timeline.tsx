interface Item { period: string; desc: string; current?: boolean }

/** Vertical timeline with a marker per period. */
export function Timeline({ items }: { items: Item[] }) {
  return (
    <ol className="relative ml-2 border-l border-line pl-6">
      {items.map((it, i) => (
        <li key={i} className="relative pb-5 last:pb-0">
          <span className={`absolute -left-[31px] top-1.5 size-2.5 rounded-full border-2 border-bg ${it.current ? "bg-accent ring-4 ring-accent-soft" : "bg-line-strong"}`} aria-hidden />
          <p className={`text-sm ${it.current ? "font-semibold" : "font-medium"}`}>{it.period}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">{it.desc}</p>
        </li>
      ))}
    </ol>
  );
}
