"use client";

interface ChipProps {
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

/** Toggle chip for multi-select groups. */
export function Chip({ selected, onToggle, children, disabled }: ChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onToggle}
      className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-150 disabled:opacity-50
        ${selected ? "border-accent bg-accent-soft text-ink" : "border-line-strong text-muted hover:text-ink hover:bg-surface"}`}
    >
      {children}
    </button>
  );
}
