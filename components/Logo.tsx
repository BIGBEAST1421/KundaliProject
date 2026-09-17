/** Wordmark: a small eight-point star + name. */
export function Logo({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-xl">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="text-accent">
        <path fill="currentColor" d="M12 1.5 13.9 9.2 21.5 12l-7.6 2.8L12 22.5l-1.9-7.7L2.5 12l7.6-2.8Z" />
      </svg>
      {text}
    </span>
  );
}
