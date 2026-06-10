import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  className
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "grid place-items-center rounded-sm border border-dashed border-line bg-surface-panel px-5 py-12 text-center",
        className
      )}
    >
      <div className="max-w-md">
        <div aria-hidden="true" className="mx-auto mb-5 h-px w-24 bg-accent-green" />
        <p className="font-mono text-xs uppercase tracking-normal text-accent-green">No data</p>
        <h2 className="mt-3 text-xl font-semibold text-ink-primary">{title}</h2>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{description}</p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
        {actionLabel && actionHref ? (
          <div className="mt-6">
            <Button href={actionHref} variant="primary">
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
