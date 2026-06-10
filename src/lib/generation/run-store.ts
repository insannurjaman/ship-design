import "server-only";

import type { GenerationRun } from "@/lib/generation/progress";

const globalForGenerationRuns = globalThis as typeof globalThis & {
  __shipDesignGenerationRuns?: Map<string, GenerationRun>;
};

const generationRuns =
  globalForGenerationRuns.__shipDesignGenerationRuns ?? new Map<string, GenerationRun>();

globalForGenerationRuns.__shipDesignGenerationRuns = generationRuns;

export function saveGenerationRun(run: GenerationRun) {
  generationRuns.set(run.id, run);

  return run;
}

export function getGenerationRun(runId: string) {
  return generationRuns.get(runId);
}
