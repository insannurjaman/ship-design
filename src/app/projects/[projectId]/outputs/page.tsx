import { AppShell } from "@/components/layout/app-shell";
import { OutputViewer } from "@/components/output/output-viewer";
import { mockFigmaConnection, mockOutputs, mockProjects } from "@/lib/mock-data";

type ProjectOutputsPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectOutputsPage({ params }: ProjectOutputsPageProps) {
  const { projectId } = await params;
  const project = mockProjects.find((item) => item.id === projectId) ?? mockProjects[0];

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
