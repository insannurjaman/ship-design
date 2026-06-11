import { NewProjectForm } from "@/components/project/new-project-form";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { mockOutputs } from "@/lib/mock-data";
import { outputScopeHelperText, supportedV1Outputs } from "@/lib/output-scope";

export default function NewProjectPage() {
  return (
    <AppShell
      title="New Project"
      eyebrow="Intake"
      description="Describe the product once. Ship Design turns it into practical product, UX, design, Figma, prototype, landing, and handoff outputs."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <NewProjectForm />

        <aside className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <h2 className="font-mono text-sm uppercase text-ink-secondary">Package preview</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">{outputScopeHelperText}</p>
            </CardHeader>
            <CardBody className="grid gap-3">
              <div className="grid gap-3">
                <p className="font-mono text-xs uppercase text-accent-green">Available package outputs</p>
                {mockOutputs
                  .filter((output) => supportedV1Outputs.includes(output.title as (typeof supportedV1Outputs)[number]))
                  .map((output) => (
                    <div key={output.id} className="border border-line bg-surface-base p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-xs uppercase text-accent-green">
                          {output.type}
                        </span>
                        <Badge tone="success">Selectable</Badge>
                      </div>
                      <p className="mt-2 text-sm text-ink-secondary">{output.title}</p>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>

          <EmptyState
            title="No clarifying questions yet"
            description="If the idea is too thin, Ship Design will pause here and ask for the missing inputs before running agents."
          />

          <Card className="border-status-warning/60">
            <CardBody>
              <Badge tone="warning">Review guardrail</Badge>
              <h2 className="mt-4 text-lg font-semibold">Style conflict detected</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">
                If a prompt asks for conflicting visual directions, the agent flags it before Figma
                generation.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
