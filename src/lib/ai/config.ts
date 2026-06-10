import "server-only";

import type { AiGenerationMode, AiProviderConfig, AiProviderId } from "./types";

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
  const parsed = Number.parseInt(process.env.AI_REQUEST_TIMEOUT_MS ?? "60000", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60000;
}

function providerConfig(id: AiProviderId, overrides: Partial<AiProviderConfig>): AiProviderConfig {
  return {
    id,
    displayName: overrides.displayName ?? id,
    apiKey: overrides.apiKey,
    baseUrl: overrides.baseUrl ?? "",
    defaultModel: overrides.defaultModel ?? "mock-ship-design",
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
      defaultModel: "mock-ship-design",
      timeoutMs
    }),
    gemini: providerConfig("gemini", {
      displayName: "Google Gemini",
      apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
      timeoutMs
    }),
    groq: providerConfig("groq", {
      displayName: "Groq",
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1",
      defaultModel: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      timeoutMs
    }),
    openrouter: providerConfig("openrouter", {
      displayName: "OpenRouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: "https://openrouter.ai/api/v1",
      defaultModel: process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-exp:free",
      timeoutMs
    }),
    huggingface: providerConfig("huggingface", {
      displayName: "Hugging Face",
      apiKey: process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN,
      baseUrl: "https://router.huggingface.co/v1",
      defaultModel: process.env.HUGGINGFACE_MODEL ?? "meta-llama/Llama-3.1-8B-Instruct",
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

  const selectedProvider =
    AI_PROVIDER_PRIORITY.find((id) => id !== "mock" && Boolean(providerConfigs[id].apiKey)) ?? "mock";

  return {
    mode,
    selectedProvider,
    providerConfigs,
    fallbackWarning:
      selectedProvider === "mock"
        ? "Real AI mode is enabled, but no configured provider API key was found. Ship Design fell back to mock generation."
        : undefined
  };
}
