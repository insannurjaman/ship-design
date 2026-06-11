"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivityLog } from "@/components/agent/activity-log";
import { StatePanel } from "@/components/layout/state-panel";
import { OutputArtifactCard } from "@/components/output/output-artifact-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";
import type { AiProviderId } from "@/lib/ai/types";
import type { ActivityLog as ActivityLogItem, AgentRun, OutputArtifact, Project } from "@/lib/mock-data";

type AgentWorkflowSimulationProps = {
  project: Project;
  agents: AgentRun[];
  outputs: OutputArtifact[];
  logs: ActivityLogItem[];
  shouldRun?: boolean;
  outputViewerHref?: string;
  runInfo?: {
    provider: string;
    model: string;
    mode: "mock" | "real";
    warnings?: string[];
    attemptedProviders?: AiProviderId[];
    fallbackUsed?: boolean;
    finalProvider?: AiProviderId;
    providerWarnings?: string[];
  };
};

const stepMessages = [
  "Reading product intake and extracting constraints.",
  "Building product strategy and MVP boundaries.",
  "Drafting UX research assumptions and risk questions.",
  "Mapping user flows, screen list, and recovery states.",
  "Preparing design system plan and Figma structure.",
  "Generating landing copy and developer handoff notes.",
  "Finalizing the review package."
];

export function AgentWorkflowSimulation({
  project,
  agents,
  outputs,
  logs,
  shouldRun = false,
  outputViewerHref,
  runInfo
}: AgentWorkflowSimulationProps) {
  const [progress, setProgress] = useState(shouldRun ? 0 : 100);

  useEffect(() => {
    if (!shouldRun) return;

    setProgress(0);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          return 100;
        }

        return Math.min(100, current + 2);
      });
    }, 180);

    return () => window.clearInterval(timer);
  }, [shouldRun]);

  const isComplete = progress >= 100;
  const completedAgents = isComplete ? agents.length : Math.floor((progress / 100) * agents.length);
  const runningIndex = Math.min(completedAgents, agents.length - 1);
  const currentAgent = agents[runningIndex];
  const generatedOutputs = isComplete ? outputs.length : Math.floor((progress / 100) * outputs.length);
  const visibleLogs = Math.max(1, Math.ceil((progress / 100) * logs.length));
  const hasRecoveredWarning = progress >= 44 && progress < 62;
  const viewerHref = outputViewerHref ?? `/projects/${project.id}/outputs?generated=1`;
  const runWarnings = runInfo?.fallbackUsed ? runInfo.providerWarnings ?? runInfo.warnings ?? [] : [];

  const message = useMemo(() => {
    if (isComplete) {
      return runInfo
        ? "Ship Design finished this generation run. Review the generated artifacts, provider details, and output package."
        : "Ship Design finished the local mock pipeline. Review, export, or send the generated package to Figma.";
    }

    return stepMessages[Math.min(runningIndex, stepMessages.length - 1)];
  }, [isComplete, runningIndex, runInfo]);

  function getAgentState(index: number) {
    if (index < completedAgents || isComplete) return "complete";
    if (index === runningIndex) return "running";
    return "queued";
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <main className="grid gap-6">
        <Card>
          <CardBody className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-center" aria-live="polite">
            <div className="border border-line bg-surface-base p-5">
              <p className="font-mono text-xs uppercase text-ink-muted">Progress percentage</p>
              <p className="mt-3 font-mono text-5xl text-accent-green">{progress}%</p>
              <Progress value={progress} label="Design package" className="mt-5" />
            </div>
            <div>
              <Badge tone={isComplete ? "success" : "accent"}>
                {isComplete ? "Generation complete" : "Current running agent"}
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold">
                {isComplete ? "Generated outputs are ready" : currentAgent.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-secondary">{message}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <StatusPill tone={isComplete ? "complete" : "running"} pulse={!isComplete}>
                  {isComplete ? "Complete" : "Running"}
                </StatusPill>
                <StatusPill tone={hasRecoveredWarning ? "warning" : "info"}>
                  {hasRecoveredWarning ? "Recovered warning" : runInfo ? `Provider ${runInfo.provider}` : "Local mock"}
                </StatusPill>
                {runInfo ? (
                  <>
                    <StatusPill tone={runInfo.mode === "real" ? "complete" : "info"}>
                      Mode {runInfo.mode}
                    </StatusPill>
                    <StatusPill tone="info">Model {runInfo.model}</StatusPill>
                  </>
                ) : null}
              </div>
              {isComplete ? (
                <Button href={viewerHref} variant="primary" className="mt-6">
                  Open Output Viewer
                </Button>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-mono text-sm uppercase text-ink-secondary">Agent timeline</h2>
          </CardHeader>
          <CardBody className="grid gap-3">
            {agents.map((agent, index) => {
              const state = getAgentState(index);
              const agentProgress =
                state === "complete" ? 100 : state === "running" ? Math.max(12, progress % 100) : 0;

              return (
                <div
                  key={agent.id}
                  className="grid gap-3 border border-line bg-surface-base p-4 sm:grid-cols-[40px_1fr_auto] sm:items-start"
                >
                  <div className="flex size-10 items-center justify-center border border-line bg-surface-panel font-mono text-xs text-ink-muted">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-ink-primary">{agent.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{agent.output}</p>
                    {agentProgress > 0 ? (
                      <Progress value={agentProgress} showValue={false} className="mt-3" />
                    ) : null}
                  </div>
                  <StatusPill
                    tone={state === "complete" ? "complete" : state === "running" ? "running" : "queued"}
                    pulse={state === "running"}
                  >
                    {state}
                  </StatusPill>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-mono text-sm uppercase text-ink-secondary">
                Generated output preview
              </h2>
              <Button
                href={viewerHref}
                size="sm"
                variant={isComplete ? "primary" : "secondary"}
              >
                Open viewer
              </Button>
            </div>
          </CardHeader>
          <CardBody className="grid gap-3 md:grid-cols-2">
            {outputs.map((output, index) => (
              <OutputArtifactCard
                key={output.id}
                output={output}
                state={index < generatedOutputs ? "generated" : "waiting"}
              />
            ))}
          </CardBody>
        </Card>
      </main>

      <aside className="grid content-start gap-4">
        <ActivityLog logs={logs} visibleCount={visibleLogs} />

        <StatePanel
          tone={isComplete ? "success" : "info"}
          label={isComplete ? "Run complete" : "Run status"}
          title={isComplete ? "Artifacts saved locally" : "Local generation active"}
          description={
            isComplete
              ? runInfo
                ? `Run stored in memory. Provider: ${runInfo.provider}. Mode: ${runInfo.mode}. Model: ${runInfo.model}. Fallback: ${runInfo.fallbackUsed ? "yes" : "no"}.`
                : "The generated package is ready for review. No backend, API, or database was used."
              : "This demo uses local mock timing so the team can review the product flow before real AI integration."
          }
        />

        {runWarnings.map((warning) => (
          <StatePanel
            key={warning}
            tone="warning"
            label="Provider warning"
            title="Generation used fallback behavior"
            description={warning}
          />
        ))}

        {hasRecoveredWarning ? (
          <StatePanel
            tone="warning"
            label="Recovered"
            title="Low-confidence section retried"
            description="The mock run recovered automatically and continued without dropping completed artifacts."
          />
        ) : null}

        <EmptyState
          title="No blocked agents"
          description="Blocked steps will appear here when a future real AI run needs user input."
        />
      </aside>
    </div>
  );
}
