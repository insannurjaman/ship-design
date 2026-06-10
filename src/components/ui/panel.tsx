import { cn } from "@/lib/utils";

type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <section className={cn("border border-line bg-surface-panel/92", className)}>
      {children}
    </section>
  );
}

export function PanelHeader({ children, className }: PanelProps) {
  return (
    <div className={cn("border-b border-line px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function PanelBody({ children, className }: PanelProps) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

