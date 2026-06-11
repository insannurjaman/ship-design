import "server-only";

import { generateAiText } from "@/lib/ai/client";
import { createArtifactSummaryData } from "@/lib/generation/artifact-summary";
import { createArtifactVersion } from "@/lib/generation/artifact-versions";
import { createDependencyContext } from "@/lib/generation/artifact-dependencies";
import {
  createArtifactPrompt,
  generationArtifactSpecs,
  renderGenerationArtifact
} from "@/lib/generation/artifact-renderer";
import {
  createGenerationStepsFromArtifacts,
  getGenerationProgress,
  type CreateGenerationRunRequest,
  type GenerationArtifact,
  type GenerationRun
} from "@/lib/generation/progress";
import { saveGenerationRun } from "@/lib/generation/run-store";
import { normalizeSelectedOutputIds } from "@/lib/output-scope";

export async function createGenerationRun(input: CreateGenerationRunRequest): Promise<GenerationRun> {
  const runId = createRunId();
  const artifacts: GenerationArtifact[] = [];
  const selectedOutputIds = normalizeSelectedOutputIds(input.outputTypes);

  for (const spec of generationArtifactSpecs) {
    if (!selectedOutputIds.has(spec.id)) {
      artifacts.push(createSkippedArtifact(spec));
      continue;
    }

    try {
      const response = await generateAiText({
        messages: [
          {
            role: "system",
            content: [
              "You are a senior product design agent working inside Ship Design.",
              "Create practical product design artifacts for designers, founders, product teams, Figma, Codex, and engineers.",
              "Use dependency context from earlier artifacts when it is provided.",
              "Keep the language clear, structured, and beginner-friendly."
            ].join(" ")
          },
          {
            role: "user",
            content: createArtifactPrompt(input, spec, createDependencyContext(spec.id, input, artifacts))
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
    } catch (error) {
      artifacts.push(createFailedArtifact(spec, error));
    }
  }

  const firstArtifact = artifacts[0];
  const warnings = Array.from(new Set(artifacts.flatMap((artifact) => artifact.warnings)));
  const providerWarnings = Array.from(new Set(artifacts.flatMap((artifact) => artifact.providerWarnings)));
  const providerDiagnostics = uniqueDiagnostics(artifacts.flatMap((artifact) => artifact.providerDiagnostics ?? []));
  const attemptedProviders = Array.from(new Set(artifacts.flatMap((artifact) => artifact.attemptedProviders)));
  const fallbackUsed = artifacts.some((artifact) => artifact.fallbackUsed);
  const finalProvider = artifacts.find((artifact) => artifact.finalProvider !== "mock")?.finalProvider ?? firstArtifact?.finalProvider ?? "mock";
  const generatedCount = artifacts.filter((artifact) => artifact.status !== "skipped").length;
  const run: GenerationRun = {
    id: runId,
    status: artifacts.some((artifact) => artifact.status === "error") ? "error" : "complete",
    progress: getGenerationProgress(generatedCount),
    createdAt: new Date().toISOString(),
    input,
    artifacts,
    steps: createGenerationStepsFromArtifacts(artifacts),
    provider: firstArtifact?.provider ?? "mock",
    model: firstArtifact?.model ?? "mock-ship-design",
    mode: firstArtifact?.mode ?? "mock",
    warnings,
    attemptedProviders,
    fallbackUsed,
    finalProvider,
    providerWarnings,
    providerDiagnostics
  };

  return saveGenerationRun(run);
}

function createSkippedArtifact(spec: (typeof generationArtifactSpecs)[number]): GenerationArtifact {
  const markdown = [
    `# ${spec.title}`,
    "",
    "This optional artifact was skipped for this generation run.",
    "",
    "Generate a Full package or add generate-later support in a future phase to create it."
  ].join("\n");
  const body = ["This optional artifact was skipped for this generation run."];
  const summary = "Skipped for this run.";
  const summaryData = createArtifactSummaryData({
    title: spec.title,
    markdown,
    fallbackSummary: summary
  });
  const version = createArtifactVersion({
    version: 1,
    markdown,
    summary,
    body,
    provider: "mock",
    model: "skipped",
    mode: "mock",
    warnings: [],
    attemptedProviders: [],
    fallbackUsed: false,
    finalProvider: "mock",
    providerWarnings: [],
    providerDiagnostics: []
  });

  return {
    id: spec.id,
    title: spec.title,
    type: spec.type,
    status: "skipped",
    summary,
    body,
    markdown,
    provider: "mock",
    model: "skipped",
    mode: "mock",
    warnings: [],
    attemptedProviders: [],
    fallbackUsed: false,
    finalProvider: "mock",
    providerWarnings: [],
    providerDiagnostics: [],
    activeVersion: version.version,
    versions: [version],
    summaryData
  };
}

function createFailedArtifact(
  spec: (typeof generationArtifactSpecs)[number],
  error: unknown
): GenerationArtifact {
  const message = error instanceof Error ? error.message : "Unknown generation error.";
  const markdown = [
    `# ${spec.title}`,
    "",
    "This artifact could not be generated.",
    "",
    "## Recovery",
    "Retry the generation run or regenerate this artifact after the provider issue is resolved.",
    "",
    `## Error`,
    message
  ].join("\n");
  const body = ["This artifact could not be generated.", message];
  const version = createArtifactVersion({
    version: 1,
    markdown,
    summary: "This artifact could not be generated.",
    body,
    provider: "mock",
    model: "failed-generation",
    mode: "mock",
    warnings: [message],
    attemptedProviders: [],
    fallbackUsed: false,
    finalProvider: "mock",
    providerWarnings: [message],
    providerDiagnostics: [
      {
        provider: "mock",
        summary: "Artifact generation failed",
        detail: message
      }
    ]
  });

  return {
    id: spec.id,
    title: spec.title,
    type: spec.type,
    status: "error",
    summary: version.summary,
    body,
    markdown,
    provider: version.provider,
    model: version.model,
    mode: version.mode,
    warnings: version.warnings,
    attemptedProviders: version.attemptedProviders,
    fallbackUsed: version.fallbackUsed,
    finalProvider: version.finalProvider,
    providerWarnings: version.providerWarnings,
    providerDiagnostics: version.providerDiagnostics,
    activeVersion: version.version,
    versions: [version],
    summaryData: createArtifactSummaryData({
      title: spec.title,
      markdown,
      fallbackSummary: version.summary
    })
  };
}

function uniqueDiagnostics<T extends { provider: string; summary: string; detail: string }>(diagnostics: T[]) {
  const seen = new Set<string>();

  return diagnostics.filter((diagnostic) => {
    const key = `${diagnostic.provider}:${diagnostic.summary}:${diagnostic.detail}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
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
