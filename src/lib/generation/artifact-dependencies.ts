import { getActiveArtifactVersion } from "@/lib/generation/artifact-versions";
import { generationArtifactSpecs } from "@/lib/generation/artifact-renderer";
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
    .filter((artifact): artifact is GenerationArtifact => Boolean(artifact))
    .map((artifact) => {
      const version = getActiveArtifactVersion(artifact);

      return [`## ${artifact.title}`, version.markdown].join("\n\n");
    });
  const extraRules = getExtraDependencyRules(artifactId, input);

  return [...dependencySections, extraRules].filter(Boolean).join("\n\n---\n\n");
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
      "Ship Design Figma structure rules:",
      "- Use pages for strategy, research, flows, wireframes, design system, components, desktop prototype, mobile prototype, landing page, edge cases, and dev handoff.",
      "- Use clear layer names and slash-based component names.",
      "- Use variables/tokens as source of truth.",
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
