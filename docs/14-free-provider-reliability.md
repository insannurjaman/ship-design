# Free Provider Reliability

Ship Design can generate the full 8-artifact package with free-first AI providers, but free APIs often have quota, token, model availability, and request-size limits. Phase 19.2 reduces those failures without adding persistence, auth, payment, or real Figma API write.

## Why Limits Happen

Full package generation uses one AI call per generated artifact. Later artifacts need context from earlier artifacts, so requests can grow quickly if the app passes full markdown every time.

Common free-provider failures:

- Gemini quota exceeded or high-demand 429 responses.
- Groq request too large or tokens-per-minute limits.
- OpenRouter free model unavailable.
- Hugging Face used as a later fallback when other providers fail.

## Context Budgeting

Ship Design now passes summaries instead of full previous artifacts.

- Product Brief uses intake only.
- UX Docs uses Product Brief summary.
- User Flows uses Product Brief and UX Docs summaries.
- Screen List uses Product Brief, UX Docs, and User Flows summaries.
- Design System Kit uses Product Brief, Screen List, and preferred style.
- UI Screens uses Screen List and Design System Kit.
- Landing Page Copy uses Product Brief and UX Docs.
- Handoff Docs uses summaries of all generated artifacts.

The default context cap is:

```env
MAX_CONTEXT_CHARS_PER_AGENT=12000
```

If context is still too long, Ship Design truncates it and appends:

```text
Context was shortened to fit provider limits.
```

## Lite vs Full Package

Use **Lite package** when testing free providers or when quota is tight.

Lite package generates:

- Product Brief
- UX Docs
- User Flows
- Screen List

Full package generates all 8 artifacts:

- Product Brief
- UX Docs
- User Flows
- Screen List
- Design System Kit
- UI Screens
- Landing Page Copy
- Handoff Docs

Unchecked optional artifacts are saved as `skipped` placeholders so the Output Viewer keeps the full package map.

## Provider Fallback

In real mode, Ship Design tries the selected provider first, then configured alternatives, then mock as the final fallback.

Example with `AI_PROVIDER=gemini`:

```text
gemini -> groq -> openrouter -> huggingface -> mock
```

The UI shows a short summary first, such as:

- Gemini quota exceeded
- Groq request too large
- OpenRouter model unavailable
- Final fallback provider: Hugging Face
- Final fallback provider: mock

Raw provider details are kept behind a collapsible details area.

## Recommended Free Testing Settings

```env
AI_GENERATION_MODE=real
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key_if_available
OPENROUTER_API_KEY=your_key_if_available
HF_TOKEN=your_token_if_available
MAX_OUTPUT_TOKENS_PER_AGENT=1400
MAX_CONTEXT_CHARS_PER_AGENT=8000
AI_REQUEST_TIMEOUT_MS=45000
```

OpenRouter free model availability changes. If `openrouter/free` fails, choose a current `:free` model in `.env.local`.

## How To Reduce Quota Or Token Issues

- Start with Lite package.
- Lower `MAX_OUTPUT_TOKENS_PER_AGENT`.
- Lower `MAX_CONTEXT_CHARS_PER_AGENT`.
- Configure more than one real provider key.
- Retry later if Gemini returns quota or high-demand errors.

## Test Checklist

- Generate Lite package and confirm optional artifacts are marked skipped.
- Generate Full package and confirm all 8 artifacts appear when providers allow it.
- Force a Gemini failure and verify fallback is readable.
- Open Output Viewer and confirm warning details do not overflow.
- Regenerate one generated artifact and confirm version history still works.
