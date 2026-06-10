import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusPillTone = "idle" | "queued" | "running" | "complete" | "warning" | "error" | "info";

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
  pulse?: boolean;
  className?: string;
};

const toneClasses: Record<StatusPillTone, string> = {
  idle: "border-line bg-surface-raised text-ink-muted",
  queued: "border-line-strong bg-surface-raised text-ink-secondary",
  running: "border-accent-green/70 bg-accent-soft text-accent-green",
  complete: "border-status-success/60 bg-status-success/10 text-status-success",
  warning: "border-status-warning/60 bg-status-warning/10 text-status-warning",
  error: "border-status-danger/60 bg-status-danger/10 text-status-danger",
  info: "border-status-info/60 bg-status-info/10 text-status-info"
};

const dotClasses: Record<StatusPillTone, string> = {
  idle: "bg-ink-muted",
  queued: "bg-ink-secondary",
  running: "bg-accent-green",
  complete: "bg-status-success",
  warning: "bg-status-warning",
  error: "bg-status-danger",
  info: "bg-status-info"
};

export function StatusPill({ children, tone = "idle", pulse = false, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-2 rounded-xs border px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-normal",
        toneClasses[tone],
        className
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5", dotClasses[tone], pulse && "motion-safe:animate-pulse")} />
      {children}
    </span>
  );
}
