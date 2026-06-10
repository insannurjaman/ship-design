import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "accent" | "muted" | "success" | "warning" | "danger" | "info";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  default: "border-line bg-surface-raised text-ink-secondary",
  accent: "border-accent-green/60 bg-accent-soft text-accent-green",
  muted: "border-line/70 bg-surface-panel text-ink-muted",
  success: "border-status-success/60 bg-status-success/10 text-status-success",
  warning: "border-status-warning/60 bg-status-warning/10 text-status-warning",
  danger: "border-status-danger/60 bg-status-danger/10 text-status-danger",
  info: "border-status-info/60 bg-status-info/10 text-status-info"
};

export function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-xs border px-2 py-1 font-mono text-xs font-medium uppercase tracking-normal",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
