import { generationArtifactSpecs } from "@/lib/generation/artifact-renderer";
import { formatArtifactSummaryForContext } from "@/lib/generation/artifact-summary";
import { applyContextBudget } from "@/lib/generation/context-budget";
import type { CreateGenerationRunRequest, GenerationArtifact, GenerationArtifactId } from "@/lib/generation/progress";

export const artifactGenerationOrder = generationArtifactSpecs.map((spec) => spec.id);

export const staleDownstreamMap: Record<GenerationArtifactId, GenerationArtifactId[]> = {
  "product-brief": [
    "ux-docs",
    "user-flows",
    "screen-list",
    "design-system-plan",
    "figma-plan",
    "landing-page-copy",
    "handoff-docs"
  ],
  "ux-docs": ["user-flows", "screen-list", "landing-page-copy", "handoff-docs"],
  "user-flows": ["screen-list", "design-system-plan", "figma-plan", "handoff-docs"],
  "screen-list": ["design-system-plan", "figma-plan", "handoff-docs"],
  "design-system-plan": ["figma-plan", "handoff-docs"],
  "figma-plan": ["handoff-docs"],
  "landing-page-copy": ["handoff-docs"],
  "handoff-docs": []
};

const dependencyMap: Record<GenerationArtifactId, GenerationArtifactId[]> = {
  "product-brief": [],
  "ux-docs": ["product-brief"],
  "user-flows": ["product-brief", "ux-docs"],
  "screen-list": ["product-brief", "ux-docs", "user-flows"],
  "design-system-plan": ["product-brief", "screen-list"],
  "figma-plan": ["screen-list", "design-system-plan"],
  "landing-page-copy": ["product-brief", "ux-docs"],
  "handoff-docs": [
    "product-brief",
    "ux-docs",
    "user-flows",
    "screen-list",
    "design-system-plan",
    "figma-plan",
    "landing-page-copy"
  ]
};

export function createDependencyContext(
  artifactId: GenerationArtifactId,
  input: CreateGenerationRunRequest,
  artifacts: GenerationArtifact[]
) {
  const dependencyIds = dependencyMap[artifactId];
  const dependencySections = dependencyIds
    .map((dependencyId) => artifacts.find((artifact) => artifact.id === dependencyId))
    .filter((artifact): artifact is GenerationArtifact => artifact !== undefined && artifact.status !== "skipped")
    .map((artifact) => formatArtifactSummaryForContext(artifact));
  const extraRules = getExtraDependencyRules(artifactId, input);

  const rawContext = [...dependencySections, extraRules].filter(Boolean).join("\n\n---\n\n");

  return applyContextBudget(rawContext).context;
}

export function markDownstreamArtifactsNeedsReview(
  artifacts: GenerationArtifact[],
  artifactId: GenerationArtifactId
) {
  const staleIds = new Set(staleDownstreamMap[artifactId]);

  if (staleIds.size === 0) return artifacts;

  return artifacts.map((artifact) =>
    staleIds.has(artifact.id) && artifact.status !== "error"
      ? {
          ...artifact,
          status: "needs-review" as const
        }
      : artifact
  );
}

function getExtraDependencyRules(artifactId: GenerationArtifactId, input: CreateGenerationRunRequest) {
  if (artifactId === "design-system-plan") {
    return `Preferred design style:\n${input.preferredStyle || "Ship Design dark technical UI direction"}`;
  }

  if (artifactId === "figma-plan") {
    return [
      "UI Screens rules:",
      "- Create concrete screen specs that a designer can manually recreate in Figma.",
      "- Use clear screen names, route or screen ids, layout sections, components, content, states, interaction notes, and design notes.",
      "- Use the Design System Kit tokens and component guidance as source material.",
      "- Do not claim the real Figma API is connected yet."
    ].join("\n");
  }

  if (artifactId === "landing-page-copy") {
    return [
      "Landing page inputs:",
      `- Target users: ${input.targetUsers}`,
      `- Product goal: ${input.productGoal}`
    ].join("\n");
  }

  if (artifactId === "handoff-docs") {
    return [
      "Developer implementation notes:",
      "- Keep the product mock-only unless a later phase adds persistence.",
      "- Document routes, states, component expectations, open decisions, and QA checks.",
      "- Include a final package summary that references every generated artifact."
    ].join("\n");
  }

  return "";
}
