"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
};

export function Tabs({ items, defaultValue, className }: TabsProps) {
  const generatedId = useId();
  const firstEnabled = items.find((item) => !item.disabled);
  const [activeTab, setActiveTab] = useState(defaultValue ?? firstEnabled?.id ?? items[0]?.id);
  const selectedItem = items.find((item) => item.id === activeTab) ?? firstEnabled ?? items[0];

  return (
    <div className={cn("grid gap-4", className)}>
      <div
        role="tablist"
        aria-label="Tabs"
        className="flex min-h-11 items-center gap-2 overflow-x-auto border border-line bg-surface-panel p-1"
      >
        {items.map((item) => {
          const isActive = item.id === selectedItem?.id;

          return (
            <button
              key={item.id}
              id={`${generatedId}-${item.id}-tab`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${generatedId}-${item.id}-panel`}
              disabled={item.disabled}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "min-h-10 shrink-0 border px-3 py-2 font-mono text-xs font-medium uppercase tracking-normal transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green",
                isActive
                  ? "border-accent-green bg-accent-soft text-accent-green"
                  : "border-transparent text-ink-muted hover:border-line hover:bg-surface-raised hover:text-ink-primary active:bg-surface-hover",
                "disabled:cursor-not-allowed disabled:text-ink-muted disabled:opacity-50"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {selectedItem ? (
        <div
          id={`${generatedId}-${selectedItem.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${generatedId}-${selectedItem.id}-tab`}
          className="rounded-sm border border-line bg-surface-panel p-5"
        >
          {selectedItem.content}
        </div>
      ) : null}
    </div>
  );
}
