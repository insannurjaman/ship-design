type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="border border-line bg-surface-base p-3">
      <p className="font-mono text-2xl text-accent-green">{value}</p>
      <p className="mt-1 font-mono text-xs uppercase text-ink-muted">{label}</p>
      {detail ? <p className="mt-3 text-sm leading-6 text-ink-secondary">{detail}</p> : null}
    </div>
  );
}
