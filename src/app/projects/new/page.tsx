import { NewProjectIntake } from "@/components/project/new-project-intake";
import { AppShell } from "@/components/layout/app-shell";

export default function NewProjectPage() {
  return (
    <AppShell
      title="New Project"
      eyebrow="Intake"
      description="Describe the product once. Ship Design turns it into practical product, UX, design, Figma, prototype, landing, and handoff outputs."
      idleModeLabel="Ready"
    >
      <NewProjectIntake />
    </AppShell>
  );
}
