import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { ActivityLog as ActivityLogItem } from "@/lib/mock-data";

type ActivityLogProps = {
  logs: ActivityLogItem[];
  visibleCount?: number;
};

export function ActivityLog({ logs, visibleCount = logs.length }: ActivityLogProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-mono text-sm uppercase text-ink-secondary">Activity log</h2>
      </CardHeader>
      <CardBody className="grid gap-3" aria-live="polite">
        {logs.map((log, index) => {
          const visible = index < visibleCount;

          return (
            <div
              key={log.id}
              className={visible ? "border border-line bg-surface-base p-3" : "border border-line bg-surface-base p-3 opacity-45"}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-ink-muted">{log.time}</span>
                <Badge tone={visible ? log.tone : "muted"}>{log.label}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                {visible ? log.message : "Waiting for agent event..."}
              </p>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
