"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { AiProviderId } from "@/lib/ai/types";

export type ViewerArtifactVersion = {
  version: number;
  markdown: string;
  summary: string;
  body: string[];
  provider: AiProviderId | string;
  mode: "mock" | "real";
  model: string;
  createdAt: string;
  feedback?: string;
  warnings: string[];
  attemptedProviders: AiProviderId[];
  fallbackUsed: boolean;
  finalProvider: AiProviderId;
  providerWarnings: string[];
  providerDiagnostics?: Array<{
    provider: AiProviderId | string;
    summary: string;
    detail: string;
    status?: number;
  }>;
};

type ArtifactVersionPanelProps = {
  activeVersion?: number;
  versions?: ViewerArtifactVersion[];
};

export function ArtifactVersionPanel({ activeVersion = 1, versions = [] }: ArtifactVersionPanelProps) {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-sm uppercase text-ink-secondary">Version history</h2>
          <Badge tone="accent">Active v{activeVersion}</Badge>
        </div>
      </CardHeader>
      <CardBody className="grid gap-3">
        {sortedVersions.length > 0 ? (
          sortedVersions.map((version) => (
            <div
              key={version.version}
              className={
                version.version === activeVersion
                  ? "border border-accent-green/60 bg-accent-soft p-3"
                  : "border border-line bg-surface-base p-3"
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs uppercase text-ink-primary">Version {version.version}</p>
                <Badge tone={version.version === activeVersion ? "accent" : "muted"}>
                  {version.version === activeVersion ? "Active" : "Archived"}
                </Badge>
              </div>
              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <VersionMeta label="Provider" value={version.provider} />
                <VersionMeta label="Mode" value={version.mode} />
                <VersionMeta label="Model" value={version.model} />
                <VersionMeta label="Created" value={formatVersionDate(version.createdAt)} />
                <VersionMeta label="Fallback" value={version.fallbackUsed ? "yes" : "no"} />
                {version.fallbackUsed ? (
                  <VersionMeta label="Attempted" value={version.attemptedProviders.join(" -> ")} />
                ) : null}
              </dl>
              {version.feedback ? (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="font-mono text-[11px] uppercase text-ink-muted">Feedback</p>
                  <p className="mt-1 text-sm leading-6 text-ink-secondary">{version.feedback}</p>
                </div>
              ) : null}
              {version.providerDiagnostics && version.providerDiagnostics.length > 0 ? (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="font-mono text-[11px] uppercase text-status-warning">Warnings</p>
                  <div className="mt-2 grid gap-2">
                    {version.providerDiagnostics.map((diagnostic, diagnosticIndex) => (
                      <details key={`version-diagnostic-${version.version}-${diagnosticIndex}`} className="border border-line bg-surface-base p-3">
                        <summary className="cursor-pointer font-mono text-xs uppercase text-status-warning">
                          {diagnostic.summary}
                        </summary>
                        <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-xs leading-5 text-ink-muted">
                          {diagnostic.detail}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              ) : version.providerWarnings.length > 0 ? (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="font-mono text-[11px] uppercase text-status-warning">Warnings</p>
                  <ul className="mt-1 grid gap-1 text-sm leading-6 text-ink-muted">
                    {version.providerWarnings.map((warning, warningIndex) => (
                      <li key={`version-warning-${version.version}-${warningIndex}`} className="break-words">- {warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-muted">No version history is available for this artifact.</p>
        )}
      </CardBody>
    </Card>
  );
}

function VersionMeta({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[11px] uppercase text-ink-muted">{label}</dt>
      <dd className="mt-1 truncate font-mono text-xs text-ink-secondary">{value}</dd>
    </div>
  );
}

function formatVersionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
