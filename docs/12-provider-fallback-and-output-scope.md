# Provider Fallback And Output Scope

## What This Is

This document explains the Phase 17.7 reliability rules for Ship Design. Phase 19 expands the generated package to all 8 artifacts.

It covers two important truths:

1. Phase 19 generation creates eight artifacts.
2. Real AI mode should try configured real providers before using mock generation.

## Current Supported Outputs

Ship Design currently generates:

| Output | Status | Notes |
| --- | --- | --- |
| Product Brief | Generated in V1 | Product strategy and MVP framing. |
| UX Docs | Generated in V1 | Lightweight research assumptions, questions, and risks. |
| User Flows | Generated in V1 | Primary, secondary, and recovery flows. |
| Screen List | Generated in V1 | Screen inventory and state coverage. |
| Design System Kit | Generated in V1 | Tokens, components, states, and responsive behavior. |
| UI Screens | Generated in V1 | Figma-ready UI screen specs and manual recreation guidance. |
| Landing Page Copy | Generated in V1 | Marketing page structure and copy. |
| Handoff Docs | Generated in V1 | Developer handoff, QA checks, and open decisions. |

All 8 outputs should be selectable in the New Project form.

## Provider Fallback Rules

Mock mode remains the default. If `AI_GENERATION_MODE` is not `real`, Ship Design uses the mock provider only.

When `AI_GENERATION_MODE=real`, Ship Design tries the selected provider first, then other configured real providers, and only uses mock after real providers are unavailable or fail.

| `AI_PROVIDER` | Fallback order |
| --- | --- |
| `gemini` | gemini -> groq -> openrouter -> huggingface -> mock |
| `groq` | groq -> gemini -> openrouter -> huggingface -> mock |
| `openrouter` | openrouter -> gemini -> groq -> huggingface -> mock |
| `huggingface` | huggingface -> gemini -> groq -> openrouter -> mock |

Only real providers with API keys are attempted. Missing-key providers are skipped and recorded in provider warnings when relevant.

## Response Metadata

Generated runs should expose:

| Field | Meaning |
| --- | --- |
| `provider` | Provider that produced the artifact/run content. |
| `mode` | `real` or `mock`. |
| `model` | Model used by the final provider. |
| `attemptedProviders` | Providers that were actually attempted. |
| `fallbackUsed` | `true` when the selected real provider was not the final successful path. |
| `finalProvider` | Provider that finally produced the content. |
| `providerWarnings` | Human-readable provider failures, missing-key notes, or final fallback notes. |

The Output Viewer should show fallback warnings only when `fallbackUsed` is true.

## How To Test Gemini To Groq Fallback

Use a local, untracked `.env.local`:

```bash
AI_GENERATION_MODE=real
AI_PROVIDER=gemini
GEMINI_API_KEY=invalid_or_temporarily_bad
GROQ_API_KEY=valid_key
```

Then submit `/projects/new`.

Expected result:

- Gemini fails.
- Groq succeeds.
- Provider shows `groq`.
- Mode remains `real`.
- Fallback shows `yes`.
- Attempted providers include `gemini -> groq`.
- Output content is not mock content.

## How To Verify Mock Is Only Final Fallback

Use:

```bash
AI_GENERATION_MODE=real
AI_PROVIDER=gemini
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
HF_TOKEN=
```

Then submit `/projects/new`.

Expected result:

- Final provider is `mock`.
- Mode is `mock`.
- Fallback shows `yes`.
- Provider warning says no configured real provider could be used.
- The app still returns generated artifacts so the workflow can continue.

## Browser Issue Badge Note

During Phase 17.7 planning, fresh browser loads of `/projects/new` and `/projects/project-forge/outputs?generated=1` showed no console warnings or errors. If the red Next.js issue badge appears after earlier runtime failures, clear `.next`, restart the dev server, and reload the route.

If the badge returns with live errors, fix the reported runtime or hydration issue before moving to Phase 18.
