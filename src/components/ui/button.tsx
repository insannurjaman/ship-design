import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-accent-green bg-accent-green text-surface-base hover:bg-accent-strong active:bg-accent-strong",
  secondary:
    "border-line bg-surface-raised text-ink-primary hover:border-line-strong hover:bg-surface-hover active:bg-surface-panel",
  ghost:
    "border-transparent bg-transparent text-ink-secondary hover:border-line hover:bg-surface-raised hover:text-ink-primary active:bg-surface-panel",
  danger:
    "border-status-danger/70 bg-status-danger/10 text-status-danger hover:bg-status-danger/15 active:bg-status-danger/20"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 py-2 text-xs",
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-5 py-3 text-sm"
};

export function Button({
  children,
  href,
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm border font-mono font-medium uppercase tracking-normal transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green",
    "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-panel disabled:text-ink-muted disabled:opacity-70",
    "aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:bg-surface-panel aria-disabled:text-ink-muted aria-disabled:opacity-70",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const content = (
    <>
      {loading ? (
        <span
          aria-hidden="true"
          className="size-3 animate-spin rounded-full border border-current border-r-transparent"
        />
      ) : null}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={isDisabled ? "#" : href}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={isDisabled} className={classes} {...props}>
      {content}
    </button>
  );
}
