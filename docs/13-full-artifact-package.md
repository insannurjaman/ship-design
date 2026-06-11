# Full Artifact Package

## What This Is

Phase 19 expands Ship Design from a 3-artifact test pipeline into the full 8-artifact design package.

The app still uses in-memory runs, mock mode remains available, and Figma is still a local mock package step.

## The 8 Artifact Types

Ship Design now generates these artifacts in order:

| Order | Artifact | Agent |
| --- | --- | --- |
| 1 | Product Brief | Product Strategy Agent |
| 2 | UX Docs | UX Research Agent |
| 3 | User Flows | UX Flow Agent |
| 4 | Screen List | Screen Inventory Agent |
| 5 | Design System Kit | Design System Agent |
| 6 | UI Screens | Figma Builder Agent |
| 7 | Landing Page Copy | Landing Page Agent |
| 8 | Handoff Docs | QA Handoff Agent |

## Dependency Order

Generation is sequential so later artifacts can use earlier artifacts as context.

| Artifact | Uses |
| --- | --- |
| Screen List | Product Brief, UX Docs, User Flows |
| Design System Kit | Product Brief, Screen List, preferred design style |
| UI Screens | Screen List, Design System Kit, UI screen structure rules |
| Landing Page Copy | Product Brief, UX Docs, target users, product goal |
| Handoff Docs | All generated artifacts and developer implementation notes |

## Regeneration Behavior

Every artifact supports targeted regeneration.

Regeneration:

1. Reads the original intake.
2. Reads the selected artifact's active version.
3. Reads relevant dependency artifacts.
4. Applies optional user feedback.
5. Creates a new artifact version.
6. Makes the new version active.
7. Keeps older versions archived.

Regeneration does not automatically regenerate downstream artifacts.

## Stale Downstream Behavior

When an upstream artifact changes, related downstream artifacts are marked `needs-review`.

| Regenerated artifact | Marked needs-review |
| --- | --- |
| Product Brief | UX Docs, User Flows, Screen List, Design System Kit, UI Screens, Landing Page Copy, Handoff Docs |
| UX Docs | User Flows, Screen List, Landing Page Copy, Handoff Docs |
| User Flows | Screen List, Design System Kit, UI Screens, Handoff Docs |
| Screen List | Design System Kit, UI Screens, Handoff Docs |
| Design System Kit | UI Screens, Handoff Docs |
| UI Screens | Handoff Docs |
| Landing Page Copy | Handoff Docs |
| Handoff Docs | None |

## Copy And Export Behavior

Copy Output and Export use active artifact versions only.

Export order:

1. Product Brief
2. UX Docs
3. User Flows
4. Screen List
5. Design System Kit
6. UI Screens
7. Landing Page Copy
8. Handoff Docs

## Mock Figma Package Behavior

Prepare Figma Package remains local and mock-only.

The UI should keep this message visible:

> Figma API is not connected yet. This prepares a local package only.

The mock package should use all 8 active artifacts.

## How To Test Full Package Generation

1. Start with mock mode:

```bash
AI_GENERATION_MODE=mock
```

2. Create a new project from `/projects/new`.
3. Open the generated Output Viewer.
4. Confirm 8 tabs exist.
5. Confirm every artifact starts at active version 1.
6. Regenerate Product Brief.
7. Confirm Product Brief becomes version 2 and downstream artifacts are marked `needs-review`.
8. Export the package and confirm all 8 active artifacts are included in order.

For real provider testing, set `AI_GENERATION_MODE=real` and configure a provider key. The provider fallback chain still applies.
