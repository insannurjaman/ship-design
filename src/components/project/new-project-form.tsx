"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckboxRow } from "@/components/project/checkbox-row";
import { SegmentedControl } from "@/components/project/segmented-control";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import {
  outputScopeHelperText,
  requiredOutputLabels,
  supportedV1Outputs
} from "@/lib/output-scope";

type GenerationRunResponse = {
  id: string;
  status: "complete" | "error";
  mode: "mock" | "real";
  provider: string;
  warnings: string[];
  fallbackUsed?: boolean;
  providerWarnings?: string[];
  providerDiagnostics?: Array<{
    provider: string;
    summary: string;
    detail: string;
    status?: number;
  }>;
};

type GenerationRunErrorResponse = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type NewProjectFormValues = {
  productName: string;
  productType: string;
  targetUsers: string;
  mainProblem: string;
  productGoal: string;
  preferredStyle: string;
};

type NewProjectFormProps = {
  selectedOutputs: string[];
  onToggleOutput: (output: string, checked: boolean) => void;
  onSelectLitePackage: () => void;
  onSelectFullPackage: () => void;
};

const emptyFormValues: NewProjectFormValues = {
  productName: "",
  productType: "",
  targetUsers: "",
  mainProblem: "",
  productGoal: "",
  preferredStyle: ""
};

const sampleFormValues: NewProjectFormValues = {
  productName: "Forge Brief",
  productType: "Agency workflow tool",
  targetUsers:
    "Product strategists, agency founders, and delivery leads who need to turn messy client ideas into consistent MVP design packages.",
  mainProblem:
    "Discovery outputs are inconsistent, hard to review, and usually need manual restructuring before design or engineering can use them.",
  productGoal:
    "Generate a practical product strategy, UX plan, Figma-ready structure, landing page copy, and developer handoff from one intake.",
  preferredStyle:
    "Dark technical interface, acid green accent, crisp 1px borders, minimal radius, mono labels, and a premium developer-tool SaaS feel."
};

export function NewProjectForm({
  selectedOutputs,
  onToggleOutput,
  onSelectLitePackage,
  onSelectFullPackage
}: NewProjectFormProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState("Both");
  const [formValues, setFormValues] = useState<NewProjectFormValues>(emptyFormValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const requiredOutputs = new Set<string>(requiredOutputLabels);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);
    setWarningMessage(null);

    try {
      const response = await fetch("/api/generation-runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productName: formValues.productName.trim(),
          productType: formValues.productType.trim(),
          targetUsers: formValues.targetUsers.trim(),
          mainProblem: formValues.mainProblem.trim(),
          productGoal: formValues.productGoal.trim(),
          platform,
          outputTypes: selectedOutputs,
          preferredStyle: formValues.preferredStyle.trim()
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | GenerationRunResponse
        | GenerationRunErrorResponse
        | null;

      if (!response.ok) {
        setErrorMessage(createErrorMessage(payload));
        setIsGenerating(false);
        return;
      }

      if (!payload || !("id" in payload)) {
        setErrorMessage("Ship Design received an invalid generation response. Please try again.");
        setIsGenerating(false);
        return;
      }

      const warning = payload.providerDiagnostics?.[0]?.summary ?? payload.providerWarnings?.[0] ?? payload.warnings?.[0];

      if (warning) {
        setWarningMessage(warning);
        window.setTimeout(() => {
          router.push(`/projects/generated?generationRunId=${encodeURIComponent(payload.id)}`);
        }, 900);
        return;
      }

      router.push(`/projects/generated?generationRunId=${encodeURIComponent(payload.id)}`);
    } catch {
      setErrorMessage("Could not create the generation run. Check the intake and try again.");
      setIsGenerating(false);
    }
  }

  function toggleOutput(output: string, checked: boolean) {
    if (requiredOutputs.has(output)) return;

    onToggleOutput(output, checked);
  }

  function updateValue(field: keyof NewProjectFormValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-ink-muted">Idea intake</p>
            <h2 className="mt-2 text-xl font-semibold">Product source material</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setFormValues(sampleFormValues)} disabled={isGenerating}>
              Use sample idea
            </Button>
            <StatusPill tone={isGenerating ? "running" : "info"} pulse={isGenerating}>
              {isGenerating ? "Preparing run" : "Ready"}
            </StatusPill>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Product name"
              name="product-name"
              value={formValues.productName}
              onChange={(event) => updateValue("productName", event.target.value)}
              placeholder="Example: Forge Brief"
              helperText="Use the working name your team already knows."
              disabled={isGenerating}
            />
            <Input
              label="Product type"
              name="product-type"
              value={formValues.productType}
              onChange={(event) => updateValue("productType", event.target.value)}
              placeholder="Example: mobile app, marketplace, internal tool"
              helperText="Example: marketplace, mobile app, internal tool."
              disabled={isGenerating}
            />
          </div>

          <Textarea
            label="Target users"
            name="target-users"
            value={formValues.targetUsers}
            onChange={(event) => updateValue("targetUsers", event.target.value)}
            placeholder="Example: Product strategists, agency founders, and delivery leads..."
            disabled={isGenerating}
          />
          <Textarea
            label="Main problem"
            name="main-problem"
            value={formValues.mainProblem}
            onChange={(event) => updateValue("mainProblem", event.target.value)}
            placeholder="Example: Discovery outputs are inconsistent and hard to review..."
            disabled={isGenerating}
          />
          <Textarea
            label="Product goal"
            name="product-goal"
            value={formValues.productGoal}
            onChange={(event) => updateValue("productGoal", event.target.value)}
            placeholder="Example: Generate a practical product strategy, UX plan, Figma-ready structure..."
            disabled={isGenerating}
          />

          <SegmentedControl
            label="Platform"
            options={["Web", "Mobile", "Both"]}
            value={platform}
            onChange={setPlatform}
            disabled={isGenerating}
          />

          <div className="grid gap-3">
            <div>
              <p className="font-mono text-xs font-medium uppercase text-ink-muted">Output types</p>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">{outputScopeHelperText}</p>
              <p className="mt-2 font-mono text-xs uppercase text-accent-green">
                {selectedOutputs.length} of {supportedV1Outputs.length} artifacts selected
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={onSelectLitePackage} disabled={isGenerating}>
                Lite package
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={onSelectFullPackage} disabled={isGenerating}>
                Full package
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {supportedV1Outputs.map((output) => (
                <CheckboxRow
                  key={output}
                  label={output}
                  checked={selectedOutputs.includes(output)}
                  onChange={(checked) => toggleOutput(output, checked)}
                  disabled={isGenerating || requiredOutputs.has(output)}
                  meta={requiredOutputs.has(output) ? <Badge tone="accent">Required</Badge> : null}
                />
              ))}
            </div>
          </div>

          <Textarea
            label="Preferred design style"
            name="preferred-style"
            value={formValues.preferredStyle}
            onChange={(event) => updateValue("preferredStyle", event.target.value)}
            placeholder="Example: Dark technical interface, acid green accent, crisp 1px borders..."
            disabled={isGenerating}
          />

          {isGenerating ? (
            <div className="border border-accent-green/60 bg-accent-soft p-4" aria-live="polite">
              <Badge tone="accent">Preparing run</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                Creating a generation run and generating {selectedOutputs.length} selected artifacts.
              </p>
            </div>
          ) : null}

          {warningMessage ? (
            <div className="border border-status-warning/70 bg-status-warning/10 p-4" aria-live="polite">
              <Badge tone="warning">Provider fallback</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">{warningMessage}</p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="border border-status-danger/70 bg-status-danger/10 p-4" aria-live="assertive">
              <Badge tone="danger">Generation failed</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">{errorMessage}</p>
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 border-t border-line bg-surface-panel/95 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs uppercase text-ink-muted">
                Submits to the generation run API
              </p>
              <Button type="submit" variant="primary" size="lg" loading={isGenerating}>
                Generate design package
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function createErrorMessage(payload: GenerationRunErrorResponse | GenerationRunResponse | null) {
  if (!payload || !("error" in payload)) {
    return "Could not create the generation run. Check the intake and try again.";
  }

  const fieldMessages = payload.fieldErrors
    ? Object.entries(payload.fieldErrors).map(([field, message]) => `${formatFieldName(field)}: ${message}`)
    : [];

  return [payload.error || "Could not create the generation run.", ...fieldMessages].join(" ");
}

function formatFieldName(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
