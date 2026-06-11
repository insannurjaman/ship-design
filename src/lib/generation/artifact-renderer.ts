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
      "Use concise markdown sections.",
      "Avoid generic claims; tie every recommendation to the product intake."
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
      "Use concise markdown sections.",
      "Prioritize research questions that can change product or design decisions."
    ]
  },
  {
    id: "user-flows",
    title: "User Flows",
    type: "UX",
    purpose: "Map the first core user flows for the product experience.",
    agentName: "UX Flow Agent",
    instructions: [
      "Include exactly three sections: Primary Flow, Secondary Flow, and Recovery Flow.",
      "For each flow, include a Nodes list and an Edges list.",
      "Format nodes as '- node-id | Label | Purpose'.",
      "Format edges as '- source-id -> target-id | Condition or action'.",
      "Keep labels short enough to render in a visual diagram."
    ]
  },
  {
    id: "screen-list",
    title: "Screen List",
    type: "Inventory",
    purpose: "Turn strategy, research, and flows into a practical screen inventory.",
    agentName: "Screen Inventory Agent",
    instructions: [
      "Include required screens, purpose, primary content, key components, states, navigation notes, and dependency artifacts.",
      "Use one '## Screen: Screen Name' section per screen.",
      "Use Product Brief, UX Docs, and User Flows as dependencies.",
      "Keep the list implementation-ready for product designers and engineers."
    ]
  },
  {
    id: "design-system-plan",
    title: "Design System Kit",
    type: "Design",
    purpose: "Create a practical design system starter kit for the generated product screens.",
    agentName: "Design System Agent",
    instructions: [
      "Include primitive color palette, semantic tokens, light/dark mapping, typography scale, spacing scale, radius scale, shadow/elevation scale, component list, component state matrix, and Figma variable naming map.",
      "Use clear token names that can become CSS variables, Tailwind config, and Figma variables.",
      "Use Product Brief, Screen List, and preferred design style as dependencies.",
      "Keep the plan aligned to the Ship Design dark technical visual direction."
    ]
  },
  {
    id: "figma-plan",
    title: "UI Screens",
    type: "Figma",
    purpose: "Create Figma-ready UI screen specs that can be manually recreated in Figma.",
    agentName: "Figma Builder Agent",
    instructions: [
      "Create structured UI screen specs, not a generic Figma organization plan.",
      "Use one '## Screen: Screen Name' section per screen.",
      "For each screen include: route or screen id, device target, purpose, layout sections, components, main copy, states, interaction notes, and design notes.",
      "Make screens concrete enough to recreate manually in Figma.",
      "Use Screen List and Design System Kit as dependencies.",
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
      "Include sections for Hero, Pain Points, Solution, Features, How It Works, Social Proof Placeholder, FAQ, and Final CTA.",
      "Write copy that can be pasted directly into a landing page wireframe.",
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
      "Summarize product decisions, screens, flows, design system, UI screens, states, QA checklist, implementation notes, and open questions.",
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
    ...getPlatformInstructions(input.platform, spec).map((instruction) => `- ${instruction}`),
    "- Do not mention that you are an AI model.",
    "- Do not include internal reasoning, chain-of-thought, <think> tags, or preambles like 'Okay, I need to'.",
    "- Do not wrap the response in markdown code fences.",
    "- Avoid empty duplicate sections and generic filler.",
    "- Do not invent backend integrations, auth, payment, or database requirements.",
    "- Return only the artifact markdown.",
    dependencyContext ? ["", "Dependency context:", dependencyContext].join("\n") : ""
  ].join("\n");
}

function getPlatformInstructions(
  platform: CreateGenerationRunRequest["platform"],
  spec: GenerationArtifactSpec
) {
  const platformLabel = platform === "mobile" ? "mobile app" : "desktop web";
  const shared = [`Design for one target platform only: ${platformLabel}. Do not create combined mobile and desktop guidance.`];

  if (platform === "mobile") {
    if (spec.id === "screen-list") {
      return [...shared, "Prioritize mobile screens, mobile navigation, compact states, and mobile-first interaction patterns."];
    }

    if (spec.id === "design-system-plan") {
      return [...shared, "Include mobile-first component sizing, tap targets, spacing, density, and responsive constraints."];
    }

    if (spec.id === "figma-plan") {
      return [...shared, "Reference mobile frame previews and mobile prototype structure only."];
    }

    if (spec.id === "handoff-docs") {
      return [...shared, "Include mobile implementation notes, mobile states, and mobile QA checks."];
    }
  }

  if (spec.id === "screen-list") {
    return [...shared, "Prioritize desktop/web screens, dashboard layouts, navigation structure, and desktop interaction states."];
  }

  if (spec.id === "design-system-plan") {
    return [...shared, "Include desktop/web component sizing, layout density, keyboard/focus behavior, and responsive desktop constraints."];
  }

  if (spec.id === "figma-plan") {
    return [...shared, "Reference desktop/web frame previews and desktop prototype structure only."];
  }

  if (spec.id === "handoff-docs") {
    return [...shared, "Include responsive desktop implementation notes, desktop states, and web QA checks."];
  }

  return shared;
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
