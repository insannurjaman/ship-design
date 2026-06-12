import type { GenerationArtifactId } from "@/lib/generation/progress";

export const supportedV1Outputs = [
  "Product Brief",
  "UX Docs",
  "User Flows",
  "Screen List",
  "Design System Kit",
  "UI Screens",
  "Landing Page Copy",
  "Handoff Docs"
] as const;

export const futureOutputs = [] as const;

export const outputScopeHelperText =
  "Lite is recommended for free providers. Full package creates all 8 artifacts, uses more AI calls, and may trigger free provider limits.";

export const requiredOutputLabels = ["Product Brief", "UX Docs", "User Flows"] as const;

export const litePackageOutputs = ["Product Brief", "UX Docs", "User Flows", "Screen List"] as const;

export const artifactIdByOutputLabel: Record<(typeof supportedV1Outputs)[number], GenerationArtifactId> = {
  "Product Brief": "product-brief",
  "UX Docs": "ux-docs",
  "User Flows": "user-flows",
  "Screen List": "screen-list",
  "Design System Kit": "design-system-plan",
  "UI Screens": "figma-plan",
  "Landing Page Copy": "landing-page-copy",
  "Handoff Docs": "handoff-docs"
};

const legacyArtifactIdByOutputLabel: Record<string, GenerationArtifactId> = {
  "Design System Plan": "design-system-plan",
  "Figma Plan": "figma-plan"
};

export const outputLabelByArtifactId = Object.fromEntries(
  Object.entries(artifactIdByOutputLabel).map(([label, id]) => [id, label])
) as Record<GenerationArtifactId, (typeof supportedV1Outputs)[number]>;

export function normalizeSelectedOutputIds(outputTypes?: string[]) {
  const selectedLabels = new Set(outputTypes?.length ? outputTypes : supportedV1Outputs);
  const requiredLabels = new Set<string>(requiredOutputLabels);
  const selectedIds = new Set<GenerationArtifactId>();

  for (const label of supportedV1Outputs) {
    if (requiredLabels.has(label) || selectedLabels.has(label)) {
      selectedIds.add(artifactIdByOutputLabel[label]);
    }
  }

  for (const label of selectedLabels) {
    const legacyId = legacyArtifactIdByOutputLabel[label];

    if (legacyId) selectedIds.add(legacyId);
  }

  return selectedIds;
}
