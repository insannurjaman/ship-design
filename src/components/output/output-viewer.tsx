"use client";

import { useState } from "react";
import { FigmaStatusPanel } from "@/components/output/figma-status-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import type { OutputArtifact } from "@/lib/mock-data";

type FigmaActionState = "connected" | "syncing" | "sent" | "error";
type ExportState = "idle" | "loading" | "ready";

type OutputViewerProps = {
  projectId: string;
  outputs: OutputArtifact[];
  figmaConnection: {
    workspace: string;
    file: string;
    lastSync: string;
  };
};

export function OutputViewer({ projectId, outputs, figmaConnection }: OutputViewerProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [figmaState, setFigmaState] = useState<FigmaActionState>("connected");

  const markdown = outputs
    .map((output) => [
      `# ${output.title}`,
      "",
      output.summary,
      "",
      ...output.body.map((paragraph) => `- ${paragraph}`)
    ].join("\n"))
    .join("\n\n---\n\n");

  async function copyOutput() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdown);
      }
    } catch {
      // Local demo still confirms the selected package action even when browser clipboard permission is unavailable.
    }
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function exportOutput() {
    setExportState("loading");
    window.setTimeout(() => {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ship-design-output-package.md";
      link.click();
      URL.revokeObjectURL(url);
      setExportState("ready");
    }, 700);
  }

  function sendToFigma() {
    setFigmaState("syncing");
    window.setTimeout(() => setFigmaState("sent"), 1300);
  }

  function retryFigma() {
    setFigmaState("syncing");
    window.setTimeout(() => setFigmaState("sent"), 900);
  }

  const items: TabItem[] = outputs.map((output) => ({
    id: output.id,
    label: output.title,
    content: (
      <article className="grid gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent-green">{output.type}</p>
            <h2 className="mt-2 text-2xl font-semibold">{output.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-secondary">{output.summary}</p>
          </div>
          <Badge
            tone={
              output.status === "ready"
                ? "success"
                : output.status === "error"
                  ? "danger"
                  : output.status === "needs-review"
                    ? "warning"
                    : "default"
            }
          >
            {output.status}
          </Badge>
        </div>
        <div className="grid gap-3">
          {output.body.map((paragraph) => (
            <p key={paragraph} className="border border-line bg-surface-base p-4 text-sm leading-7 text-ink-secondary">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    )
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="grid min-w-0 gap-6">
        <Card>
          <CardHeader>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <p className="font-mono text-xs uppercase text-ink-muted">Artifact tabs</p>
                <h2 className="mt-2 text-xl font-semibold">Review package outputs</h2>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">
                  Select an artifact, review generated content, then copy, export, or send the approved package to Figma.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={copyOutput}>
                  {copyState === "copied" ? "Copied" : "Copy output"}
                </Button>
                <Button variant="secondary" loading={exportState === "loading"} onClick={exportOutput}>
                  {exportState === "ready" ? "Export ready" : "Export"}
                </Button>
                <Button variant="primary" loading={figmaState === "syncing"} onClick={sendToFigma}>
                  {figmaState === "sent" ? "Sent to Figma" : "Send to Figma"}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" aria-live="polite">
              {copyState === "copied" ? <StatusPill tone="complete">Copied to clipboard</StatusPill> : null}
              {exportState === "loading" ? <StatusPill tone="running" pulse>Preparing export</StatusPill> : null}
              {exportState === "ready" ? <StatusPill tone="complete">Export ready</StatusPill> : null}
              {figmaState === "syncing" ? <StatusPill tone="running" pulse>Figma syncing</StatusPill> : null}
              {figmaState === "sent" ? <StatusPill tone="complete">Figma sent</StatusPill> : null}
            </div>
          </CardHeader>
          <CardBody>
            <Tabs items={items} defaultValue="brief" />
          </CardBody>
        </Card>
      </main>

      <aside className="grid min-w-0 content-start gap-4">
        <FigmaStatusPanel
          workspace={figmaConnection.workspace}
          file={figmaConnection.file}
          lastSync={figmaConnection.lastSync}
          status={figmaState}
          onRetry={retryFigma}
        />

        <Card>
          <CardHeader>
            <h2 className="font-mono text-sm uppercase text-ink-secondary">Package map</h2>
          </CardHeader>
          <CardBody className="grid gap-2">
            {outputs.map((output) => (
              <div key={output.id} className="flex items-center justify-between gap-3 border border-line bg-surface-base p-3">
                <span className="text-sm text-ink-secondary">{output.title}</span>
                <span className="font-mono text-xs uppercase text-ink-muted">{output.type}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <EmptyState
          title="No reviewer comments"
          description="Comments will appear here once collaboration and auth are added."
        />

        <Button href={`/projects/${projectId}?run=mock`} variant="secondary">
          Regenerate section
        </Button>
      </aside>
    </div>
  );
}
