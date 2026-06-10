import { MarketingShell } from "@/components/layout/marketing-shell";
import { Hero } from "@/components/marketing/hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { mockFigmaConnection, mockOutputs } from "@/lib/mock-data";

const pipeline = [
  "Product strategy",
  "UX research",
  "User flows",
  "Screen inventory",
  "Design system",
  "Prototype",
  "Landing page",
  "Developer handoff"
];

export default function MarketingPage() {
  return (
    <MarketingShell>
      <Hero />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-xs uppercase text-ink-muted">Design package</p>
                <h2 className="mt-2 text-xl font-semibold">One idea becomes a reviewable system</h2>
              </div>
              <Badge tone="accent">Figma-ready</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pipeline.map((item, index) => (
                <div key={item} className="border border-line bg-surface-base p-4">
                  <p className="font-mono text-xs text-ink-muted">0{index + 1}</p>
                  <h3 className="mt-3 text-sm font-medium text-ink-primary">{item}</h3>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-mono text-sm uppercase text-ink-secondary">Figma connection</h2>
                <StatusPill tone="complete">{mockFigmaConnection.status}</StatusPill>
              </div>
            </CardHeader>
            <CardBody className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border border-line bg-surface-base p-3">
                <span className="text-ink-muted">Workspace</span>
                <span className="text-right font-mono text-ink-secondary">
                  {mockFigmaConnection.workspace}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border border-line bg-surface-base p-3">
                <span className="text-ink-muted">Last sync</span>
                <span className="font-mono text-accent-green">{mockFigmaConnection.lastSync}</span>
              </div>
            </CardBody>
          </Card>

          <EmptyState
            title="No blockers"
            description="The current mock workspace is ready for package review and Figma handoff."
            className="min-h-56"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {mockOutputs.slice(0, 4).map((output) => (
          <Card key={output.id} interactive>
            <CardBody>
              <Badge tone={output.status === "ready" ? "success" : "warning"}>{output.status}</Badge>
              <p className="mt-4 font-mono text-xs uppercase text-accent-green">{output.type}</p>
              <h3 className="mt-2 text-lg font-medium">{output.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">{output.summary}</p>
            </CardBody>
          </Card>
        ))}
      </section>
    </MarketingShell>
  );
}
