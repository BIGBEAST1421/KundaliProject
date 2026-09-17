"use client";

import { useEffect, useState } from "react";

interface CosmicLoaderProps {
  /** Primary contextual message, e.g. "Reading your astro profile…" */
  message: string;
  /** Optional rotating sub-steps shown beneath the message. */
  steps?: readonly string[];
  /** Compact inline variant. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Astrology-themed loading state: a moon orbiting a small sun inside two rings, with a few
 * twinkling stars. CSS-only; reduced-motion users get a static composition.
 */
export function CosmicLoader({ message, steps, size = "md", className = "" }: CosmicLoaderProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!steps || steps.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % steps.length), 1800);
    return () => clearInterval(id);
  }, [steps]);

  const dim = size === "sm" ? "56px" : "88px";
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-5 text-center ${className}`}>
      <div className="orbit" style={{ ["--size" as string]: dim }} aria-hidden>
        <span className="orbit__star" style={{ left: "6%", top: "18%" }} />
        <span className="orbit__star" style={{ right: "4%", top: "40%", animationDelay: "0.8s" }} />
        <span className="orbit__star" style={{ left: "22%", bottom: "6%", animationDelay: "1.5s" }} />
        <div className="orbit__ring" />
        <div className="orbit__ring orbit__ring--inner" />
        <div className="orbit__sun" />
        <div className="orbit__moon-track"><span className="orbit__moon" /></div>
      </div>
      <div>
        <p className={`font-display ${size === "sm" ? "text-base" : "text-xl"}`}>✦ {message}</p>
        {steps && steps.length > 0 && (
          <p key={i} className="loader-msg mt-1.5 text-sm text-muted">{steps[i]}</p>
        )}
      </div>
    </div>
  );
}

/** Full-height wrapper for route-level loading states. */
export function PageLoader(props: CosmicLoaderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <CosmicLoader {...props} />
    </div>
  );
}
