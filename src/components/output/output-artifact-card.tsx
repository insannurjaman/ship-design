import { Badge } from "@/components/ui/badge";
import type { OutputArtifact } from "@/lib/mock-data";

type OutputArtifactCardProps = {
  output: OutputArtifact;
  state?: "waiting" | "generated" | "ready";
};

export function OutputArtifactCard({ output, state = "ready" }: OutputArtifactCardProps) {
  const isReady = state !== "waiting";

  return (
    <article className="border border-line bg-surface-base p-4 transition-colors hover:border-line-strong hover:bg-surface-hover">
      <Badge tone={isReady ? "success" : "muted"}>{isReady ? state : "waiting"}</Badge>
      <p className="mt-4 font-mono text-xs uppercase text-accent-green">{output.type}</p>
      <h3 className="mt-2 font-medium text-ink-primary">{output.title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-secondary">
        {isReady ? output.summary : "This artifact appears after the relevant agent completes."}
      </p>
    </article>
  );
}
