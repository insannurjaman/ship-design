import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({ label, error, helperText, id, className, disabled, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <label className="grid gap-2">
      {label ? (
        <span className="font-mono text-xs font-medium uppercase tracking-normal text-ink-muted">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId ?? helperId}
        className={cn(
          "min-h-11 w-full rounded-sm border border-line bg-surface-base px-3 py-2 text-sm text-ink-primary outline-none transition-colors",
          "placeholder:text-ink-muted hover:border-line-strong focus:border-accent-green focus:bg-surface-raised",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green",
          "disabled:cursor-not-allowed disabled:bg-surface-panel disabled:text-ink-muted disabled:opacity-70",
          error && "border-status-danger focus:border-status-danger focus-visible:outline-status-danger",
          className
        )}
        {...props}
      />
      {error ? (
        <span id={errorId} className="font-mono text-xs text-status-danger">
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className="text-xs text-ink-muted">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
