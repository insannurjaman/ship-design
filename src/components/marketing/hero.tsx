import { APP_TAGLINE } from "@/lib/constants";
import { mockAgentRuns, mockOutputs } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_520px] lg:py-16">
      <div className="flex min-h-[560px] flex-col justify-between border border-line bg-surface-panel/70 p-5 shadow-panel sm:p-8">
        <div>
          <Badge tone="accent">AI product design agents</Badge>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-ink-primary sm:text-5xl lg:text-6xl">
            Ship Design
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-secondary sm:text-lg">
            {APP_TAGLINE} Move from rough idea to strategy docs, UX flows, Figma-ready structure,
            prototype direction, landing page plan, and developer handoff.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/projects/new" variant="primary" size="lg">
              Start package
            </Button>
            <Button href="/dashboard" size="lg">
              View dashboard
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
          {[
            ["08", "outputs"],
            ["07", "agents"],
            ["01", "Figma file"]
          ].map(([value, label]) => (
            <div key={label} className="border border-line bg-surface-base p-4">
              <p className="font-mono text-2xl text-accent-green">{value}</p>
              <p className="mt-1 font-mono text-xs uppercase text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="border border-line bg-surface-panel p-5 shadow-elevated">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-ink-muted">Pipeline preview</p>
              <h2 className="mt-2 text-xl font-semibold">Aurora Retention OS</h2>
            </div>
            <StatusPill tone="running" pulse>
              Running
            </StatusPill>
          </div>
          <Progress value={72} label="Package progress" className="mt-6" />
          <div className="mt-5 grid gap-3">
            {mockAgentRuns.slice(0, 4).map((agent) => (
              <div key={agent.id} className="border border-line bg-surface-base p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-ink-primary">{agent.name}</span>
                  <span className="font-mono text-xs uppercase text-accent-green">
                    {agent.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-muted">{agent.output}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border border-line bg-surface-panel p-5">
          <p className="font-mono text-xs uppercase text-ink-muted">Generated artifacts</p>
          {mockOutputs.slice(0, 4).map((output) => (
            <div key={output.id} className="flex items-center justify-between gap-4 border-t border-line pt-3">
              <span className="text-sm text-ink-secondary">{output.title}</span>
              <Badge tone={output.status === "ready" ? "success" : "warning"}>{output.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
