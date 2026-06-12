"use client";

import { useMemo, useState } from "react";
import { NewProjectForm } from "@/components/project/new-project-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  litePackageOutputs,
  outputScopeHelperText,
  requiredOutputLabels,
  supportedV1Outputs
} from "@/lib/output-scope";
import { getPlatformLabel, type GenerationPlatform } from "@/lib/platforms";

const outputTypes: Record<string, string> = {
  "Product Brief": "Strategy",
  "UX Docs": "Research",
  "User Flows": "UX",
  "Screen List": "Inventory",
  "Design System Kit": "Design",
  "UI Screens": "Screens",
  "Landing Page Copy": "Marketing",
  "Handoff Docs": "Engineering"
};

export function NewProjectIntake() {
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([...litePackageOutputs]);
  const [platform, setPlatform] = useState<GenerationPlatform | "">("");
  const requiredOutputs = useMemo(() => new Set<string>(requiredOutputLabels), []);
  const selectedSet = useMemo(() => new Set(selectedOutputs), [selectedOutputs]);
  const selectedArtifacts = supportedV1Outputs.filter((output) => selectedSet.has(output));
  const unselectedOptionalArtifacts = supportedV1Outputs.filter(
    (output) => !selectedSet.has(output) && !requiredOutputs.has(output)
  );

  function toggleOutput(output: string, checked: boolean) {
    if (requiredOutputs.has(output)) return;

    setSelectedOutputs((current) =>
      checked
        ? Array.from(new Set([...current, output]))
        : current.filter((item) => item !== output)
    );
  }

  function applyLitePreset() {
    setSelectedOutputs([...litePackageOutputs]);
  }

  function applyFullPreset() {
    setSelectedOutputs([...supportedV1Outputs]);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <NewProjectForm
        selectedOutputs={selectedOutputs}
        platform={platform}
        onPlatformChange={setPlatform}
        onToggleOutput={toggleOutput}
        onSelectLitePackage={applyLitePreset}
        onSelectFullPackage={applyFullPreset}
      />

      <aside className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <h2 className="font-mono text-sm uppercase text-ink-secondary">Package preview</h2>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{outputScopeHelperText}</p>
          </CardHeader>
          <CardBody className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <PreviewMetric label="Package size" value={`${selectedOutputs.length} / ${supportedV1Outputs.length}`} />
              <PreviewMetric label="AI calls" value={`${selectedOutputs.length}`} />
            </div>

            <div className="border border-line bg-surface-base p-3">
              <p className="font-mono text-[11px] uppercase text-ink-muted">Selected platform</p>
              <p className={platform ? "mt-2 font-mono text-sm uppercase text-accent-green" : "mt-2 text-sm text-ink-muted"}>
                {getPlatformLabel(platform)}
              </p>
            </div>

            <div className="border border-accent-green/60 bg-accent-soft p-3">
              <Badge tone="accent">Lite recommended</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                Lite package is best for free providers and quick first drafts. Full package uses more AI calls and may trigger free provider limits.
              </p>
            </div>

            <div className="grid gap-3">
              <p className="font-mono text-xs uppercase text-accent-green">Selected artifacts</p>
              {selectedArtifacts.map((output) => (
                <ArtifactPreviewRow key={output} output={output} tone="success" label="Selected" />
              ))}
            </div>

            {unselectedOptionalArtifacts.length > 0 ? (
              <div className="grid gap-3">
                <p className="font-mono text-xs uppercase text-ink-muted">Not selected</p>
                {unselectedOptionalArtifacts.map((output) => (
                  <ArtifactPreviewRow key={output} output={output} tone="muted" label="Not selected" />
                ))}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-surface-base p-3">
      <p className="font-mono text-[11px] uppercase text-ink-muted">{label}</p>
      <p className="mt-2 font-mono text-lg text-accent-green">{value}</p>
    </div>
  );
}

function ArtifactPreviewRow({
  output,
  tone,
  label
}: {
  output: string;
  tone: "success" | "muted";
  label: string;
}) {
  return (
    <div className="border border-line bg-surface-base p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase text-accent-green">
          {outputTypes[output] ?? "Output"}
        </span>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <p className="mt-2 text-sm text-ink-secondary">{output}</p>
    </div>
  );
}
