import { AgentWorkflowSimulation } from "@/components/agent/agent-workflow-simulation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { mockActivityLogs, mockAgentRuns, mockOutputs, mockProjects } from "@/lib/mock-data";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ run?: string }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { projectId } = await params;
  const { run } = await searchParams;
  const project = mockProjects.find((item) => item.id === projectId) ?? mockProjects[0];
  const shouldRun = run === "mock";

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
