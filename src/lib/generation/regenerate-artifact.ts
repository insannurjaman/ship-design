import "server-only";

import { generateAiText } from "@/lib/ai/client";
import {
  applyActiveArtifactVersion,
  createArtifactVersion,
  getActiveArtifactVersion,
  getNextArtifactVersionNumber
} from "@/lib/generation/artifact-versions";
import {
  createDependencyContext,
  markDownstreamArtifactsNeedsReview
} from "@/lib/generation/artifact-dependencies";
import {
  createArtifactPrompt,
  generationArtifactSpecs,
  type GenerationArtifactSpec
} from "@/lib/generation/artifact-renderer";
import {
  createArtifactSummary,
  markdownToBodyLines,
  normalizeMarkdownForDisplay
} from "@/lib/generation/markdown-cleanup";
import type { GenerationArtifact, GenerationRun } from "@/lib/generation/progress";
import { getGenerationRun, updateGenerationRun } from "@/lib/generation/run-store";

export type RegenerateArtifactRequest = {
  artifactId: GenerationArtifact["id"];
  feedback?: string;
};

export type RegenerateArtifactResponse = {
  runId: string;
  artifactId: GenerationArtifact["id"];
  activeVersion: number;
  artifact: GenerationArtifact;
  warnings: string[];
};

export class RegenerateArtifactError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 500, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "RegenerateArtifactError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function regenerateArtifact(
  runId: string,
  request: RegenerateArtifactRequest
): Promise<RegenerateArtifactResponse> {
  const run = getGenerationRun(runId);

  if (!run) {
    throw new RegenerateArtifactError("Generation run not found.", 404);
  }

  const artifactIndex = run.artifacts.findIndex((artifact) => artifact.id === request.artifactId);
  const artifact = run.artifacts[artifactIndex];
  const spec = generationArtifactSpecs.find((item) => item.id === request.artifactId);

  if (!artifact || !spec) {
    throw new RegenerateArtifactError("Unsupported artifact for regeneration.", 400, {
      artifactId: "Choose one of the 8 generated artifacts."
    });
  }

  const currentVersion = getActiveArtifactVersion(artifact);
  const response = await generateAiText({
    messages: [
      {
        role: "system",
        content: [
          "You are a senior product design agent working inside Ship Design.",
          "Regenerate only the selected artifact.",
          "Preserve useful decisions unless the feedback asks for a change.",
          "Keep markdown clean, structured, practical, and beginner-friendly."
        ].join(" ")
      },
      {
        role: "user",
        content: createRegenerationPrompt(run, artifact, spec, currentVersion.markdown, request.feedback)
      }
    ],
    modelTier: "default",
    temperature: 0.35,
    maxOutputTokens: readMaxOutputTokens(),
    metadata: {
      projectId: run.id,
      agentId: artifact.id,
      taskId: `regenerate-${artifact.id}-v${getNextArtifactVersionNumber(artifact)}`
    }
  });

  const markdown = normalizeMarkdownForDisplay(response.text.trim() || currentVersion.markdown);
  const body = markdownToBodyLines(markdown);
  const summary = createArtifactSummary(markdown, spec.title);
  const nextVersion = createArtifactVersion({
    version: getNextArtifactVersionNumber(artifact),
    markdown,
    summary,
    body,
    provider: response.provider,
    model: response.model,
    mode: response.mode,
    usage: response.usage,
    feedback: normalizeFeedback(request.feedback),
    warnings: response.warnings,
    attemptedProviders: response.attemptedProviders,
    fallbackUsed: response.fallbackUsed,
    finalProvider: response.finalProvider,
    providerWarnings: response.providerWarnings
  });
  const updatedArtifact = applyActiveArtifactVersion(artifact, nextVersion);
  const updatedArtifacts = markDownstreamArtifactsNeedsReview(
    run.artifacts.map((item, index) => (index === artifactIndex ? updatedArtifact : item)),
    updatedArtifact.id
  );
  const updatedRun = updateGenerationRun(recalculateRunMetadata({
    ...run,
    artifacts: updatedArtifacts
  }));

  return {
    runId: updatedRun.id,
    artifactId: updatedArtifact.id,
    activeVersion: updatedArtifact.activeVersion,
    artifact: updatedArtifact,
    warnings: updatedArtifact.warnings
  };
}

function createRegenerationPrompt(
  run: GenerationRun,
  artifact: GenerationArtifact,
  spec: GenerationArtifactSpec,
  currentMarkdown: string,
  feedback?: string
) {
  const dependencyContext = createDependencyContext(artifact.id, run.input, run.artifacts);

  return [
    createArtifactPrompt(run.input, spec),
    dependencyContext ? ["", "Relevant dependency context:", dependencyContext].join("\n") : "",
    "",
    "Regeneration context:",
    `- Selected artifact: ${artifact.title}`,
    "- Regenerate only this artifact.",
    "- Do not regenerate any other artifact unless this is the selected artifact.",
    "- Downstream artifacts may be marked needs-review after this succeeds, but do not rewrite them.",
    "- Keep the output markdown clean and structured.",
    "",
    "Current active artifact markdown:",
    currentMarkdown,
    "",
    "User feedback for this regeneration:",
    normalizeFeedback(feedback) || "No specific feedback. Improve clarity, structure, and practical usefulness.",
    "",
    "Return only the regenerated artifact markdown."
  ].join("\n");
}

function recalculateRunMetadata(run: GenerationRun): GenerationRun {
  const latestVersion = run.artifacts
    .map((artifact) => getActiveArtifactVersion(artifact))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const warnings = Array.from(new Set(run.artifacts.flatMap((artifact) => artifact.warnings)));
  const providerWarnings = Array.from(new Set(run.artifacts.flatMap((artifact) => artifact.providerWarnings)));
  const attemptedProviders = Array.from(new Set(run.artifacts.flatMap((artifact) => artifact.attemptedProviders)));
  const fallbackUsed = run.artifacts.some((artifact) => artifact.fallbackUsed);
  const finalProvider =
    run.artifacts.find((artifact) => artifact.finalProvider !== "mock")?.finalProvider ??
    latestVersion?.finalProvider ??
    "mock";

  return {
    ...run,
    provider: latestVersion?.provider ?? "mock",
    model: latestVersion?.model ?? "mock-ship-design",
    mode: latestVersion?.mode ?? "mock",
    warnings,
    attemptedProviders,
    fallbackUsed,
    finalProvider,
    providerWarnings
  };
}

function normalizeFeedback(feedback?: string) {
  const value = feedback?.trim();

  return value ? value.slice(0, 1200) : undefined;
}

function readMaxOutputTokens() {
  const parsed = Number.parseInt(process.env.MAX_OUTPUT_TOKENS_PER_AGENT ?? "1800", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1800;
}
