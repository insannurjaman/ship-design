import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project/project-card";
import { mockProjects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <AppShell title="Projects">
      <div className="mb-6 flex justify-end">
        <Button href="/projects/new" variant="primary">
          New project
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </AppShell>
  );
}

