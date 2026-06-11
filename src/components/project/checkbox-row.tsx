"use client";

import type { ReactNode } from "react";

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  meta?: ReactNode;
};

export function CheckboxRow({ label, checked, onChange, disabled, meta }: CheckboxRowProps) {
  return (
    <label className="flex min-h-11 items-center gap-3 border border-line bg-surface-base px-3 py-2 text-sm text-ink-secondary transition-colors hover:border-line-strong hover:bg-surface-hover has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="size-4 accent-accent-green disabled:opacity-60"
      />
      <span className="min-w-0 flex-1">{label}</span>
      {meta ? <span className="shrink-0">{meta}</span> : null}
    </label>
  );
}
