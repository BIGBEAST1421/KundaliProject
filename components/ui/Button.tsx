import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-quart)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-95",
  secondary: "border border-line-strong text-ink hover:bg-surface",
  ghost: "text-ink hover:bg-surface",
};
const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} aria-busy={loading || undefined} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="size-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function LinkButton({ href, variant = "primary", size = "md", className = "", children }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
