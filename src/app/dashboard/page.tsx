import { AgentStatusList } from "@/components/agent/agent-status-list";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/layout/metric-card";
import { StatePanel } from "@/components/layout/state-panel";
import { OutputList } from "@/components/output/output-list";
import { ProjectCard } from "@/components/project/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";
import {
  mockAgentRuns,
  mockAgentTemplates,
  mockFigmaConnection,
  mockOutputs,
  mockProjects,
  mockUsageSummary
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Monitor active product design packages, agent progress, Figma connection health, and generated artifacts."
      actions={
        <Button href="/projects/new" variant="primary">
          Create new project
        </Button>
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card>
            <CardBody className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <Badge tone="accent">Welcome back</Badge>
                <h2 className="mt-4 text-2xl font-semibold text-ink-primary">
                  Ready to turn the next idea into a design package.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary">
                  Aurora is in output review. The flow agent has finished the main path and one
                  artifact needs approval before Figma generation.
                </p>
              </div>
              <div className="grid min-w-48 gap-3 border border-line bg-surface-base p-4">
                <p className="font-mono text-xs uppercase text-ink-muted">Current run</p>
                <Progress value={72} label="Aurora" />
                <StatusPill tone="running" pulse>
                  Agent active
                </StatusPill>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-mono text-sm uppercase text-ink-secondary">Usage summary</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-3">
              {[
                ["Projects", mockUsageSummary.projectsThisMonth],
                ["Agent runs", mockUsageSummary.agentRuns],
                ["Figma prep", mockUsageSummary.figmaSyncs],
                ["Handoffs", mockUsageSummary.handoffs]
              ].map(([label, value]) => (
                <MetricCard key={label} label={String(label)} value={value} />
              ))}
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-mono text-sm uppercase text-ink-secondary">Recent projects</h2>
                <Button href="/projects" variant="ghost" size="sm">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardBody className="grid gap-4 md:grid-cols-2">
              {mockProjects.slice(0, 2).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-mono text-sm uppercase text-ink-secondary">Figma</h2>
                <StatusPill tone="complete">{mockFigmaConnection.status}</StatusPill>
              </div>
            </CardHeader>
            <CardBody className="grid gap-3 text-sm">
              <div className="border border-line bg-surface-base p-3">
                <p className="font-mono text-xs uppercase text-ink-muted">Workspace</p>
                <p className="mt-2 text-ink-secondary">{mockFigmaConnection.workspace}</p>
              </div>
              <div className="border border-line bg-surface-base p-3">
                <p className="font-mono text-xs uppercase text-ink-muted">File</p>
                <p className="mt-2 text-ink-secondary">{mockFigmaConnection.file}</p>
              </div>
              <Badge tone="success">Synced {mockFigmaConnection.lastSync}</Badge>
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <h2 className="font-mono text-sm uppercase text-ink-secondary">Agent templates</h2>
            </CardHeader>
            <CardBody className="grid gap-3">
              {mockAgentTemplates.map((template) => (
                <div key={template.name} className="border border-line bg-surface-base p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium">{template.name} Agent</h3>
                      <p className="mt-2 text-sm leading-6 text-ink-muted">{template.role}</p>
                    </div>
                    <Badge tone={template.status === "enabled" ? "success" : "muted"}>
                      {template.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
          <AgentStatusList agents={mockAgentRuns} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <OutputList outputs={mockOutputs.slice(0, 5)} />
          <div className="grid gap-4">
            <StatePanel
              tone="success"
              label="Healthy"
              title="No blocked handoffs"
              description="Current mock packages are available for output review and Figma handoff."
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
