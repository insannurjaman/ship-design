"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckboxRow } from "@/components/project/checkbox-row";
import { SegmentedControl } from "@/components/project/segmented-control";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  outputScopeHelperText,
  requiredOutputLabels,
  supportedV1Outputs
} from "@/lib/output-scope";
import { platformLabels, type GenerationPlatform } from "@/lib/platforms";

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

type SubmitPhase = "idle" | "preparing" | "generating";

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

const statusMessages = [
  "Reading product idea",
  "Creating product strategy",
  "Mapping user needs",
  "Building core user flows",
  "Preparing screen inventory",
  "Drafting design system structure",
  "Creating Figma-ready output",
  "Preparing handoff package"
];

const outputAgentLabels: Record<string, string> = {
  "Product Brief": "Product Strategy Agent",
  "UX Docs": "UX Research Agent",
  "User Flows": "UX Flow Agent",
  "Screen List": "Screen Inventory Agent",
  "Design System Kit": "Design System Agent",
  "UI Screens": "Figma Builder Agent",
  "Landing Page Copy": "Landing Page Agent",
  "Handoff Docs": "QA Handoff Agent"
};

export function NewProjectForm({
  selectedOutputs,
  platform,
  onPlatformChange,
  onToggleOutput,
  onSelectLitePackage,
  onSelectFullPackage
}: NewProjectFormProps) {
  const router = useRouter();
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);
  const [formValues, setFormValues] = useState<NewProjectFormValues>(emptyFormValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const requiredOutputs = new Set<string>(requiredOutputLabels);
  const isGenerating = submitPhase !== "idle";
  const activeTimelineIndex = Math.min(
    selectedOutputs.length - 1,
    Math.floor((simulatedProgress / 100) * selectedOutputs.length)
  );
  const activeAgentLabel = outputAgentLabels[selectedOutputs[activeTimelineIndex]] ?? "Ship Design Agent";
  const readinessItems = [
    { label: "Product name", ready: Boolean(formValues.productName.trim()) },
    { label: "Product type", ready: Boolean(formValues.productType.trim()) },
    { label: "Target users", ready: Boolean(formValues.targetUsers.trim()) },
    { label: "Main problem", ready: Boolean(formValues.mainProblem.trim()) },
    { label: "Product goal", ready: Boolean(formValues.productGoal.trim()) },
    { label: "Platform", ready: Boolean(platform) }
  ];
  const isReadyToGenerate = readinessItems.every((item) => item.ready);

  useEffect(() => {
    if (!isGenerating) {
      setSimulatedProgress(0);
      setStatusMessageIndex(0);
      return;
    }

    const progressTimer = window.setInterval(() => {
      setSimulatedProgress((current) => Math.min(92, current + (submitPhase === "preparing" ? 3 : 5)));
    }, 320);
    const messageTimer = window.setInterval(() => {
      setStatusMessageIndex((current) => (current + 1) % statusMessages.length);
    }, 1300);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
    };
  }, [isGenerating, submitPhase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitPhase("preparing");
    setErrorMessage(null);
    setPlatformError(null);
    setWarningMessage(null);

    if (!platform) {
      setPlatformError("Choose where this product will be designed first.");
      setSubmitPhase("idle");
      return;
    }

    const phaseTimer = window.setTimeout(() => setSubmitPhase("generating"), 450);

    try {
      const [response] = await Promise.all([
        fetch("/api/generation-runs", {
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
        }),
        wait(1000)
      ]);

      const payload = (await response.json().catch(() => null)) as
        | GenerationRunResponse
        | GenerationRunErrorResponse
        | null;

      if (!response.ok) {
        setErrorMessage(createErrorMessage(payload));
        setSubmitPhase("idle");
        return;
      }

      if (!payload || !("id" in payload)) {
        setErrorMessage("Ship Design received an invalid generation response. Please try again.");
        setSubmitPhase("idle");
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
      setSubmitPhase("idle");
    } finally {
      window.clearTimeout(phaseTimer);
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

            {isGenerating ? (
              <GenerationProgressPanel
                progress={simulatedProgress}
                selectedOutputs={selectedOutputs}
                activeIndex={activeTimelineIndex}
                activeAgentLabel={activeAgentLabel}
                statusMessage={statusMessages[statusMessageIndex]}
                phase={submitPhase}
              />
            ) : null}
          </StepSection>

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
                Ship Design will create your selected design artifacts.
              </p>
              <Button type="submit" variant="primary" size="lg" loading={isGenerating}>
                {submitPhase === "preparing" ? "Preparing run" : submitPhase === "generating" ? "Generating package" : "Generate design package"}
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

function GenerationProgressPanel({
  progress,
  selectedOutputs,
  activeIndex,
  activeAgentLabel,
  statusMessage,
  phase
}: {
  progress: number;
  selectedOutputs: string[];
  activeIndex: number;
  activeAgentLabel: string;
  statusMessage: string;
  phase: SubmitPhase;
}) {
  return (
    <div className="grid gap-4 border border-accent-green/60 bg-accent-soft p-4" aria-live="polite">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone="accent">{phase === "preparing" ? "Preparing run" : "Generating package"}</Badge>
          <h3 className="mt-3 text-lg font-semibold text-ink-primary">{statusMessage}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            {activeAgentLabel} is working through {selectedOutputs.length} selected artifacts.
          </p>
        </div>
        <StatusPill tone="running" pulse>
          {phase === "preparing" ? "Queued" : "Running"}
        </StatusPill>
      </div>

      <Progress value={progress} label="Generation progress" />

      <div className="grid gap-2 md:grid-cols-2">
        {selectedOutputs.map((output, index) => {
          const state = getPendingTimelineState(index, activeIndex, phase, progress);

          return (
            <div key={output} className="grid gap-2 border border-line bg-surface-base p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase text-accent-green">{outputAgentLabels[output] ?? "Ship Design Agent"}</p>
                  <p className="mt-1 text-sm text-ink-secondary">{output}</p>
                </div>
                <StatusPill tone={state === "Running" || state === "Finalizing" ? "running" : state === "Waiting" ? "info" : "queued"} pulse={state === "Running" || state === "Finalizing"}>
                  {state}
                </StatusPill>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getPendingTimelineState(index: number, activeIndex: number, phase: SubmitPhase, progress: number) {
  if (phase === "preparing") return index === 0 ? "Queued" : "Waiting";
  if (progress >= 86 && index === activeIndex) return "Finalizing";
  if (index < activeIndex) return "Waiting";
  if (index === activeIndex) return "Running";

  return "Queued";
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
