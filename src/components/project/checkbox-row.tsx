"use client";

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function CheckboxRow({ label, checked, onChange, disabled }: CheckboxRowProps) {
  return (
    <label className="flex min-h-11 items-center gap-3 border border-line bg-surface-base px-3 py-2 text-sm text-ink-secondary transition-colors hover:border-line-strong hover:bg-surface-hover">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="size-4 accent-accent-green disabled:opacity-60"
      />
      <span>{label}</span>
    </label>
  );
}
