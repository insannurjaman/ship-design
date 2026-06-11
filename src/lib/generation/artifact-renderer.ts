import type { AiGenerateResponse } from "@/lib/ai/types";
import { createArtifactVersion } from "@/lib/generation/artifact-versions";
import type { CreateGenerationRunRequest, GenerationArtifact } from "@/lib/generation/progress";

export type GenerationArtifactSpec = {
  id: GenerationArtifact["id"];
  title: string;
  type: string;
  purpose: string;
  instructions: string[];
};

export const generationArtifactSpecs: GenerationArtifactSpec[] = [
  {
    id: "product-brief",
    title: "Product Brief",
    type: "Strategy",
    purpose: "Turn the product idea into a clear product strategy brief.",
    instructions: [
      "Summarize the audience, problem, promise, MVP scope, constraints, and success signals.",
      "Keep the brief practical enough for a founder, designer, and engineer to review together.",
      "Use concise markdown sections."
    ]
  },
  {
    id: "ux-docs",
    title: "UX Docs",
    type: "Research",
    purpose: "Create lightweight UX research documentation for the first validation pass.",
    instructions: [
      "Include target users, jobs to be done, assumptions, research questions, and product risks.",
      "Keep the output beginner-friendly without being vague.",
      "Use concise markdown sections."
    ]
  },
  {
    id: "user-flows",
    title: "User Flows",
    type: "UX",
    purpose: "Map the first core user flows for the product experience.",
    instructions: [
      "Include the primary flow, secondary flow, and one recovery or error flow.",
      "Write flows as ordered steps that can become screen planning input.",
      "Use concise markdown sections."
    ]
  }
];

export function createArtifactPrompt(input: CreateGenerationRunRequest, spec: GenerationArtifactSpec) {
  return [
    `Create the ${spec.title} artifact for Ship Design.`,
    "",
    `Purpose: ${spec.purpose}`,
    "",
    "Product intake:",
    `- Product name: ${input.productName}`,
    `- Product type: ${input.productType}`,
    `- Target users: ${input.targetUsers}`,
    `- Main problem: ${input.mainProblem}`,
    `- Product goal: ${input.productGoal}`,
    `- Platform: ${input.platform}`,
    `- Requested outputs: ${(input.outputTypes ?? []).join(", ") || "Product Brief, UX Docs, User Flows"}`,
    `- Preferred design style: ${input.preferredStyle || "Ship Design dark technical UI direction"}`,
    "",
    "Output instructions:",
    ...spec.instructions.map((instruction) => `- ${instruction}`),
    "- Do not mention that you are an AI model.",
    "- Do not invent backend integrations, auth, payment, or database requirements.",
    "- Return only the artifact markdown."
  ].join("\n");
}

export function renderGenerationArtifact(
  spec: GenerationArtifactSpec,
  response: AiGenerateResponse
): GenerationArtifact {
  const markdown = response.text.trim() || `# ${spec.title}\n\nNo content was generated.`;
  const body = toBodyLines(markdown);
  const summary = createSummary(body, spec);
  const version = createArtifactVersion({
    version: 1,
    markdown,
    summary,
    body,
    provider: response.provider,
    model: response.model,
    mode: response.mode,
    usage: response.usage,
    warnings: response.warnings,
    attemptedProviders: response.attemptedProviders,
    fallbackUsed: response.fallbackUsed,
    finalProvider: response.finalProvider,
    providerWarnings: response.providerWarnings
  });

  return {
    id: spec.id,
    title: spec.title,
    type: spec.type,
    status: "ready",
    summary,
    body,
    markdown,
    provider: response.provider,
    model: response.model,
    mode: response.mode,
    usage: response.usage,
    warnings: response.warnings,
    attemptedProviders: response.attemptedProviders,
    fallbackUsed: response.fallbackUsed,
    finalProvider: response.finalProvider,
    providerWarnings: response.providerWarnings,
    activeVersion: version.version,
    versions: [version]
  };
}

function toBodyLines(markdown: string) {
  return markdown
    .split(/\n+/)
    .map((line) => line.replace(/^#{1,6}\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

function createSummary(body: string[], spec: GenerationArtifactSpec) {
  const firstUsefulLine = body.find((line) => !line.startsWith("- "));

  if (firstUsefulLine) {
    return firstUsefulLine.slice(0, 180);
  }

  return `${spec.title} generated for the current Ship Design intake.`;
}
