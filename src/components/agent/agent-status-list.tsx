import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { AgentRun } from "@/lib/mock-data";

type AgentStatusListProps = {
  agents: AgentRun[];
};

export function AgentStatusList({ agents }: AgentStatusListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-sm uppercase text-ink-secondary">Agent pipeline</h2>
          <StatusPill tone="running" pulse>
            Active
          </StatusPill>
        </div>
      </CardHeader>
      <CardBody className="grid gap-3">
        {agents.map((agent) => (
          <div key={agent.id} className="grid gap-3 border border-line bg-surface-base p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-ink-primary">{agent.name}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{agent.description}</p>
              </div>
              <StatusPill
                tone={
                  agent.status === "running"
                    ? "running"
                    : agent.status === "complete"
                      ? "complete"
                      : agent.status === "error"
                        ? "error"
                        : "queued"
                }
                pulse={agent.status === "running"}
              >
                {agent.status}
              </StatusPill>
            </div>
            <p className="font-mono text-xs text-ink-muted">{agent.output}</p>
            {agent.progress > 0 ? (
              <Progress value={agent.progress} label={agent.id} showValue={false} />
            ) : null}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
