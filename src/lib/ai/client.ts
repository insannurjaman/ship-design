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
  const { provider, fallbackWarning } = getSelectedAiProvider();
  const response = await provider.generate(request);

  return {
    ...response,
    warnings: fallbackWarning
      ? [
          ...response.warnings,
          {
            code: "fallback_to_mock",
            message: fallbackWarning
          }
        ]
      : response.warnings
  };
}
