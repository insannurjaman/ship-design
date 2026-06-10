import { AppShell } from "@/components/layout/app-shell";
import { StatePanel } from "@/components/layout/state-panel";
import { FigmaStatusPanel } from "@/components/output/figma-status-panel";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { mockFigmaConnection, mockSettings } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Configure workspace defaults for mock project generation, Figma handoff, export behavior, and agent preferences."
      actions={<Button variant="primary">Save settings</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <main className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase text-ink-muted">Workspace profile</p>
                  <h2 className="mt-2 text-xl font-semibold">Money Print</h2>
                </div>
                <StatusPill tone="complete">Saved</StatusPill>
              </div>
            </CardHeader>
            <CardBody className="grid gap-5 md:grid-cols-2">
              <Input label="Workspace name" defaultValue={mockSettings.workspaceName} />
              <Input label="Default Figma file" defaultValue={mockFigmaConnection.file} />
              <Textarea
                label="Workspace description"
                defaultValue="Product design workspace for generating strategy, UX, Figma structure, prototypes, landing pages, and developer handoff."
                className="md:col-span-2"
              />
            </CardBody>
          </Card>

          <FigmaStatusPanel
            workspace={mockFigmaConnection.workspace}
            file={mockFigmaConnection.file}
            lastSync={mockFigmaConnection.lastSync}
          />

          <Card>
            <CardHeader>
              <h2 className="font-mono text-sm uppercase text-ink-secondary">Default outputs</h2>
            </CardHeader>
            <CardBody className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {mockSettings.defaultOutputs.map((output) => (
                <label
                  key={output}
                  className="flex min-h-11 items-center gap-3 border border-line bg-surface-base px-3 py-2 text-sm text-ink-secondary"
                >
                  <input type="checkbox" defaultChecked className="size-4 accent-accent-green" />
                  <span>{output}</span>
                </label>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-mono text-sm uppercase text-ink-secondary">
                Agent and export preferences
              </h2>
            </CardHeader>
            <CardBody className="grid gap-5 md:grid-cols-2">
              <Input label="Model preference" defaultValue={mockSettings.modelPreference} />
              <Input label="Export format" defaultValue={mockSettings.exportFormat} />
              <Textarea
                label="Agent instructions"
                defaultValue="Keep outputs beginner-friendly, practical for Figma and Codex, and aligned to the Ship Design dark technical visual system."
                className="md:col-span-2"
              />
            </CardBody>
          </Card>
        </main>

        <aside className="grid content-start gap-4">
          <StatePanel
            tone="success"
            label="Saved"
            title="Workspace defaults active"
            description="New mock design packages will use these output, model, and export preferences."
          />

          <EmptyState
            title="No team members yet"
            description="Authentication and team management are intentionally out of scope for this UI pass."
          />
        </aside>
      </div>
    </AppShell>
  );
}
