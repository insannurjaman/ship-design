import "server-only";

import { generateAiText } from "@/lib/ai/client";
import {
  createArtifactPrompt,
  generationArtifactSpecs,
  renderGenerationArtifact
} from "@/lib/generation/artifact-renderer";
import {
  createGenerationSteps,
  getGenerationProgress,
  type CreateGenerationRunRequest,
  type GenerationArtifact,
  type GenerationRun
} from "@/lib/generation/progress";
import { saveGenerationRun } from "@/lib/generation/run-store";

export async function createGenerationRun(input: CreateGenerationRunRequest): Promise<GenerationRun> {
  const runId = createRunId();
  const artifacts: GenerationArtifact[] = [];

  for (const spec of generationArtifactSpecs) {
    const response = await generateAiText({
      messages: [
        {
          role: "system",
          content: [
            "You are a senior product design agent working inside Ship Design.",
            "Create practical product design artifacts for designers, founders, product teams, Figma, Codex, and engineers.",
            "Keep the language clear, structured, and beginner-friendly."
          ].join(" ")
        },
        {
          role: "user",
          content: createArtifactPrompt(input, spec)
        }
      ],
      modelTier: "default",
      temperature: 0.35,
      maxOutputTokens: readMaxOutputTokens(),
      metadata: {
        projectId: runId,
        agentId: spec.id,
        taskId: `generate-${spec.id}`
      }
    });

    artifacts.push(renderGenerationArtifact(spec, response));
  }

  const firstArtifact = artifacts[0];
  const warnings = Array.from(new Set(artifacts.flatMap((artifact) => artifact.warnings)));
  const run: GenerationRun = {
    id: runId,
    status: "complete",
    progress: getGenerationProgress(artifacts.length),
    createdAt: new Date().toISOString(),
    input,
    artifacts,
    steps: createGenerationSteps(artifacts.length),
    provider: firstArtifact?.provider ?? "mock",
    model: firstArtifact?.model ?? "mock-ship-design",
    mode: firstArtifact?.mode ?? "mock",
    warnings
  };

  return saveGenerationRun(run);
}

function createRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `run-${crypto.randomUUID()}`;
  }

  return `run-${Date.now().toString(36)}`;
}

function readMaxOutputTokens() {
  const parsed = Number.parseInt(process.env.MAX_OUTPUT_TOKENS_PER_AGENT ?? "1800", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1800;
}
