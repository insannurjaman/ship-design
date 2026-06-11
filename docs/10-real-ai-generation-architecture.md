# 10 Real AI Generation Architecture

## Purpose

This document explains how Ship Design should move from local mock generation to real AI generation.

It is beginner-friendly on purpose. The goal is to make the next implementation step clear without adding real OpenAI, Figma, database, authentication, or payment logic too early.

## 1. How User Input Becomes Agent Tasks

The user starts by filling out the New Project form.

The app should turn that form into four things:

1. A `Project`
2. A `GenerationRun`
3. A list of `AgentTask` records
4. A shared project context object

Recommended flow:

1. User submits the New Project form.
2. Server validates the form.
3. Server creates a project.
4. Server creates a generation run for that project.
5. Orchestrator creates the agent task list.
6. Each agent task receives only the context it needs.
7. Completed agent outputs are saved as artifacts.
8. Downstream agents use approved previous artifacts as context.

Default agent order:

1. Product Strategy Agent
2. UX Research Agent
3. UX Flow Agent
4. Design System Agent
5. Figma Builder Agent
6. Prototype Agent
7. Landing Page Agent
8. QA Handoff Agent

## 2. How Each Agent Prompt Works

Every agent prompt should use the same shape.

```txt
SYSTEM:
You are the [Agent Name] for Ship Design.
Follow Ship Design product, design, and documentation standards.

CONTEXT:
- Product idea
- Product type
- Target users
- Main problem
- Product goal
- Platform
- Selected output types
- Approved previous artifacts
- Open questions
- Visual direction

TASK:
Create the requested artifact.

OUTPUT FORMAT:
Return structured JSON with:
- title
- summary
- sections
- decisions
- openQuestions
- nextRecommendedActions
```

Agent prompts should not start from scratch. They should inherit approved decisions from earlier agents.

Example:

- UX Research Agent reads the Product Strategy output.
- UX Flow Agent reads Product Strategy and UX Research.
- Design System Agent reads Screen List and visual direction.
- Figma Builder Agent reads Screen List and Design System Kit.

## 3. How Outputs Are Stored

Store outputs in two formats:

1. Structured JSON for the app UI
2. Markdown for export and handoff

Recommended records:

| Record | Purpose |
| --- | --- |
| `Project` | Main product idea and user inputs |
| `GenerationRun` | One full AI generation attempt |
| `AgentTask` | One agent's work inside a run |
| `Artifact` | Final user-facing output |
| `ArtifactVersion` | Previous versions after regeneration |
| `ActivityLog` | Timeline events shown in the UI |

Important artifact fields:

- `projectId`
- `taskId`
- `type`
- `title`
- `status`
- `contentJson`
- `contentMarkdown`
- `version`
- `createdAt`
- `updatedAt`

## 4. How Regeneration Works

Regeneration should be targeted.

The user should be able to regenerate:

1. One artifact
2. One section inside an artifact
3. All downstream artifacts affected by a changed decision

Recommended V1 behavior:

1. User clicks `Regenerate section`.
2. User can add optional feedback.
3. App creates a new agent task.
4. Old artifact remains saved as a previous version.
5. New output becomes the latest draft.
6. Downstream artifacts are marked `needs-review`.

Example:

If the UX Research artifact is regenerated, these may need review:

- User Flows
- Screen List
- Design System Kit
- UI Screens
- Landing Page Copy
- Handoff Docs

## 5. How Errors Are Handled

Use clear statuses:

- `queued`
- `running`
- `complete`
- `needs_review`
- `failed`
- `cancelled`

Common error types:

- Missing input
- Model timeout
- Invalid JSON response
- Cost limit reached
- Safety refusal
- Figma integration failure
- Unknown error

Recommended handling:

1. Retry temporary model errors once.
2. If JSON is invalid, ask the model to repair the JSON once.
3. If it still fails, save the error to the task.
4. Keep completed artifacts.
5. Show a clear recovery action in the UI.

Good recovery actions:

- Retry task
- Edit input
- Skip for now
- Regenerate from previous step
- Continue with completed artifacts

## 6. How Cost Can Be Controlled

Cost controls should be built in before real generation is enabled.

Recommended controls:

- Maximum cost per generation run
- Maximum retries per agent
- Maximum output tokens per agent
- Cheaper model for simple agents
- Stronger model only for synthesis-heavy agents
- Summarized previous artifacts instead of full raw context
- User-selected output types
- Stop generation if required inputs are missing

Suggested starting limits:

```txt
MAX_RUN_COST_USD=2.00
MAX_AGENT_RETRIES=1
MAX_OUTPUT_TOKENS_PER_AGENT=2500
AI_REQUEST_TIMEOUT_MS=60000
```

## 7. Files That Need To Be Created

Recommended future structure:

```txt
src/lib/ai/
  client.ts
  models.ts
  prompts.ts
  schemas.ts
  cost.ts
  errors.ts

src/lib/agents/
  orchestrator.ts
  product-strategy-agent.ts
  ux-research-agent.ts
  ux-flow-agent.ts
  design-system-agent.ts
  figma-builder-agent.ts
  prototype-agent.ts
  landing-page-agent.ts
  qa-handoff-agent.ts

src/lib/generation/
  create-run.ts
  run-agent-task.ts
  regenerate-artifact.ts
  artifact-renderer.ts
  progress.ts

src/app/api/projects/
  route.ts

src/app/api/generation-runs/
  route.ts

src/app/api/generation-runs/[runId]/
  route.ts

src/app/api/generation-runs/[runId]/regenerate/
  route.ts
```

Database files can come later:

```txt
src/lib/db/
  schema.ts
  queries.ts
```

## 8. Environment Variables Needed

Use `.env.example` as the source of truth for required keys.

Minimum AI variables:

```env
AI_GENERATION_MODE=mock
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_FAST_MODEL=
GEMINI_DEFAULT_MODEL=
GEMINI_REASONING_MODEL=
GROQ_API_KEY=
GROQ_FAST_MODEL=
GROQ_DEFAULT_MODEL=
GROQ_REASONING_MODEL=
OPENROUTER_API_KEY=
OPENROUTER_FAST_MODEL=
OPENROUTER_DEFAULT_MODEL=
OPENROUTER_REASONING_MODEL=
HF_TOKEN=
HF_DEFAULT_MODEL=
```

Cost and safety:

```env
MAX_RUN_COST_USD=0.00
MAX_AGENT_RETRIES=1
MAX_OUTPUT_TOKENS_PER_AGENT=1800
AI_REQUEST_TIMEOUT_MS=45000
MAX_REAL_AGENT_TASKS_PER_RUN=3
```

App and database later:

```env
NEXT_PUBLIC_APP_URL=
DATABASE_URL=
```

Figma later:

```env
FIGMA_ACCESS_TOKEN=
FIGMA_TEAM_ID=
FIGMA_FILE_TEMPLATE_ID=
```

## 9. Phase 15 Free-First AI Provider Gateway

Phase 15 adds a server-side provider gateway before the full real agent pipeline.

The gateway does not create projects, store outputs, call Figma, or run all agents yet. Its job is smaller:

1. Read AI provider environment variables.
2. Pick the selected provider when real mode is enabled.
3. Call the provider with `fetch`.
4. Return one normalized response shape.
5. Fall back to mock mode safely when needed.

Provider priority:

1. `mock`
2. `gemini`
3. `groq`
4. `openrouter`
5. `huggingface`

Mock mode remains the default.

Provider selection is explicit in real mode:

```env
AI_GENERATION_MODE=real
AI_PROVIDER=gemini
```

Supported `AI_PROVIDER` values are `gemini`, `groq`, `openrouter`, and `huggingface`. If `AI_GENERATION_MODE` is anything other than `real`, Ship Design always uses the mock provider.

If `AI_GENERATION_MODE=real` but the selected provider API key is missing, Ship Design should fall back to the mock provider and return a warning. If a selected real provider fails during a call, the gateway should also return a normalized mock response with a warning.

All provider calls must happen server-side only. Do not call these providers from React client components.

Model tiers let agents ask for the right cost/speed profile without knowing provider-specific model names:

```txt
fast       quick drafts and cheap iterations
default    normal product artifact generation
reasoning  harder synthesis tasks
```

Provider model environment variables:

```env
GEMINI_FAST_MODEL=gemini-2.5-flash-lite
GEMINI_DEFAULT_MODEL=gemini-2.5-flash
GEMINI_REASONING_MODEL=gemini-2.5-flash

GROQ_FAST_MODEL=llama-3.1-8b-instant
GROQ_DEFAULT_MODEL=qwen/qwen3-32b
GROQ_REASONING_MODEL=llama-3.3-70b-versatile

OPENROUTER_FAST_MODEL=openrouter/free
OPENROUTER_DEFAULT_MODEL=openrouter/free
OPENROUTER_REASONING_MODEL=openrouter/free

HF_TOKEN=
HF_DEFAULT_MODEL=
```

Created gateway files:

```txt
src/lib/ai/config.ts
src/lib/ai/providers.ts
src/lib/ai/types.ts
src/lib/ai/errors.ts
src/lib/ai/mock-provider.ts
src/lib/ai/gemini-provider.ts
src/lib/ai/groq-provider.ts
src/lib/ai/openrouter-provider.ts
src/lib/ai/huggingface-provider.ts
src/lib/ai/client.ts
```

Normalized response shape:

```ts
type AiGenerateResponse = {
  provider: "mock" | "gemini" | "groq" | "openrouter" | "huggingface";
  model: string;
  mode: "mock" | "real";
  text: string;
  raw?: unknown;
  warnings: string[];
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};
```

## How To Test Mock Mode

Use the default environment:

```env
AI_GENERATION_MODE=mock
```

Then call `generateAiText` from a server-side script, server action, or future API route.

Expected result:

- Provider is `mock`
- No external network call is made
- Response includes local placeholder text
- No API key is required

## How To Test Gemini Mode

Set:

```env
AI_GENERATION_MODE=real
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_DEFAULT_MODEL=gemini-2.5-flash
GEMINI_FAST_MODEL=gemini-2.5-flash-lite
GEMINI_REASONING_MODEL=gemini-2.5-flash
```

Then call `generateAiText` from server-side code.

Expected result:

- Provider is `gemini`
- Gemini `generateContent` is called with `fetch`
- Response is normalized into `AiGenerateResponse`
- Response includes `mode: "real"`
- If the selected key is missing, the gateway falls back to `mock` and returns a warning

## Recommended V1 Rule

Ship Design should continue using local mock generation unless both conditions are true:

1. `AI_GENERATION_MODE=real`
2. The selected `AI_PROVIDER` has a server-side API key configured

This keeps the product safe while the real generation system is being tested.
