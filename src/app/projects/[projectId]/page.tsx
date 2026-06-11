import { AgentWorkflowSimulation } from "@/components/agent/agent-workflow-simulation";
import { AppShell } from "@/components/layout/app-shell";
import { StatePanel } from "@/components/layout/state-panel";
import { Button } from "@/components/ui/button";
import { getGenerationRun } from "@/lib/generation/run-store";
import { getGenerationArtifactSpec } from "@/lib/generation/artifact-renderer";
import {
  mockActivityLogs,
  mockAgentRuns,
  mockOutputs,
  mockProjects,
  type ActivityLog,
  type AgentRun,
  type Project
} from "@/lib/mock-data";
import type { GenerationRun } from "@/lib/generation/progress";
import { redirect } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ generationRunId?: string; run?: string; step?: string }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { projectId } = await params;
  const { generationRunId, run, step } = await searchParams;
  const project = mockProjects.find((item) => item.id === projectId) ?? mockProjects[0];
  const shouldRun = run === "mock";

  if (step) {
    redirect(shouldRun ? `/projects/${project.id}?run=mock` : `/projects/${project.id}`);
  }

  if (generationRunId) {
    const generationRun = getGenerationRun(generationRunId);

    if (!generationRun) {
      return <GenerationRunNotFound runId={generationRunId} />;
    }

    const generatedProject = createProjectFromRun(generationRun);
    const outputViewerHref = `/projects/generated/outputs?generationRunId=${encodeURIComponent(generationRun.id)}`;

    return (
      <AppShell
        title="Agent Workflow Progress"
        eyebrow={generatedProject.name}
        description={generatedProject.goal}
        runInfo={{
          provider: generationRun.provider,
          model: generationRun.model,
          mode: generationRun.mode
        }}
        actions={
          <Button href={outputViewerHref} variant="primary">
            Open Output Viewer
          </Button>
        }
      >
        <AgentWorkflowSimulation
          project={generatedProject}
          agents={createAgentsFromRun(generationRun)}
          outputs={generationRun.artifacts}
          logs={createLogsFromRun(generationRun)}
          outputViewerHref={outputViewerHref}
          runInfo={{
            provider: generationRun.provider,
            model: generationRun.model,
            mode: generationRun.mode,
            warnings: generationRun.warnings,
            attemptedProviders: generationRun.attemptedProviders,
            fallbackUsed: generationRun.fallbackUsed,
            finalProvider: generationRun.finalProvider,
            providerWarnings: generationRun.providerWarnings,
            providerDiagnostics: generationRun.providerDiagnostics
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Agent Workflow Progress"
      eyebrow={project.name}
      description={project.goal}
      actions={
        <Button href={`/projects/${project.id}/outputs?generated=1`} variant="primary">
          Open Output Viewer
        </Button>
      }
    >
      <AgentWorkflowSimulation
        project={project}
        agents={mockAgentRuns}
        outputs={mockOutputs}
        logs={mockActivityLogs}
        shouldRun={shouldRun}
      />
    </AppShell>
  );
}

function GenerationRunNotFound({ runId }: { runId: string }) {
  return (
    <AppShell
      title="Generation Run Not Found"
      eyebrow="Recovery"
      description="Ship Design could not find this in-memory generation run. It may have expired after a server restart or refresh."
    >
      <StatePanel
        tone="danger"
        label="Missing run"
        title="Generation run not found"
        description={`No generation run exists for ${runId}. Start a new package, try the generation again, or open the mock demo.`}
        action={
          <div className="flex flex-wrap gap-3">
            <Button href="/projects/new" variant="primary">
              Back to New Project
            </Button>
            <Button href="/projects/new" variant="secondary">
              Try again
            </Button>
            <Button href="/projects/project-forge?run=mock" variant="secondary">
              Open mock demo
            </Button>
          </div>
        }
      />
    </AppShell>
  );
}

function createProjectFromRun(run: GenerationRun): Project {
  return {
    id: "generated",
    name: run.input.productName,
    idea: run.input.mainProblem,
    type: run.input.productType,
    targetUsers: run.input.targetUsers,
    goal: run.input.productGoal,
    status: "ready",
    updatedAt: "Just now",
    outputs: run.artifacts.length,
    progress: run.progress
  };
}

function createAgentsFromRun(run: GenerationRun): AgentRun[] {
  return run.steps.map((step) => ({
    id: step.id,
    name: getGenerationArtifactSpec(step.id)?.agentName ?? `${step.title} Agent`,
    status: step.status,
    output: getGenerationArtifactSpec(step.id)?.title ?? step.title,
    description: `Generated ${step.title} for ${run.input.productName}.`,
    progress: step.progress
  }));
}

function createLogsFromRun(run: GenerationRun): ActivityLog[] {
  return run.steps.map((step, index) => ({
    id: step.id,
    time: index === 0 ? "Now" : `+${index + 1}m`,
    label: getGenerationArtifactSpec(step.id)?.title ?? step.title,
    message:
      step.status === "queued"
        ? `${getGenerationArtifactSpec(step.id)?.title ?? step.title} was skipped for this package selection.`
        : `${getGenerationArtifactSpec(step.id)?.title ?? step.title} completed using ${run.provider} (${run.mode}) with ${run.model}.`,
    tone: step.status === "error" ? "danger" : step.status === "queued" ? "info" : "success"
  }));
}
