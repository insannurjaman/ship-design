import type { AiGenerateResponse } from "@/lib/ai/types";
import { createArtifactSummaryData } from "@/lib/generation/artifact-summary";
import { createArtifactVersion } from "@/lib/generation/artifact-versions";
import {
  createArtifactSummary,
  markdownToBodyLines,
  normalizeMarkdownForDisplay
} from "@/lib/generation/markdown-cleanup";
import type { CreateGenerationRunRequest, GenerationArtifact } from "@/lib/generation/progress";

export type GenerationArtifactSpec = {
  id: GenerationArtifact["id"];
  title: string;
  type: string;
  purpose: string;
  instructions: string[];
  agentName: string;
};

export const generationArtifactSpecs: GenerationArtifactSpec[] = [
  {
    id: "product-brief",
    title: "Product Brief",
    type: "Strategy",
    purpose: "Turn the product idea into a clear product strategy brief.",
    agentName: "Product Strategy Agent",
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
    agentName: "UX Research Agent",
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
    agentName: "UX Flow Agent",
    instructions: [
      "Include the primary flow, secondary flow, and one recovery or error flow.",
      "Write flows as ordered steps that can become screen planning input.",
      "Use concise markdown sections."
    ]
  },
  {
    id: "screen-list",
    title: "Screen List",
    type: "Inventory",
    purpose: "Turn strategy, research, and flows into a practical screen inventory.",
    agentName: "Screen Inventory Agent",
    instructions: [
      "Include required screens, purpose, primary content, important states, and navigation notes.",
      "Use Product Brief, UX Docs, and User Flows as dependencies.",
      "Keep the list implementation-ready for product designers and engineers."
    ]
  },
  {
    id: "design-system-plan",
    title: "Design System Plan",
    type: "Design",
    purpose: "Create a design system plan for the generated product screens.",
    agentName: "Design System Agent",
    instructions: [
      "Include tokens, typography, components, interaction states, and responsive behavior.",
      "Use Product Brief, Screen List, and preferred design style as dependencies.",
      "Keep the plan aligned to the Ship Design dark technical visual direction."
    ]
  },
  {
    id: "figma-plan",
    title: "Figma Plan",
    type: "Figma",
    purpose: "Plan the Figma structure needed for pages, frames, components, prototype, and handoff.",
    agentName: "Figma Builder Agent",
    instructions: [
      "Include Figma pages, frame groups, component organization, naming, and prototype notes.",
      "Use Screen List and Design System Plan as dependencies.",
      "Follow Ship Design Figma organization rules and keep real Figma API work out of scope."
    ]
  },
  {
    id: "landing-page-copy",
    title: "Landing Page Copy",
    type: "Marketing",
    purpose: "Create landing page messaging for the generated product concept.",
    agentName: "Landing Page Agent",
    instructions: [
      "Include hero copy, subcopy, proof points, workflow sections, CTA text, and FAQ ideas.",
      "Use Product Brief, UX Docs, target users, and product goal as dependencies.",
      "Avoid generic startup claims and keep copy specific to the product."
    ]
  },
  {
    id: "handoff-docs",
    title: "Handoff Docs",
    type: "Engineering",
    purpose: "Create developer handoff documentation for the full generated package.",
    agentName: "QA Handoff Agent",
    instructions: [
      "Include implementation notes, routes/screens, component needs, states, QA checks, and open decisions.",
      "Use all generated artifacts as dependencies.",
      "Keep the handoff useful for Codex, engineers, and designers reviewing the package."
    ]
  }
];

export function createArtifactPrompt(
  input: CreateGenerationRunRequest,
  spec: GenerationArtifactSpec,
  dependencyContext = ""
) {
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
    `- Requested outputs: ${(input.outputTypes ?? []).join(", ") || generationArtifactSpecs.map((item) => item.title).join(", ")}`,
    `- Preferred design style: ${input.preferredStyle || "Ship Design dark technical UI direction"}`,
    "",
    "Output instructions:",
    ...spec.instructions.map((instruction) => `- ${instruction}`),
    "- Do not mention that you are an AI model.",
    "- Do not invent backend integrations, auth, payment, or database requirements.",
    "- Return only the artifact markdown.",
    dependencyContext ? ["", "Dependency context:", dependencyContext].join("\n") : ""
  ].join("\n");
}

export function getGenerationArtifactSpec(artifactId: GenerationArtifact["id"]) {
  return generationArtifactSpecs.find((spec) => spec.id === artifactId);
}

export function renderGenerationArtifact(
  spec: GenerationArtifactSpec,
  response: AiGenerateResponse
): GenerationArtifact {
  const markdown = normalizeMarkdownForDisplay(response.text.trim() || `# ${spec.title}\n\nNo content was generated.`);
  const body = markdownToBodyLines(markdown);
  const summary = createArtifactSummary(markdown, spec.title);
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
    provider: response.provider,
    model: response.model,
    mode: response.mode,
    usage: response.usage,
    warnings: response.warnings,
    attemptedProviders: response.attemptedProviders,
    fallbackUsed: response.fallbackUsed,
    finalProvider: response.finalProvider,
    providerWarnings: response.providerWarnings,
    providerDiagnostics: response.providerDiagnostics
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
    providerDiagnostics: response.providerDiagnostics,
    activeVersion: version.version,
    versions: [version],
    summaryData
  };
}
