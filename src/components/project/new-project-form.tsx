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

export function NewProjectForm() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState("Both");
  const [selectedOutputs, setSelectedOutputs] = useState(outputOptions);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    window.setTimeout(() => router.push("/projects/project-forge?run=mock"), 650);
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
                Creating a local mock run for {platform.toLowerCase()} and staging {selectedOutputs.length} outputs.
              </p>
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 border-t border-line bg-surface-panel/95 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs uppercase text-ink-muted">
                Submits to a local mock generation run
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
