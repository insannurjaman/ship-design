import "server-only";

import { getAiGatewayConfig, getRealProviderFallbackOrder } from "./config";
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
    provider
  };
}

export async function generateAiText(request: AiGenerateRequest): Promise<AiGenerateResponse> {
  const config = getAiGatewayConfig();
  const providers = createProviders();

  if (config.mode !== "real") {
    const fallback = await providers.mock.generate(request);
    return {
      ...fallback,
      attemptedProviders: ["mock"],
      fallbackUsed: false,
      finalProvider: "mock",
      providerWarnings: []
    };
  }

  const selectedProvider = config.selectedProvider;
  const realProviderOrder = getRealProviderFallbackOrder(selectedProvider);
  const configuredRealProviders = realProviderOrder.filter((providerId) => providers[providerId].isConfigured());
  const attemptedProviders: AiProviderId[] = [];
  const providerWarnings: string[] = [];

  if (!providers[selectedProvider].isConfigured()) {
    providerWarnings.push(
      `Real AI mode is enabled for ${providers[selectedProvider].displayName}, but its API key is missing.`
    );
  }

  if (configuredRealProviders.length === 0) {
    const fallback = await providers.mock.generate(request);
    const finalWarnings = [
      ...providerWarnings,
      "No configured real AI providers were available. Ship Design used mock generation as the final fallback."
    ];

    return {
      ...fallback,
      warnings: [...fallback.warnings, ...finalWarnings],
      attemptedProviders: ["mock"],
      fallbackUsed: true,
      finalProvider: "mock",
      providerWarnings: finalWarnings
    };
  }

  for (const providerId of configuredRealProviders) {
    const provider = providers[providerId];
    attemptedProviders.push(providerId);

    try {
      const response = await provider.generate(request);
      const fallbackUsed = providerId !== selectedProvider || providerWarnings.length > 0;
      const finalProviderWarnings = fallbackUsed
        ? [
            ...providerWarnings,
            `${provider.displayName} was used after fallback from ${providers[selectedProvider].displayName}.`
          ]
        : providerWarnings;

      return {
        ...response,
        warnings: [...response.warnings, ...finalProviderWarnings],
        attemptedProviders,
        fallbackUsed,
        finalProvider: providerId,
        providerWarnings: finalProviderWarnings
      };
    } catch (error) {
      providerWarnings.push(`${provider.displayName} failed: ${formatProviderError(error)}`);
    }
  }

  const fallback = await providers.mock.generate(request);
  const finalWarnings = [
    ...providerWarnings,
    "All configured real AI providers failed or were unavailable. Ship Design used mock generation as the final fallback."
  ];

  return {
    ...fallback,
    warnings: [...fallback.warnings, ...finalWarnings],
    attemptedProviders: [...attemptedProviders, "mock"],
    fallbackUsed: true,
    finalProvider: "mock",
    providerWarnings: finalWarnings
  };
}

function formatProviderError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown provider error.";
}
