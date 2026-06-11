# Ship Design

Ship Design is an AI-powered product design agent system. It helps designers, founders, and product teams turn one product idea into a complete product design package.

The system guides a user from an early idea to strategy, research, visual flows, screen planning, a design system kit, UI screen specs, landing page copy, and developer handoff documentation.

## What Ship Design Creates

1. Product Brief
2. UX Docs
3. User flows
4. Screen List
5. Design System Kit
6. UI Screens
7. Landing Page Copy
8. Handoff Docs

## Product Positioning

Ship Design is for people who need to move from product intent to design execution without losing clarity.

It does not replace designers. It gives teams a structured design partner that can ask better questions, organize decisions, produce useful artifacts, and prepare work for Figma and engineering.

Ship Design V1 generates one target platform per run:

- Mobile
- Desktop

Users can create another run later for the other platform.

## Visual Direction

Ship Design should feel like a premium technical design tool:

- Dark interface
- Acid green accent
- Crisp 1px borders
- Minimal radius
- Mono typography for labels, status, metadata, and code-like content
- Grid-based layouts
- TUI, CLI, and ASCII-inspired interface details
- Calm, precise, developer-tool SaaS quality

Oxide can be used as inspiration for atmosphere and technical restraint, but the product must have its own identity.

## Documentation Map

- [Project Brief](./docs/00-project-brief.md)
- [Product Requirements](./docs/01-product-requirements.md)
- [Agent System Overview](./docs/02-agent-system-overview.md)
- [User Flows](./docs/03-user-flows.md)
- [Screen List](./docs/04-screen-list.md)
- [Design System Kit](./docs/05-design-system-plan.md)
- [Figma Structure](./docs/06-figma-structure.md)
- [Quality Checklist](./docs/07-quality-checklist.md)
- [Landing Page Strategy](./docs/08-landing-page-strategy.md)
- [MVP Roadmap](./docs/09-mvp-roadmap.md)
- [Real AI Generation Architecture](./docs/10-real-ai-generation-architecture.md)

## Current Phase

Ship Design currently has:

- Product and agent documentation
- A Next.js app foundation
- A real AI provider gateway with mock mode as the default
- 8-artifact generation with Lite and Full package options
- Provider fallback for free-first AI providers
- Context budgeting for downstream artifact generation
- Artifact regeneration and version history
- Visual artifact review for user flows, UI screens, and design system kits
- Copy output, markdown export, and local mock Figma package preparation
- A token-based dark technical UI direction

Persistent database storage, authentication, payments, and live Figma API writes are not connected yet.
