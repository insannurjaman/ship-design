import "server-only";

import type { AiGenerationMode, AiModelTier, AiProviderConfig, AiProviderId } from "./types";

export const AI_PROVIDER_PRIORITY: AiProviderId[] = [
  "mock",
  "gemini",
  "groq",
  "openrouter",
  "huggingface"
];

export type AiGatewayConfig = {
  mode: AiGenerationMode;
  selectedProvider: AiProviderId;
  providerConfigs: Record<AiProviderId, AiProviderConfig>;
  fallbackWarning?: string;
};

function readMode(): AiGenerationMode {
  return process.env.AI_GENERATION_MODE === "real" ? "real" : "mock";
}

function readTimeoutMs() {
  const parsed = Number.parseInt(process.env.AI_REQUEST_TIMEOUT_MS ?? "45000", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 45000;
}

function readSelectedProvider(): Exclude<AiProviderId, "mock"> {
  const value = process.env.AI_PROVIDER;

  if (value === "gemini" || value === "groq" || value === "openrouter" || value === "huggingface") {
    return value;
  }

  return "gemini";
}

function providerModels(models: Partial<Record<AiModelTier, string>>, fallback: string): Record<AiModelTier, string> {
  const defaultModel = models.default || fallback;

  return {
    fast: models.fast || defaultModel,
    default: defaultModel,
    reasoning: models.reasoning || defaultModel
  };
}

function providerConfig(id: AiProviderId, overrides: Partial<AiProviderConfig>): AiProviderConfig {
  const models = overrides.models ?? providerModels({ default: overrides.defaultModel }, "mock-ship-design");

  return {
    id,
    displayName: overrides.displayName ?? id,
    apiKey: overrides.apiKey,
    baseUrl: overrides.baseUrl ?? "",
    models,
    defaultModel: overrides.defaultModel ?? models.default,
    timeoutMs: overrides.timeoutMs ?? readTimeoutMs()
  };
}

export function getAiGatewayConfig(): AiGatewayConfig {
  const mode = readMode();
  const timeoutMs = readTimeoutMs();

  const providerConfigs: Record<AiProviderId, AiProviderConfig> = {
    mock: providerConfig("mock", {
      displayName: "Mock",
      baseUrl: "local://mock",
      models: providerModels({ default: "mock-ship-design" }, "mock-ship-design"),
      timeoutMs
    }),
    gemini: providerConfig("gemini", {
      displayName: "Google Gemini",
      apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      models: providerModels(
        {
          fast: process.env.GEMINI_FAST_MODEL,
          default: process.env.GEMINI_DEFAULT_MODEL ?? process.env.GEMINI_MODEL,
          reasoning: process.env.GEMINI_REASONING_MODEL
        },
        "gemini-2.5-flash"
      ),
      timeoutMs
    }),
    groq: providerConfig("groq", {
      displayName: "Groq",
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1",
      models: providerModels(
        {
          fast: process.env.GROQ_FAST_MODEL,
          default: process.env.GROQ_DEFAULT_MODEL ?? process.env.GROQ_MODEL,
          reasoning: process.env.GROQ_REASONING_MODEL
        },
        "llama-3.1-8b-instant"
      ),
      timeoutMs
    }),
    openrouter: providerConfig("openrouter", {
      displayName: "OpenRouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: "https://openrouter.ai/api/v1",
      models: providerModels(
        {
          fast: process.env.OPENROUTER_FAST_MODEL,
          default: process.env.OPENROUTER_DEFAULT_MODEL ?? process.env.OPENROUTER_MODEL,
          reasoning: process.env.OPENROUTER_REASONING_MODEL
        },
        "openrouter/free"
      ),
      timeoutMs
    }),
    huggingface: providerConfig("huggingface", {
      displayName: "Hugging Face",
      apiKey: process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN,
      baseUrl: "https://router.huggingface.co/v1",
      models: providerModels(
        {
          default: process.env.HF_DEFAULT_MODEL ?? process.env.HUGGINGFACE_MODEL
        },
        "meta-llama/Llama-3.1-8B-Instruct"
      ),
      timeoutMs
    })
  };

  if (mode === "mock") {
    return {
      mode,
      selectedProvider: "mock",
      providerConfigs
    };
  }

  const requestedProvider = readSelectedProvider();
  const hasApiKey = Boolean(providerConfigs[requestedProvider].apiKey);
  const selectedProvider = hasApiKey ? requestedProvider : "mock";

  return {
    mode,
    selectedProvider,
    providerConfigs,
    fallbackWarning:
      selectedProvider === "mock"
        ? `Real AI mode is enabled for ${requestedProvider}, but its API key is missing. Ship Design fell back to mock generation.`
        : undefined
  };
}
