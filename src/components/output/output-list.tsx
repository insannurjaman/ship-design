import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { OutputArtifact } from "@/lib/mock-data";

type OutputListProps = {
  outputs: OutputArtifact[];
};

export function OutputList({ outputs }: OutputListProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-mono text-sm uppercase text-ink-secondary">Generated outputs</h2>
      </CardHeader>
      <CardBody className="grid gap-3">
        {outputs.map((output) => (
          <article key={output.id} className="border border-line bg-surface-base p-4 transition-colors hover:border-line-strong hover:bg-surface-hover">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase text-accent-green">{output.type}</p>
                <h3 className="mt-2 font-medium">{output.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">{output.summary}</p>
              </div>
              <Badge
                tone={
                  output.status === "ready"
                    ? "success"
                    : output.status === "error"
                      ? "danger"
                      : output.status === "needs-review"
                        ? "warning"
                        : "default"
                }
              >
                {output.status}
              </Badge>
            </div>
          </article>
        ))}
      </CardBody>
    </Card>
  );
}
