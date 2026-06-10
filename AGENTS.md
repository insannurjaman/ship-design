# AGENTS.md

This file gives coding and design agents the working rules for Ship Design.

## Product Summary

Ship Design is an AI-powered product design agent system. It turns one product idea into a structured set of product and design artifacts that can move into Figma, prototyping, a landing page, and developer handoff.

## Current Instruction

Do not create production app UI or production code until explicitly asked.

The current project phase is documentation and product definition.

## Agent Priorities

1. Preserve product clarity.
2. Keep outputs practical for designers, founders, product teams, Codex, Figma, and engineers.
3. Make documentation beginner-friendly without making it shallow.
4. Prefer concrete examples, templates, checklists, and structured outputs.
5. Keep visual direction consistent with the Ship Design style.

## Visual Style Rules

Use an Oxide-inspired technical UI direction without copying Oxide directly.

Design qualities:

- Dark base surfaces
- Acid green accent
- Crisp 1px borders
- Minimal border radius
- Grid-first layouts
- Mono typography for labels, status text, IDs, metadata, and code-like content
- TUI, CLI, terminal, and ASCII-inspired details
- Premium developer-tool SaaS feel

Avoid:

- Rounded, soft consumer-app styling
- Heavy gradients
- Decorative blobs or vague atmospheric effects
- Generic startup landing page patterns
- Overly playful illustration unless explicitly requested
- Copying Oxide brand assets, layouts, or exact styling

## Documentation Standards

Write markdown that is easy to scan.

Every major document should answer:

- What is this?
- Who is it for?
- What does it include?
- How should Codex or Figma use it?
- What decisions are still open?

Use:

- Clear headings
- Short paragraphs
- Tables when comparison helps
- Checklists for quality gates
- Numbered steps for workflows

## Product Artifact Standards

Artifacts should be useful in real product work.

Strategy docs should clarify:

- Audience
- Problem
- Promise
- Differentiation
- MVP scope
- Success metrics

UX docs should clarify:

- Target users
- Jobs to be done
- Assumptions
- Research questions
- Risks

Design docs should clarify:

- User flows
- Screen inventory
- Component needs
- Figma page structure
- Prototype paths
- Handoff expectations

## Figma Expectations

When Figma work begins, structure files so a designer can inspect and edit them easily.

Use predictable pages:

- 00 Cover
- 01 Product Strategy
- 02 Research
- 03 Flows
- 04 Wireframes
- 05 Screens
- 06 Components
- 07 Prototype
- 08 Handoff

Use clear layer names and component names. Avoid decorative complexity that makes inspection difficult.

## Coding Expectations

When code begins later:

- Read the docs first.
- Follow the established visual system.
- Build the actual product experience, not a marketing shell, unless the task is specifically the landing page.
- Keep implementation choices simple until product behavior demands more complexity.
- Add tests when behavior is important or shared.

## Open Questions Log

Add unresolved product, design, or implementation questions here as they appear.

- What is the first target user segment: solo founder, designer, product manager, or agency?
- Should Ship Design generate Figma files directly, export structured specs, or support both?
- Should the MVP include live multi-agent orchestration or a guided single-session workflow first?

