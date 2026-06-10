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

const outputOptions = [
  "Product Brief",
  "UX Docs",
  "User Flows",
  "Screen List",
  "Design System Plan",
  "Figma Plan",
  "Landing Page Copy",
  "Handoff Docs"
];

type GenerationRunResponse = {
  id: string;
  status: "complete" | "error";
  mode: "mock" | "real";
  provider: string;
  warnings: string[];
};

type GenerationRunErrorResponse = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function NewProjectForm() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState("Both");
  const [selectedOutputs, setSelectedOutputs] = useState(outputOptions);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);
    setWarningMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/generation-runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productName: readFormValue(formData, "product-name"),
          productType: readFormValue(formData, "product-type"),
          targetUsers: readFormValue(formData, "target-users"),
          mainProblem: readFormValue(formData, "main-problem"),
          productGoal: readFormValue(formData, "product-goal"),
          platform,
          outputTypes: selectedOutputs,
          preferredStyle: readFormValue(formData, "preferred-style")
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

      const warning = payload.warnings?.[0];

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
    setSelectedOutputs((current) =>
      checked ? [...current, output] : current.filter((item) => item !== output)
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-ink-muted">Idea intake</p>
            <h2 className="mt-2 text-xl font-semibold">Product source material</h2>
          </div>
          <StatusPill tone={isGenerating ? "running" : "info"} pulse={isGenerating}>
            {isGenerating ? "Preparing run" : "Draft"}
          </StatusPill>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Product name"
              name="product-name"
              defaultValue="Forge Brief"
              helperText="Use the working name your team already knows."
              disabled={isGenerating}
            />
            <Input
              label="Product type"
              name="product-type"
              defaultValue="Agency workflow tool"
              helperText="Example: marketplace, mobile app, internal tool."
              disabled={isGenerating}
            />
          </div>

          <Textarea
            label="Target users"
            name="target-users"
            defaultValue="Product strategists, agency founders, and delivery leads who need to turn messy client ideas into consistent MVP design packages."
            disabled={isGenerating}
          />
          <Textarea
            label="Main problem"
            name="main-problem"
            defaultValue="Discovery outputs are inconsistent, hard to review, and usually need manual restructuring before design or engineering can use them."
            disabled={isGenerating}
          />
          <Textarea
            label="Product goal"
            name="product-goal"
            defaultValue="Generate a practical product strategy, UX plan, Figma-ready structure, landing page copy, and developer handoff from one intake."
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
            <p className="font-mono text-xs font-medium uppercase text-ink-muted">Output types</p>
            <div className="grid gap-2 md:grid-cols-2">
              {outputOptions.map((output) => (
                <CheckboxRow
                  key={output}
                  label={output}
                  checked={selectedOutputs.includes(output)}
                  onChange={(checked) => toggleOutput(output, checked)}
                  disabled={isGenerating}
                />
              ))}
            </div>
          </div>

          <Textarea
            label="Preferred design style"
            name="preferred-style"
            defaultValue="Dark technical interface, acid green accent, crisp 1px borders, minimal radius, mono labels, and a premium developer-tool SaaS feel."
            disabled={isGenerating}
          />

          {isGenerating ? (
            <div className="border border-accent-green/60 bg-accent-soft p-4" aria-live="polite">
              <Badge tone="accent">Preparing run</Badge>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">
                Creating a generation run for {platform.toLowerCase()} and staging {selectedOutputs.length} outputs.
              </p>
            </div>
          ) : null}

          {warningMessage ? (
            <div className="border border-status-warning/70 bg-status-warning/10 p-4" aria-live="polite">
              <Badge tone="warning">Mock fallback</Badge>
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

function readFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
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
