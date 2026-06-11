"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type RegenerateArtifactDialogProps = {
  artifactTitle: string;
  disabled?: boolean;
  isLoading?: boolean;
  onSubmit: (feedback?: string) => void;
};

export function RegenerateArtifactDialog({
  artifactTitle,
  disabled,
  isLoading,
  onSubmit
}: RegenerateArtifactDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  function submitRegeneration() {
    onSubmit(feedback.trim() || undefined);
    setIsOpen(false);
    setFeedback("");
  }

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={() => setIsOpen(true)} disabled={disabled}>
        Regenerate artifact
      </Button>
    );
  }

  return (
    <div className="grid gap-4 border border-line bg-surface-base p-4">
      <div>
        <p className="font-mono text-xs uppercase text-accent-green">Regenerate artifact</p>
        <h3 className="mt-2 text-lg font-semibold text-ink-primary">{artifactTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          Add optional feedback. Ship Design will regenerate only this artifact and keep older versions.
        </p>
      </div>
      <Textarea
        label="Feedback"
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Example: make the MVP scope sharper and reduce generic language."
        disabled={isLoading}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" loading={isLoading} onClick={submitRegeneration}>
          Submit regeneration
        </Button>
        <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
