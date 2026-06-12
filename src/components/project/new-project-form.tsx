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
import { platformLabels, type GenerationPlatform } from "@/lib/platforms";

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
  platform: GenerationPlatform | "";
  onPlatformChange: (platform: GenerationPlatform | "") => void;
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

const pendingGenerationStorageKey = "ship-design:pending-generation-run";

export function NewProjectForm({
  selectedOutputs,
  platform,
  onPlatformChange,
  onToggleOutput,
  onSelectLitePackage,
  onSelectFullPackage
}: NewProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<NewProjectFormValues>(emptyFormValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const requiredOutputs = new Set<string>(requiredOutputLabels);
  const isGenerating = isSubmitting;
  const readinessItems = [
    { label: "Product name", ready: Boolean(formValues.productName.trim()) },
    { label: "Product type", ready: Boolean(formValues.productType.trim()) },
    { label: "Target users", ready: Boolean(formValues.targetUsers.trim()) },
    { label: "Main problem", ready: Boolean(formValues.mainProblem.trim()) },
    { label: "Product goal", ready: Boolean(formValues.productGoal.trim()) },
    { label: "Platform", ready: Boolean(platform) }
  ];
  const isReadyToGenerate = readinessItems.every((item) => item.ready);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setPlatformError(null);

    if (!platform) {
      setPlatformError("Choose where this product will be designed first.");
      setIsSubmitting(false);
      return;
    }

    const fieldErrors = validateRequiredFormValues(formValues);

    if (Object.keys(fieldErrors).length > 0) {
      setErrorMessage(createErrorMessage({
        error: "Add the missing intake details before generating.",
        fieldErrors
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      window.sessionStorage.setItem(
        pendingGenerationStorageKey,
        JSON.stringify({
          productName: formValues.productName.trim(),
          productType: formValues.productType.trim(),
          targetUsers: formValues.targetUsers.trim(),
          mainProblem: formValues.mainProblem.trim(),
          productGoal: formValues.productGoal.trim(),
          platform,
          outputTypes: selectedOutputs,
          preferredStyle: formValues.preferredStyle.trim()
        })
      );
      router.push("/projects/generated?pending=1");
    } catch {
      setErrorMessage("Could not prepare the generation run in this browser. Check the intake and try again.");
      setIsSubmitting(false);
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
            <StatusPill tone={isGenerating ? "running" : "info"} pulse={isGenerating}>
              {isGenerating ? "Preparing run" : "Ready"}
            </StatusPill>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <StepSection
            step="01"
            title="Describe product"
            description="Start with the clearest version of the product idea. Short, practical notes work well."
            action={
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setFormValues(sampleFormValues);
                  onPlatformChange("mobile");
                  setPlatformError(null);
                }}
                disabled={isGenerating}
              >
                Use sample idea
              </Button>
            }
          >
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
                helperText="What kind of product should Ship Design shape?"
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
              options={[
                { label: platformLabels.mobile, value: "mobile" },
                { label: platformLabels.desktop, value: "desktop" }
              ]}
              value={platform}
              onChange={(value) => {
                onPlatformChange(value as GenerationPlatform);
                setPlatformError(null);
              }}
              disabled={isGenerating}
            />
            {platformError ? (
              <div className="border border-status-warning/70 bg-status-warning/10 p-4" aria-live="polite">
                <Badge tone="warning">Platform required</Badge>
                <p className="mt-3 text-sm leading-6 text-ink-secondary">{platformError}</p>
              </div>
            ) : null}

            <Textarea
              label="Preferred design style"
              name="preferred-style"
              value={formValues.preferredStyle}
              onChange={(event) => updateValue("preferredStyle", event.target.value)}
              placeholder="Example: Dark technical interface, acid green accent, crisp 1px borders..."
              disabled={isGenerating}
            />
          </StepSection>

          <StepSection
            step="02"
            title="Choose package"
            description="Start Lite for quicker drafts on free providers, or generate the full design package when you have enough quota."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <PackageOption
                title="Lite package"
                description="Best for free providers and quick first drafts."
                selected={selectedOutputs.length < supportedV1Outputs.length}
                onClick={onSelectLitePackage}
                disabled={isGenerating}
              />
              <PackageOption
                title="Full package"
                description="Best for complete design preparation, but uses more AI calls."
                selected={selectedOutputs.length === supportedV1Outputs.length}
                onClick={onSelectFullPackage}
                disabled={isGenerating}
              />
            </div>

            <div className="grid gap-3">
              <div>
                <p className="font-mono text-xs font-medium uppercase text-ink-muted">Artifact selection</p>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">{outputScopeHelperText}</p>
                <p className="mt-2 font-mono text-xs uppercase text-accent-green">
                  {selectedOutputs.length} of {supportedV1Outputs.length} artifacts selected · {selectedOutputs.length} estimated AI calls
                </p>
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
          </StepSection>

          <StepSection
            step="03"
            title="Review and generate"
            description="Ship Design will run one agent per selected artifact."
            action={
              <StatusPill tone={isReadyToGenerate ? "complete" : "queued"}>
                {isReadyToGenerate ? "Ready to generate" : "Needs input"}
              </StatusPill>
            }
          >
            <ReadinessChecklist items={readinessItems} />

            <div className="border border-line bg-surface-base p-4">
              <p className="font-mono text-xs uppercase text-ink-muted">Generation summary</p>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                Ship Design will create your selected design artifacts for {platform ? platformLabels[platform] : "the selected platform"}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="accent">{selectedOutputs.length} artifacts</Badge>
                <Badge tone={platform ? "success" : "muted"}>{platform ? platformLabels[platform] : "Platform not selected"}</Badge>
                <Badge tone="info">{selectedOutputs.length} AI calls</Badge>
              </div>
            </div>

          </StepSection>

          {errorMessage ? (
            <div className="border border-status-danger/70 bg-status-danger/10 p-4" aria-live="assertive">
              <Badge tone="danger">Generation failed</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">{errorMessage}</p>
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 border-t border-line bg-surface-panel/95 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs uppercase text-ink-muted">
                Ship Design will create your selected design artifacts.
              </p>
              <Button type="submit" variant="primary" size="lg" loading={isGenerating}>
                {isGenerating ? "Opening progress" : "Generate design package"}
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function StepSection({
  step,
  title,
  description,
  action,
  children
}: {
  step: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border border-line bg-surface-base p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase text-accent-green">Step {step}</p>
          <h3 className="mt-2 text-lg font-semibold text-ink-primary">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function PackageOption({
  title,
  description,
  selected,
  onClick,
  disabled
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={
        selected
          ? "min-h-28 border border-accent-green bg-accent-soft p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          : "min-h-28 border border-line bg-surface-base p-4 text-left transition-colors hover:border-line-strong hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase text-accent-green">{title}</p>
        <Badge tone={selected ? "accent" : "muted"}>{selected ? "Selected" : "Choose"}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-secondary">{description}</p>
    </button>
  );
}

function ReadinessChecklist({ items }: { items: Array<{ label: string; ready: boolean }> }) {
  return (
    <div className="grid gap-2 border border-line bg-surface-base p-4">
      <p className="font-mono text-xs uppercase text-ink-muted">Readiness checklist</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 border border-line bg-surface-panel px-3 py-2">
            <span className="text-sm text-ink-secondary">{item.label}</span>
            <StatusPill tone={item.ready ? "complete" : "queued"}>{item.ready ? "Ready" : "Missing"}</StatusPill>
          </div>
        ))}
      </div>
    </div>
  );
}

function validateRequiredFormValues(values: NewProjectFormValues) {
  const fieldErrors: Record<string, string> = {};

  if (!values.productName.trim()) fieldErrors.productName = "Product name is required.";
  if (!values.productType.trim()) fieldErrors.productType = "Product type is required.";
  if (!values.targetUsers.trim()) fieldErrors.targetUsers = "Target users are required.";
  if (!values.mainProblem.trim()) fieldErrors.mainProblem = "Main problem is required.";
  if (!values.productGoal.trim()) fieldErrors.productGoal = "Product goal is required.";

  return fieldErrors;
}

function createErrorMessage(payload: GenerationRunErrorResponse | null) {
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
