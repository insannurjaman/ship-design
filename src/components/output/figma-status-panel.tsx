import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

type FigmaStatus = "connected" | "syncing" | "sent" | "error";

type FigmaStatusPanelProps = {
  workspace: string;
  file: string;
  lastSync: string;
  status?: FigmaStatus;
  onRetry?: () => void;
};

const statusCopy: Record<FigmaStatus, { label: string; tone: "complete" | "running" | "error" | "info"; detail: string }> = {
  connected: {
    label: "Connected",
    tone: "complete",
    detail: "Ready to receive approved product artifacts."
  },
  syncing: {
    label: "Syncing",
    tone: "running",
    detail: "Sending the current artifact package to the Figma foundation."
  },
  sent: {
    label: "Sent",
    tone: "complete",
    detail: "Latest mock package has been handed to the Figma-ready structure."
  },
  error: {
    label: "Retry needed",
    tone: "error",
    detail: "Figma handoff failed locally. Retry without losing approved outputs."
  }
};

export function FigmaStatusPanel({
  workspace,
  file,
  lastSync,
  status = "connected",
  onRetry
}: FigmaStatusPanelProps) {
  const copy = statusCopy[status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-sm uppercase text-ink-secondary">Figma handoff</h2>
          <StatusPill tone={copy.tone} pulse={status === "syncing"}>
            {copy.label}
          </StatusPill>
        </div>
      </CardHeader>
      <CardBody className="grid gap-3">
        <p className="text-sm leading-6 text-ink-secondary" aria-live="polite">
          {copy.detail}
        </p>
        <div className="border border-line bg-surface-base p-3">
          <p className="font-mono text-xs uppercase text-ink-muted">Workspace</p>
          <p className="mt-2 text-sm text-ink-secondary">{workspace}</p>
        </div>
        <div className="border border-line bg-surface-base p-3">
          <p className="font-mono text-xs uppercase text-ink-muted">Target file</p>
          <p className="mt-2 text-sm text-ink-secondary">{file}</p>
        </div>
        <div className="border border-line bg-surface-base p-3">
          <p className="font-mono text-xs uppercase text-ink-muted">Last sync</p>
          <p className="mt-2 text-sm text-accent-green">{lastSync}</p>
        </div>
        {status === "error" && onRetry ? (
          <Button variant="danger" onClick={onRetry}>
            Retry Figma sync
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}
