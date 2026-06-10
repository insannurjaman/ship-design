import { AgentWorkflowSimulation } from "@/components/agent/agent-workflow-simulation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { mockActivityLogs, mockAgentRuns, mockOutputs, mockProjects } from "@/lib/mock-data";
import { redirect } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ run?: string; step?: string }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { projectId } = await params;
  const { run, step } = await searchParams;
  const project = mockProjects.find((item) => item.id === projectId) ?? mockProjects[0];
  const shouldRun = run === "mock";

  if (step) {
    redirect(shouldRun ? `/projects/${project.id}?run=mock` : `/projects/${project.id}`);
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
