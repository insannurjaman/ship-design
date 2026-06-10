import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/lib/mock-data";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const tone = project.status === "generating" ? "accent" : project.status === "ready" ? "success" : "default";

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green"
    >
      <Card interactive className="h-full">
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase text-ink-muted">{project.type}</p>
              <h2 className="mt-2 text-lg font-medium text-ink-primary">{project.name}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">{project.idea}</p>
            </div>
            <Badge tone={tone}>{project.status}</Badge>
          </div>
          <Progress value={project.progress} label="Progress" className="mt-6" />
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4 font-mono text-xs text-ink-muted">
            <span>{project.outputs} outputs</span>
            <span>{project.updatedAt}</span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
