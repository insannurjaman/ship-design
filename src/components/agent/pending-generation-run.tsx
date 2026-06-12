"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StatePanel } from "@/components/layout/state-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";
import { artifactIdByOutputLabel, supportedV1Outputs } from "@/lib/output-scope";
import { getPlatformLabel, isGenerationPlatform, type GenerationPlatform } from "@/lib/platforms";

type PendingGenerationPayload = {
  productName: string;
  productType: string;
  targetUsers: string;
  mainProblem: string;
  productGoal: string;
  platform: GenerationPlatform;
  outputTypes: string[];
  preferredStyle?: string;
};

type GenerationRunResponse = {
  id: string;
  provider: string;
  model: string;
  mode: "mock" | "real";
  fallbackUsed?: boolean;
  finalProvider?: string;
  providerWarnings?: string[];
  warnings?: string[];
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

const pendingGenerationStorageKey = "ship-design:pending-generation-run";

const statusMessages = [
  "Reading your product idea...",
  "Creating product strategy...",
  "Mapping core user flows...",
  "Preparing screen inventory...",
  "Drafting design system foundations...",
  "Preparing Figma-ready screens...",
  "Writing landing page sections...",
  "Building handoff package..."
];

const agentNames: Record<string, string> = {
  "Product Brief": "Product Strategy Agent",
  "UX Docs": "UX Research Agent",
  "User Flows": "UX Flow Agent",
  "Screen List": "Screen Inventory Agent",
  "Design System Kit": "Design System Agent",
  "UI Screens": "Figma Builder Agent",
  "Landing Page Copy": "Landing Page Agent",
  "Handoff Docs": "QA Handoff Agent"
};

export function PendingGenerationRun() {
  const router = useRouter();
  const hasStarted = useRef(false);
  const [payload, setPayload] = useState<PendingGenerationPayload | null>(null);
  const [progress, setProgress] = useState(4);
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState<"loading" | "running" | "complete" | "missing" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationRunResponse | null>(null);
  const selectedOutputs = payload?.outputTypes?.length ? payload.outputTypes : [...supportedV1Outputs];
  const activeIndex = Math.min(
    Math.max(0, selectedOutputs.length - 1),
    Math.floor((progress / 100) * selectedOutputs.length)
  );
  const currentOutput = selectedOutputs[activeIndex] ?? selectedOutputs[0] ?? "Product Brief";
  const generatedCount = Math.min(selectedOutputs.length, Math.floor((progress / 100) * selectedOutputs.length));
  const finalProvider = result?.finalProvider ?? result?.provider;
  const fallbackUsed = Boolean(result?.fallbackUsed);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(pendingGenerationStorageKey);
    const parsed = parsePendingPayload(stored);

    if (!parsed) {
      setPhase("missing");
      return;
    }

    setPayload(parsed);
  }, []);

  useEffect(() => {
    if (!payload || hasStarted.current) return;

    hasStarted.current = true;
    setPhase("running");

    void createRun(payload);
  }, [payload]);

  useEffect(() => {
    if (phase !== "running") return;

    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(94, current + (current < 40 ? 4 : current < 74 ? 3 : 1)));
    }, 420);
    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % statusMessages.length);
    }, 1400);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
    };
  }, [phase]);

  const timeline = useMemo(() => selectedOutputs.map((output, index) => {
    let state: "Complete" | "Running" | "Queued" | "Finalizing" = "Queued";

    if (phase === "complete") state = "Complete";
    else if (index < activeIndex) state = "Complete";
    else if (index === activeIndex) state = progress > 88 ? "Finalizing" : "Running";

    return {
      output,
      agent: agentNames[output] ?? "Ship Design Agent",
      state
    };
  }), [activeIndex, phase, progress, selectedOutputs]);

  async function createRun(input: PendingGenerationPayload) {
    try {
      const response = await fetch("/api/generation-runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const responsePayload = (await response.json().catch(() => null)) as GenerationRunResponse | GenerationRunErrorResponse | null;

      if (!response.ok || !responsePayload || !("id" in responsePayload)) {
        setErrorMessage(createErrorMessage(responsePayload));
        setPhase("error");
        return;
      }

      window.sessionStorage.removeItem(pendingGenerationStorageKey);
      setResult(responsePayload);
      setProgress(100);
      setPhase("complete");
      window.setTimeout(() => {
        router.replace(`/projects/generated?generationRunId=${encodeURIComponent(responsePayload.id)}`);
      }, 850);
    } catch {
      setErrorMessage("Ship Design could not create this generation run. Check your connection and try again.");
      setPhase("error");
    }
  }

  if (phase === "missing") {
    return (
      <StatePanel
        tone="warning"
        label="Pending run missing"
        title="No pending generation run found"
        description="The pending intake may have expired after a refresh. Start a new package or open the mock demo."
        action={
          <div className="flex flex-wrap gap-3">
            <Button href="/projects/new" variant="primary">Back to New Project</Button>
            <Button href="/projects/project-forge?run=mock" variant="secondary">Open mock demo</Button>
          </div>
        }
      />
    );
  }

  if (phase === "error") {
    return (
      <StatePanel
        tone="danger"
        label="Generation stopped"
        title="Ship Design could not start this run"
        description={errorMessage ?? "Try again from New Project."}
        action={
          <div className="flex flex-wrap gap-3">
            <Button href="/projects/new" variant="primary">Back to New Project</Button>
            <Button href="/projects/project-forge?run=mock" variant="secondary">Open mock demo</Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <main className="grid gap-6">
        <Card>
          <CardBody className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-center" aria-live="polite">
            <div className="border border-line bg-surface-base p-5">
              <p className="font-mono text-xs uppercase text-ink-muted">Overall progress</p>
              <p className="mt-3 font-mono text-5xl text-accent-green">{progress}%</p>
              <Progress value={progress} label="Generation progress" className="mt-5" />
            </div>
            <div>
              <Badge tone={phase === "complete" ? "success" : "accent"}>
                {phase === "complete" ? "Generation complete" : "Generating package"}
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold">
                {phase === "complete" ? "Finalizing your package" : statusMessages[messageIndex]}
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                {phase === "complete"
                  ? "The run is complete. Opening the generated project..."
                  : `${agentNames[currentOutput] ?? "Ship Design Agent"} is creating ${currentOutput}.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusPill tone={phase === "complete" ? "complete" : "running"} pulse={phase !== "complete"}>
                  {phase === "complete" ? "Complete" : "Running"}
                </StatusPill>
                <StatusPill tone="info">{payload ? getPlatformLabel(payload.platform) : "Loading intake"}</StatusPill>
                <StatusPill tone="info">{selectedOutputs.length} selected artifacts</StatusPill>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-mono text-sm uppercase text-ink-secondary">Agent timeline</h2>
          </CardHeader>
          <CardBody className="grid gap-3">
            {timeline.map((item, index) => (
              <div key={item.output} className="grid gap-3 border border-line bg-surface-base p-4 sm:grid-cols-[40px_1fr_auto] sm:items-start">
                <div className="flex size-10 items-center justify-center border border-line bg-surface-panel font-mono text-xs text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-medium text-ink-primary">{item.agent}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{item.output}</p>
                </div>
                <StatusPill
                  tone={item.state === "Complete" ? "complete" : item.state === "Queued" ? "queued" : "running"}
                  pulse={item.state === "Running" || item.state === "Finalizing"}
                >
                  {item.state}
                </StatusPill>
              </div>
            ))}
          </CardBody>
        </Card>
      </main>

      <aside className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <h2 className="font-mono text-sm uppercase text-ink-secondary">Run status</h2>
          </CardHeader>
          <CardBody className="grid gap-3">
            <StatusLine label="Current artifact" value={currentOutput} />
            <StatusLine label="Current agent" value={agentNames[currentOutput] ?? "Ship Design Agent"} />
            <StatusLine label="Completed" value={`${phase === "complete" ? selectedOutputs.length : generatedCount} of ${selectedOutputs.length}`} />
            <StatusLine label="Queued" value={`${phase === "complete" ? 0 : Math.max(0, selectedOutputs.length - generatedCount - 1)}`} />
            <StatusLine label="Provider" value={finalProvider ?? "Configured after generation"} />
            <StatusLine label="Fallback" value={result ? (fallbackUsed ? "yes" : "no") : "Checking"} />
          </CardBody>
        </Card>

        {result?.fallbackUsed ? (
          <Card className="border-status-warning/60">
            <CardBody>
              <Badge tone="warning">Provider fallback</Badge>
              <h2 className="mt-4 text-lg font-semibold">Ship Design switched providers automatically to complete your package.</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">
                Final provider: {finalProvider}. Your artifacts were still generated successfully.
              </p>
              <details className="mt-4 border border-line bg-surface-base p-3">
                <summary className="cursor-pointer font-mono text-xs uppercase text-status-warning">Technical details</summary>
                <ProviderDetails result={result} />
              </details>
            </CardBody>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-surface-base p-3">
      <p className="font-mono text-[11px] uppercase text-ink-muted">{label}</p>
      <p className="mt-2 text-sm text-ink-secondary">{value}</p>
    </div>
  );
}

function ProviderDetails({ result }: { result: GenerationRunResponse }) {
  const diagnostics = result.providerDiagnostics ?? [];
  const warnings = result.providerWarnings ?? result.warnings ?? [];

  if (diagnostics.length > 0) {
    return (
      <div className="mt-3 grid gap-2">
        {diagnostics.map((diagnostic, index) => (
          <div key={`pending-diagnostic-${index}`} className="text-xs leading-5 text-ink-muted">
            <p className="font-mono uppercase text-status-warning">{diagnostic.summary}</p>
            <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap break-words">{diagnostic.detail}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="mt-3 grid gap-1 text-xs leading-5 text-ink-muted">
      {warnings.map((warning, index) => (
        <li key={`pending-warning-${index}`}>- {warning}</li>
      ))}
    </ul>
  );
}

function parsePendingPayload(value: string | null): PendingGenerationPayload | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<PendingGenerationPayload>;

    if (
      typeof parsed.productName !== "string" ||
      typeof parsed.productType !== "string" ||
      typeof parsed.targetUsers !== "string" ||
      typeof parsed.mainProblem !== "string" ||
      typeof parsed.productGoal !== "string" ||
      !isGenerationPlatform(parsed.platform)
    ) {
      return null;
    }

    return {
      productName: parsed.productName,
      productType: parsed.productType,
      targetUsers: parsed.targetUsers,
      mainProblem: parsed.mainProblem,
      productGoal: parsed.productGoal,
      platform: parsed.platform,
      outputTypes: normalizeOutputTypes(parsed.outputTypes),
      preferredStyle: typeof parsed.preferredStyle === "string" ? parsed.preferredStyle : undefined
    };
  } catch {
    return null;
  }
}

function normalizeOutputTypes(value: unknown) {
  if (!Array.isArray(value)) return [...supportedV1Outputs];

  const allowed = new Set<string>([
    ...supportedV1Outputs,
    ...Object.keys(artifactIdByOutputLabel)
  ]);
  const selected = value.filter((item): item is string => typeof item === "string" && allowed.has(item));

  return selected.length > 0 ? selected : [...supportedV1Outputs];
}

function createErrorMessage(payload: GenerationRunResponse | GenerationRunErrorResponse | null) {
  if (!payload || !("error" in payload)) {
    return "Ship Design could not create this generation run. Please try again.";
  }

  const fieldMessages = payload.fieldErrors
    ? Object.entries(payload.fieldErrors).map(([field, message]) => `${field}: ${message}`)
    : [];

  return [payload.error ?? "Ship Design could not create this generation run.", ...fieldMessages].join(" ");
}
