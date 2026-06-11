import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { AppNav } from "@/components/layout/app-nav";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  runInfo?: {
    provider: string;
    model: string;
    mode: "mock" | "real";
  };
};

export function AppShell({
  children,
  title,
  eyebrow = "Workspace",
  description,
  actions,
  runInfo
}: AppShellProps) {
  const shellModeLabel = runInfo ? `Mode ${runInfo.mode}` : "Demo mode";
  const shellModeTone = runInfo?.mode === "real" ? "complete" : "info";

  return (
    <div className="min-h-screen bg-surface-base text-ink-primary">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-surface-panel/95 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-line p-5">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="font-mono text-sm uppercase text-accent-green">
                {APP_NAME}
              </Link>
              <span className="font-mono text-xs text-ink-muted">V1</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Product design agent system
            </p>
          </div>
          <AppNav />
          <div className="hidden shrink-0 border-t border-line p-4 lg:mt-auto lg:block">
            <div className="border border-line bg-surface-base p-4">
              <p className="font-mono text-xs uppercase text-ink-muted">System</p>
              <div className="mt-3 grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-secondary">Generation</span>
                  <StatusPill tone={shellModeTone}>{shellModeLabel}</StatusPill>
                </div>
                {runInfo ? (
                  <div className="grid gap-2 border-t border-line pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs uppercase text-ink-muted">Provider</span>
                      <span className="truncate text-right font-mono text-xs text-ink-secondary">{runInfo.provider}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs uppercase text-ink-muted">Model</span>
                      <span className="truncate text-right font-mono text-xs text-ink-secondary">{runInfo.model}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
        <main className="min-w-0 overflow-x-hidden">
          <header className="border-b border-line bg-surface-base/95 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <Badge tone="muted">{eyebrow}</Badge>
                <h1 className="mt-3 text-2xl font-semibold text-ink-primary sm:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-secondary">
                    {description}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={runInfo?.mode === "real" ? "success" : "accent"}>
                  {runInfo ? `Mode ${runInfo.mode}` : "Local demo"}
                </Badge>
                {runInfo ? (
                  <>
                    <Badge tone={runInfo.provider === "mock" ? "info" : "success"}>
                      Provider {runInfo.provider}
                    </Badge>
                    <Badge tone="info">Model {runInfo.model}</Badge>
                  </>
                ) : null}
                {actions}
              </div>
            </div>
          </header>
          <div className="px-4 py-5 sm:px-6 lg:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
