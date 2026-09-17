import { Button, LinkButton } from "./Button";

interface ErrorStateProps {
  title: string;
  message: string;
  retryLabel: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-[var(--radius-card)] border border-concern/30 bg-concern-soft/40 p-5 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted max-w-prose mx-auto">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>{retryLabel}</Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function EmptyState({ title, message, ctaLabel, ctaHref, secondaryLabel, secondaryHref }: EmptyStateProps) {
  return (
    <div className="sky mx-auto max-w-lg py-20 text-center">
      <div className="orbit mx-auto mb-8" style={{ ["--size" as string]: "72px" }} aria-hidden>
        <div className="orbit__ring" />
        <div className="orbit__ring orbit__ring--inner" />
        <div className="orbit__sun" />
        <div className="orbit__moon-track" style={{ animation: "none", transform: "rotate(130deg)" }}><span className="orbit__moon" /></div>
      </div>
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-3 text-muted">{message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href={ctaHref} size="lg">{ctaLabel}</LinkButton>
        {secondaryLabel && secondaryHref && <LinkButton href={secondaryHref} variant="ghost" size="lg">{secondaryLabel}</LinkButton>}
      </div>
    </div>
  );
}
