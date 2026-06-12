import "server-only";

import type { AiGenerateResponse, AiProvider, AiProviderConfig } from "./types";
import { joinMessagesForPrompt, resolveRequestModel } from "./providers";

export function createMockProvider(config: AiProviderConfig): AiProvider {
  return {
    id: "mock",
    displayName: "Mock",
    isConfigured: () => true,
    async generate(request): Promise<AiGenerateResponse> {
      const prompt = joinMessagesForPrompt(request);
      const text = createMockArtifactText(prompt);

      return {
        provider: "mock",
        model: resolveRequestModel(request, config),
        mode: "mock",
        text,
        usage: {
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: Math.ceil(text.length / 4),
          totalTokens: Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4)
        },
        warnings: [],
        attemptedProviders: ["mock"],
        fallbackUsed: false,
        finalProvider: "mock",
        providerWarnings: []
      };
    }
  };
}

function createMockArtifactText(prompt: string) {
  const productName = /Product name:\s*(.+)/i.exec(prompt)?.[1]?.trim() || "Forge Brief";
  const platform = /Platform:\s*(mobile|desktop)/i.exec(prompt)?.[1]?.trim() || "mobile";

  if (/Create the User Flows artifact/i.test(prompt)) {
    return [
      "# User Flows",
      "",
      "## Primary Flow",
      "### Nodes",
      `- start | Start ${productName} | User opens the ${platform} experience`,
      "- intake | Complete intake | User provides core product context",
      "- review | Review package | User checks generated artifacts",
      "- approve | Approve output | User copies or exports the package",
      "### Edges",
      "- start -> intake | Tap create project",
      "- intake -> review | Generate package",
      "- review -> approve | Output is useful",
      "",
      "## Secondary Flow",
      "### Nodes",
      "- review | Review package | User checks a specific artifact",
      "- regenerate | Regenerate artifact | User adds feedback",
      "- compare | Compare versions | User reviews active and archived versions",
      "### Edges",
      "- review -> regenerate | Needs refinement",
      "- regenerate -> compare | New version created",
      "",
      "## Recovery Flow",
      "### Nodes",
      "- error | Provider issue | Generation cannot finish with selected provider",
      "- fallback | Fallback provider | Ship Design tries configured alternatives",
      "- output | Output ready | Package remains available",
      "### Edges",
      "- error -> fallback | Provider fails",
      "- fallback -> output | Alternate provider or mock succeeds"
    ].join("\n");
  }

  if (/Create the UX Docs artifact/i.test(prompt)) {
    return [
      "# UX Docs",
      "",
      "## Target Users",
      "- Primary users need fast clarity from messy product ideas.",
      "- Secondary reviewers need enough structure to approve design direction.",
      "",
      "## Jobs To Be Done",
      "- When starting a new product package, users want to describe the idea once and receive useful planning artifacts.",
      "- When reviewing output, users want clear artifacts they can copy, export, or recreate in Figma.",
      "",
      "## Assumptions",
      "- Users prefer a focused platform per generation run.",
      "- Free providers work better when users start with Lite packages.",
      "",
      "## Research Questions",
      "- Which generated artifact becomes the strongest source of truth?",
      "- Where do users need regeneration before handoff?",
      "",
      "## Risks",
      "- Generic output if intake is too vague.",
      "- Provider quota limits during Full package generation."
    ].join("\n");
  }

  if (/Create the UI Screens artifact/i.test(prompt)) {
    return [
      "# UI Screens",
      "",
      "## Screen: Project Intake",
      "- Route: /projects/new",
      `- Device target: ${platform}`,
      `- Purpose: Capture source material for ${productName}.`,
      "- Layout sections: App bar, guided intake, package selector, readiness summary",
      "- Components: Inputs, textarea fields, segmented platform control, checklist rows, primary CTA",
      "- Main copy: Describe the product once. Ship Design creates the design package.",
      "- States: Empty, ready, generating, validation warning",
      "- Interaction notes: Generate starts the agent run and locks controls while pending.",
      "- Design notes: Dark technical panel, acid green ready state, crisp 1px borders.",
      "",
      "## Screen: Output Review",
      "- Route: /projects/generated/outputs",
      `- Device target: ${platform}`,
      "- Purpose: Review, copy, export, and prepare generated artifacts.",
      "- Layout sections: Artifact tabs, artifact canvas, metadata row, package map",
      "- Components: Tabs, badges, status pills, visual artifact cards, copy buttons",
      "- Main copy: Review package outputs.",
      "- States: Ready, needs-review, skipped, fallback warning",
      "- Interaction notes: Artifact tabs swap active output without leaving the page.",
      "- Design notes: Keep the artifact content as the visual focus."
    ].join("\n");
  }

  if (/Create the Design System Kit artifact/i.test(prompt)) {
    return [
      "# Design System Kit",
      "",
      "## Primitive Color Palette",
      "| Token | Value | Usage |",
      "| --- | --- | --- |",
      "| color.background.base | #080A08 | App background |",
      "| color.surface.panel | #111511 | Cards and panels |",
      "| color.accent.primary | #B6FF4D | Primary actions |",
      "",
      "## Semantic Tokens",
      "- background/base: color.background.base",
      "- background/panel: color.surface.panel",
      "- action/primary: color.accent.primary",
      "- border/default: #263126",
      "",
      "## Typography Scale",
      "- Page title: 32px / 40px / sans",
      "- Section title: 20px / 28px / sans",
      "- Mono label: 12px / 16px / mono uppercase",
      "",
      "## Spacing Scale",
      "- space-xs: 4px",
      "- space-sm: 8px",
      "- space-md: 16px",
      "- space-lg: 24px",
      "",
      "## Radius Scale",
      "- radius-xs: 2px",
      "- radius-sm: 4px",
      "- radius-md: 6px",
      "",
      "## Component State Matrix",
      "| Component | Default | Hover | Focus | Disabled | Error |",
      "| --- | --- | --- | --- | --- | --- |",
      "| Button | Panel accent | Brighter accent | Focus ring | Muted | Danger |",
      "| Input | Dark field | Strong border | Accent border | Muted | Danger border |"
    ].join("\n");
  }

  if (/Create the Screen List artifact/i.test(prompt)) {
    return [
      "# Screen List",
      "",
      "## Screen: Project Intake",
      "- Purpose: Gather product source material.",
      "- Primary content: Product name, users, problem, goal, platform, package choice.",
      "- Key components: Form fields, package cards, readiness checklist.",
      "- States: Empty, ready, generating, validation warning.",
      "- Navigation notes: Continue to workflow progress after generation.",
      "- Dependency artifacts: Product Brief, UX Docs, User Flows.",
      "",
      "## Screen: Output Review",
      "- Purpose: Let users inspect and use generated artifacts.",
      "- Primary content: Artifact tabs, content renderer, version history, package map.",
      "- Key components: Tabs, badges, copy/export buttons, local Figma prep.",
      "- States: Ready, skipped, needs-review, fallback warning.",
      "- Navigation notes: Back to progress or regenerate one artifact.",
      "- Dependency artifacts: User Flows, Design System Kit."
    ].join("\n");
  }

  if (/Create the Landing Page Copy artifact/i.test(prompt)) {
    return [
      "# Landing Page Copy",
      "",
      "## Hero",
      `Headline: Turn one ${productName} idea into a design-ready package.`,
      "Subcopy: Ship Design runs focused product agents that create strategy, UX, screens, UI specs, and handoff notes.",
      "CTA: Generate design package",
      "",
      "## Pain Points",
      "- Product ideas are scattered across notes and calls.",
      "- Design prep takes too many manual passes.",
      "- Figma handoff lacks clear structure.",
      "",
      "## Solution",
      "Ship Design converts one guided intake into practical artifacts your team can review, copy, export, and recreate in Figma.",
      "",
      "## Features",
      "- Agent-generated product strategy",
      "- Visual flows and screen specs",
      "- Design system starter kit",
      "",
      "## How It Works",
      "1. Describe the product",
      "2. Choose Lite or Full package",
      "3. Review and export artifacts",
      "",
      "## Social Proof Placeholder",
      "Designed for founders, product strategists, and lean design teams.",
      "",
      "## FAQ",
      "Q: Does it write to Figma automatically?",
      "A: Not yet. V1 prepares manual Figma-ready output.",
      "",
      "## Final CTA",
      "Create your first design package."
    ].join("\n");
  }

  if (/Create the Handoff Docs artifact/i.test(prompt)) {
    return [
      "# Handoff Docs",
      "",
      "## Product Overview",
      `${productName} should focus on one ${platform} platform per run for clearer design output.`,
      "",
      "## Design Decisions",
      "- Use one focused platform per run.",
      "- Keep manual Figma-ready output clear and copyable.",
      "",
      "## Screens And Routes",
      "- Project Intake",
      "- Workflow Progress",
      "- Output Review",
      "",
      "## Component Notes",
      "- Use dark technical surfaces, acid green accents, 1px borders, and mono labels.",
      "- Reuse cards, tabs, buttons, status pills, and progress indicators.",
      "",
      "## States And Edge Cases",
      "- Empty intake",
      "- Generation running",
      "- Provider fallback",
      "- Skipped optional artifacts",
      "",
      "## QA Checklist",
      "- Check loading, empty, success, skipped, fallback, and error states.",
      "- Verify copy/export works with active artifact versions.",
      "",
      "## Open Questions",
      "- Which artifacts should be persisted first in Phase 20?",
      "",
      "## Implementation Notes",
      "- Keep generation server-side.",
      "- Do not expose provider keys to client components.",
      `- Tune implementation details for ${platform} first.`
    ].join("\n");
  }

  return [
    "# Product Brief",
    "",
    "## Executive Summary",
    `${productName} helps teams turn one focused ${platform} product idea into a practical design package.`,
    "",
    "## Audience",
    "Founders, product strategists, designers, and engineers who need clearer product planning output.",
    "",
    "## Problem",
    "Teams lose clarity when product ideas move from notes into design and engineering.",
    "",
    "## Promise",
    "One guided intake becomes a focused design package with practical artifacts.",
    "",
    "## MVP Scope",
    "- Guided product intake",
    "- Agent-generated artifacts",
    "- Output review, copy, export, and manual Figma-ready package prep",
    "",
    "## Constraints",
    "- No database persistence yet",
    "- Manual Figma-ready workflow only",
    "- One platform per generation run",
    "",
    "## Success Signals",
    "- User can generate a useful first package from one intake.",
    "- User can copy structured artifacts into design and engineering workflows.",
    "",
    "## Next Design Implications",
    "- Prioritize clear progress and artifact review.",
    "- Keep every visual output easy to recreate manually in Figma."
  ].join("\n");
}
