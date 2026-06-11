"use client";

import { useState } from "react";
import { ArtifactContentRenderer } from "@/components/output/artifact-content-renderer";
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
type ViewerOutputArtifact = OutputArtifact & {
  markdown?: string;
  provider?: string;
  model?: string;
  mode?: "mock" | "real";
  warnings?: string[];
};

type OutputViewerProps = {
  projectId: string;
  outputs: ViewerOutputArtifact[];
  figmaConnection: {
    workspace: string;
    file: string;
    lastSync: string;
  };
  runInfo?: {
    provider: string;
    model: string;
    mode: "mock" | "real";
    createdAt?: string;
    warnings?: string[];
  };
  regenerateHref?: string;
};

export function OutputViewer({
  projectId,
  outputs,
  figmaConnection,
  runInfo,
  regenerateHref
}: OutputViewerProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [figmaState, setFigmaState] = useState<FigmaActionState>("connected");

  const markdown = outputs
    .map((output) => [
      `# ${output.title}`,
      "",
      output.summary,
      "",
      output.markdown ?? output.body.map((paragraph) => `- ${paragraph}`).join("\n")
    ].join("\n"))
    .join("\n\n---\n\n");
  const fallbackUsed = Boolean(runInfo?.warnings?.length);

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
      <article className="grid gap-6">
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
        <div className="border border-line bg-surface-base p-5 sm:p-6">
          <ArtifactContentRenderer markdown={output.markdown ?? createMarkdownFromOutput(output)} />
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
                  Select an artifact, review generated content, then copy, export, or prepare the approved structure for a future Figma sync.
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
                  {figmaState === "sent" ? "Figma package prepared" : "Prepare Figma package"}
                </Button>
              </div>
            </div>
            {runInfo ? (
              <div className="mt-5 grid gap-2 border border-line bg-surface-base p-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetadataItem label="Provider" value={runInfo.provider} />
                <MetadataItem label="Mode" value={runInfo.mode} />
                <MetadataItem label="Model" value={runInfo.model} />
                <MetadataItem label="Generated" value={formatGeneratedAt(runInfo.createdAt)} />
                <MetadataItem label="Fallback" value={fallbackUsed ? "yes" : "no"} tone={fallbackUsed ? "warning" : "default"} />
              </div>
            ) : (
              <div className="mt-5 border border-line bg-surface-base p-3">
                <MetadataItem label="Mode" value="local demo" />
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2" aria-live="polite">
              {runInfo ? (
                <>
                  <StatusPill tone={runInfo.provider === "mock" ? "info" : "complete"}>
                    Provider {runInfo.provider}
                  </StatusPill>
                  <StatusPill tone={runInfo.mode === "real" ? "complete" : "info"}>
                    Mode {runInfo.mode}
                  </StatusPill>
                  <StatusPill tone="info">Model {runInfo.model}</StatusPill>
                </>
              ) : null}
              {copyState === "copied" ? <StatusPill tone="complete">Copied to clipboard</StatusPill> : null}
              {exportState === "loading" ? <StatusPill tone="running" pulse>Preparing export</StatusPill> : null}
              {exportState === "ready" ? <StatusPill tone="complete">Export ready</StatusPill> : null}
              {figmaState === "syncing" ? <StatusPill tone="running" pulse>Preparing mock Figma package</StatusPill> : null}
              {figmaState === "sent" ? <StatusPill tone="complete">Mock Figma package ready</StatusPill> : null}
            </div>
            <p className="mt-3 font-mono text-xs uppercase text-ink-muted">
              Figma API is not connected yet. This action prepares a local package only.
            </p>
          </CardHeader>
          <CardBody>
            <Tabs items={items} defaultValue={outputs[0]?.id} />
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

        {runInfo?.warnings?.map((warning) => (
          <Card key={warning} className="border-status-warning/60">
            <CardBody>
              <Badge tone="warning">Provider warning</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">{warning}</p>
            </CardBody>
          </Card>
        ))}

        <EmptyState
          title="No reviewer comments"
          description="Comments will appear here once collaboration and auth are added."
        />

        <Button href={regenerateHref ?? `/projects/${projectId}?run=mock`} variant="secondary">
          Regenerate section
        </Button>
      </aside>
    </div>
  );
}

function MetadataItem({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[11px] uppercase text-ink-muted">{label}</p>
      <p className={tone === "warning" ? "mt-1 truncate font-mono text-xs text-status-warning" : "mt-1 truncate font-mono text-xs text-ink-secondary"}>
        {value}
      </p>
    </div>
  );
}

function createMarkdownFromOutput(output: ViewerOutputArtifact) {
  return [`# ${output.title}`, "", output.summary, "", ...output.body.map((paragraph) => `- ${paragraph}`)].join("\n");
}

function formatGeneratedAt(value?: string) {
  if (!value) return "demo";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
