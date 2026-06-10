import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: "accent" | "success" | "warning" | "danger" | "info";
  className?: string;
};

const toneClasses: Record<NonNullable<ProgressProps["tone"]>, string> = {
  accent: "bg-accent-green",
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  info: "bg-status-info"
};

export function Progress({
  value,
  max = 100,
  label,
  showValue = true,
  tone = "accent",
  className
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className={cn("grid gap-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-normal">
          <span className="text-ink-muted">{label}</span>
          {showValue ? <span className="text-ink-secondary">{Math.round(percentage)}%</span> : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={Math.round((percentage / 100) * safeMax)}
        className="h-2 overflow-hidden rounded-xs border border-line bg-surface-base"
      >
        <div className={cn("h-full transition-[width]", toneClasses[tone])} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
