import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatePanelTone = "info" | "success" | "warning" | "danger" | "muted";

type StatePanelProps = {
  tone?: StatePanelTone;
  label: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  action?: ReactNode;
  className?: string;
};

const borderClasses: Record<StatePanelTone, string> = {
  info: "border-status-info/60",
  success: "border-status-success/60",
  warning: "border-status-warning/60",
  danger: "border-status-danger/60 shadow-danger",
  muted: "border-line"
};

const badgeTone: Record<StatePanelTone, "info" | "success" | "warning" | "danger" | "muted"> = {
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
  muted: "muted"
};

export function StatePanel({
  tone = "info",
  label,
  title,
  description,
  actionLabel,
  actionHref,
  action,
  className
}: StatePanelProps) {
  return (
    <Card className={cn(borderClasses[tone], className)}>
      <CardBody>
        <Badge tone={badgeTone[tone]}>{label}</Badge>
        <h2 className="mt-4 text-lg font-semibold text-ink-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
        {actionLabel && actionHref ? (
          <Button href={actionHref} variant={tone === "danger" ? "danger" : "secondary"} className="mt-5">
            {actionLabel}
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}
