"use client";

import { useState } from "react";
import { ArtifactContentRenderer } from "@/components/output/artifact-content-renderer";
import { ArtifactVersionPanel, type ViewerArtifactVersion } from "@/components/output/artifact-version-panel";
import { FigmaStatusPanel } from "@/components/output/figma-status-panel";
import { RegenerateArtifactDialog } from "@/components/output/regenerate-artifact-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import type { AiProviderId } from "@/lib/ai/types";
import type { OutputArtifact } from "@/lib/mock-data";

type FigmaActionState = "connected" | "syncing" | "sent" | "error";
type ExportState = "idle" | "loading" | "ready";
type ViewerOutputArtifact = OutputArtifact & {
  markdown?: string;
  provider?: string;
  model?: string;
  mode?: "mock" | "real";
  warnings?: string[];
  attemptedProviders?: AiProviderId[];
  fallbackUsed?: boolean;
  finalProvider?: AiProviderId;
  providerWarnings?: string[];
  activeVersion?: number;
  versions?: ViewerArtifactVersion[];
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
    attemptedProviders?: AiProviderId[];
    fallbackUsed?: boolean;
    finalProvider?: AiProviderId;
    providerWarnings?: string[];
  };
  regenerateHref?: string;
  runId?: string;
};

export function OutputViewer({
  projectId,
  outputs,
  figmaConnection,
  runInfo,
  regenerateHref,
  runId
}: OutputViewerProps) {
  const [viewerOutputs, setViewerOutputs] = useState<ViewerOutputArtifact[]>(outputs);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [figmaState, setFigmaState] = useState<FigmaActionState>("connected");
  const [regeneratingArtifactId, setRegeneratingArtifactId] = useState<string | null>(null);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  const [regenerationNotice, setRegenerationNotice] = useState<string | null>(null);

  const markdown = viewerOutputs
    .map((output) => [
      `# ${output.title}`,
      "",
      output.summary,
      "",
      output.markdown ?? output.body.map((paragraph) => `- ${paragraph}`).join("\n")
    ].join("\n"))
    .join("\n\n---\n\n");
  const fallbackUsed = Boolean(runInfo?.fallbackUsed);
  const providerWarnings = runInfo?.providerWarnings ?? [];
  const warningText = createProviderWarningText(runInfo);
  const canRegenerate = Boolean(runId);

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

  async function regenerateOutputArtifact(artifactId: string, feedback?: string) {
    if (!runId) return;

    setRegenerationError(null);
    setRegenerationNotice(null);
    setRegeneratingArtifactId(artifactId);

    try {
      const response = await fetch(`/api/generation-runs/${encodeURIComponent(runId)}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          artifactId,
          feedback
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            artifact?: ViewerOutputArtifact;
            activeVersion?: number;
            warnings?: string[];
            error?: string;
          }
        | null;

      if (!response.ok || !payload?.artifact) {
        setRegenerationError(payload?.error ?? "Ship Design could not regenerate this artifact. The active version was not changed.");
        return;
      }

      setViewerOutputs((current) =>
        current.map((output) => (output.id === artifactId ? payload.artifact as ViewerOutputArtifact : output))
      );
      setRegenerationNotice(`Regenerated ${payload.artifact.title} as version ${payload.activeVersion ?? payload.artifact.activeVersion}.`);
    } catch {
      setRegenerationError("Network error while regenerating this artifact. The active version was not changed.");
    } finally {
      setRegeneratingArtifactId(null);
    }
  }

  const items: TabItem[] = viewerOutputs.map((output) => ({
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
          <div className="flex flex-wrap gap-2">
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
            <Badge tone="accent">Active v{output.activeVersion ?? 1}</Badge>
          </div>
        </div>
        <div className="border border-line bg-surface-base p-5 sm:p-6">
          <ArtifactContentRenderer markdown={output.markdown ?? createMarkdownFromOutput(output)} />
        </div>
        {canRegenerate ? (
          <RegenerateArtifactDialog
            artifactTitle={output.title}
            disabled={Boolean(regeneratingArtifactId)}
            isLoading={regeneratingArtifactId === output.id}
            onSubmit={(feedback) => regenerateOutputArtifact(output.id, feedback)}
          />
        ) : null}
        <ArtifactVersionPanel
          activeVersion={output.activeVersion ?? 1}
          versions={output.versions}
        />
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
              <div className="mt-5 grid gap-2 border border-line bg-surface-base p-3 sm:grid-cols-2 xl:grid-cols-6">
                <MetadataItem label="Provider" value={runInfo.provider} />
                <MetadataItem label="Mode" value={runInfo.mode} />
                <MetadataItem label="Model" value={runInfo.model} />
                <MetadataItem label="Generated" value={formatGeneratedAt(runInfo.createdAt)} />
                <MetadataItem label="Fallback" value={fallbackUsed ? "yes" : "no"} tone={fallbackUsed ? "warning" : "default"} />
                {fallbackUsed ? (
                  <MetadataItem
                    label="Attempted"
                    value={(runInfo.attemptedProviders ?? []).join(" -> ") || "none"}
                    tone="warning"
                  />
                ) : null}
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
              {regeneratingArtifactId ? <StatusPill tone="running" pulse>Regenerating artifact</StatusPill> : null}
              {regenerationNotice ? <StatusPill tone="complete">{regenerationNotice}</StatusPill> : null}
            </div>
            {regenerationError ? (
              <div className="mt-4 border border-status-danger/70 bg-status-danger/10 p-4" aria-live="assertive">
                <Badge tone="danger">Regeneration failed</Badge>
                <p className="mt-3 text-sm leading-6 text-ink-secondary">{regenerationError}</p>
              </div>
            ) : null}
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
            {viewerOutputs.map((output) => (
              <div key={output.id} className="flex items-center justify-between gap-3 border border-line bg-surface-base p-3">
                <span className="text-sm text-ink-secondary">{output.title}</span>
                <span className="font-mono text-xs uppercase text-ink-muted">v{output.activeVersion ?? 1}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {fallbackUsed && warningText ? (
          <Card className="border-status-warning/60">
            <CardBody>
              <Badge tone="warning">Provider warning</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">{warningText}</p>
              {providerWarnings.length > 0 ? (
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink-muted">
                  {providerWarnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              ) : null}
            </CardBody>
          </Card>
        ) : null}

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

function createProviderWarningText(runInfo?: OutputViewerProps["runInfo"]) {
  if (!runInfo?.fallbackUsed) return "";

  if (runInfo.finalProvider === "mock") {
    return "All configured real providers failed or were unavailable. Ship Design used mock generation as the final fallback.";
  }

  return `Ship Design used ${runInfo.finalProvider ?? runInfo.provider} after the selected real provider could not complete the request.`;
}
