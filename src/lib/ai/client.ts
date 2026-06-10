import "server-only";

import { getAiGatewayConfig } from "./config";
import { createGeminiProvider } from "./gemini-provider";
import { createGroqProvider } from "./groq-provider";
import { createHuggingFaceProvider } from "./huggingface-provider";
import { createMockProvider } from "./mock-provider";
import { createOpenRouterProvider } from "./openrouter-provider";
import type { AiGenerateRequest, AiGenerateResponse, AiProvider, AiProviderId } from "./types";

function createProviders(): Record<AiProviderId, AiProvider> {
  const config = getAiGatewayConfig();

  return {
    mock: createMockProvider(config.providerConfigs.mock),
    gemini: createGeminiProvider(config.providerConfigs.gemini),
    groq: createGroqProvider(config.providerConfigs.groq),
    openrouter: createOpenRouterProvider(config.providerConfigs.openrouter),
    huggingface: createHuggingFaceProvider(config.providerConfigs.huggingface)
  };
}

export function getSelectedAiProvider() {
  const config = getAiGatewayConfig();
  const providers = createProviders();
  const provider = providers[config.selectedProvider];

  return {
    mode: config.mode,
    provider,
    fallbackWarning: config.fallbackWarning
  };
}

export async function generateAiText(request: AiGenerateRequest): Promise<AiGenerateResponse> {
  const { mode, provider, fallbackWarning } = getSelectedAiProvider();

  try {
    const response = await provider.generate(request);

    return {
      ...response,
      warnings: fallbackWarning ? [...response.warnings, fallbackWarning] : response.warnings
    };
  } catch (error) {
    if (mode !== "real" || provider.id === "mock") {
      throw error;
    }

    const providers = createProviders();
    const fallback = await providers.mock.generate(request);
    const message = error instanceof Error ? error.message : "Unknown provider error.";

    return {
      ...fallback,
      warnings: [
        ...fallback.warnings,
        `${provider.displayName} failed during real AI generation. Ship Design fell back to mock generation. ${message}`
      ]
    };
  }
}
