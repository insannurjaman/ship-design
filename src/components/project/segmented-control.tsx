"use client";

import { cn } from "@/lib/utils";

type SegmentedControlProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function SegmentedControl({ label, options, value, onChange, disabled }: SegmentedControlProps) {
  return (
    <div className="grid gap-3">
      <p className="font-mono text-xs font-medium uppercase text-ink-muted">{label}</p>
      <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label={label}>
        {options.map((option) => {
          const isSelected = option === value;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                "min-h-11 border px-4 py-3 font-mono text-sm uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green disabled:cursor-not-allowed disabled:opacity-60",
                isSelected
                  ? "border-accent-green bg-accent-soft text-accent-green"
                  : "border-line bg-surface-base text-ink-secondary hover:border-line-strong hover:bg-surface-hover"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
