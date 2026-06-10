import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import type { Project } from "@/lib/mock-data";

type ProjectSummaryProps = {
  project: Project;
};

export function ProjectSummary({ project }: ProjectSummaryProps) {
  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-sm uppercase text-ink-secondary">Project brief</h2>
          <Badge tone="accent">{project.status}</Badge>
        </div>
      </PanelHeader>
      <PanelBody>
        <h3 className="text-xl font-semibold">{project.name}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary">{project.idea}</p>
      </PanelBody>
    </Panel>
  );
}

