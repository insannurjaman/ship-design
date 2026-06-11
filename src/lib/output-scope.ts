import type { GenerationArtifactId } from "@/lib/generation/progress";

export const supportedV1Outputs = [
  "Product Brief",
  "UX Docs",
  "User Flows",
  "Screen List",
  "Design System Plan",
  "Figma Plan",
  "Landing Page Copy",
  "Handoff Docs"
] as const;

export const futureOutputs = [] as const;

export const outputScopeHelperText =
  "Ship Design can generate 8 artifacts from one intake. Full packages use multiple AI calls; if free providers hit limits, generate fewer artifacts first.";

export const requiredOutputLabels = ["Product Brief", "UX Docs", "User Flows"] as const;

export const litePackageOutputs = ["Product Brief", "UX Docs", "User Flows", "Screen List"] as const;

export const artifactIdByOutputLabel: Record<(typeof supportedV1Outputs)[number], GenerationArtifactId> = {
  "Product Brief": "product-brief",
  "UX Docs": "ux-docs",
  "User Flows": "user-flows",
  "Screen List": "screen-list",
  "Design System Plan": "design-system-plan",
  "Figma Plan": "figma-plan",
  "Landing Page Copy": "landing-page-copy",
  "Handoff Docs": "handoff-docs"
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

  return selectedIds;
}
