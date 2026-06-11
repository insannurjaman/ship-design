import { AppShell } from "@/components/layout/app-shell";
import { StatePanel } from "@/components/layout/state-panel";
import { OutputViewer } from "@/components/output/output-viewer";
import { Button } from "@/components/ui/button";
import { getGenerationRun } from "@/lib/generation/run-store";
import { mockFigmaConnection, mockOutputs, mockProjects } from "@/lib/mock-data";

type ProjectOutputsPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ generationRunId?: string }>;
};

export default async function ProjectOutputsPage({ params, searchParams }: ProjectOutputsPageProps) {
  const { projectId } = await params;
  const { generationRunId } = await searchParams;
  const project = mockProjects.find((item) => item.id === projectId) ?? mockProjects[0];

  if (generationRunId) {
    const generationRun = getGenerationRun(generationRunId);

    if (!generationRun) {
      return <GenerationRunNotFound runId={generationRunId} />;
    }

    return (
      <AppShell
        title="Output Viewer"
        eyebrow={generationRun.input.productName}
        description="Review generated product artifacts from this generation run, copy sections, export markdown, or send approved structure to Figma."
        runInfo={{
          provider: generationRun.provider,
          model: generationRun.model,
          mode: generationRun.mode
        }}
      >
        <OutputViewer
          projectId="generated"
          outputs={generationRun.artifacts}
          figmaConnection={mockFigmaConnection}
          regenerateHref={`/projects/generated?generationRunId=${encodeURIComponent(generationRun.id)}`}
          runInfo={{
            provider: generationRun.provider,
            model: generationRun.model,
            mode: generationRun.mode,
            createdAt: generationRun.createdAt,
            warnings: generationRun.warnings,
            attemptedProviders: generationRun.attemptedProviders,
            fallbackUsed: generationRun.fallbackUsed,
            finalProvider: generationRun.finalProvider,
            providerWarnings: generationRun.providerWarnings
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Output Viewer"
      eyebrow={project.name}
      description="Review generated product artifacts, copy sections, export markdown, or send approved structure to Figma."
    >
      <OutputViewer
        projectId={project.id}
        outputs={mockOutputs}
        figmaConnection={mockFigmaConnection}
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
            <Button href="/projects/project-forge/outputs?generated=1" variant="secondary">
              Open mock demo
            </Button>
          </div>
        }
      />
    </AppShell>
  );
}
