import "server-only";

import { getAiGatewayConfig, getRealProviderFallbackOrder } from "./config";
import { createGeminiProvider } from "./gemini-provider";
import { createGroqProvider } from "./groq-provider";
import { createHuggingFaceProvider } from "./huggingface-provider";
import { createMockProvider } from "./mock-provider";
import { createOpenRouterProvider } from "./openrouter-provider";
import { AiGatewayError } from "./errors";
import type { AiGenerateRequest, AiGenerateResponse, AiProvider, AiProviderDiagnostic, AiProviderId } from "./types";

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
      providerWarnings: [],
      providerDiagnostics: []
    };
  }

  const selectedProvider = config.selectedProvider;
  const realProviderOrder = getRealProviderFallbackOrder(selectedProvider);
  const configuredRealProviders = realProviderOrder.filter((providerId) => providers[providerId].isConfigured());
  const attemptedProviders: AiProviderId[] = [];
  const providerWarnings: string[] = [];
  const providerDiagnostics: AiProviderDiagnostic[] = [];

  if (!providers[selectedProvider].isConfigured()) {
    const detail = `Real AI mode is enabled for ${providers[selectedProvider].displayName}, but its API key is missing.`;

    providerWarnings.push(detail);
    providerDiagnostics.push({
      provider: selectedProvider,
      summary: `${providers[selectedProvider].displayName} key missing`,
      detail
    });
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
      providerWarnings: finalWarnings,
      providerDiagnostics: [
        ...providerDiagnostics,
        {
          provider: "mock",
          summary: "Final fallback provider: mock",
          detail: finalWarnings.at(-1) ?? "Mock generation was used as the final fallback."
        }
      ]
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
      const finalDiagnostics = fallbackUsed
        ? [
            ...providerDiagnostics,
            {
              provider: providerId,
              summary: `Final fallback provider: ${provider.displayName}`,
              detail: `${provider.displayName} was used after fallback from ${providers[selectedProvider].displayName}.`
            }
          ]
        : providerDiagnostics;

      return {
        ...response,
        warnings: [...response.warnings, ...finalProviderWarnings],
        attemptedProviders,
        fallbackUsed,
        finalProvider: providerId,
        providerWarnings: finalProviderWarnings,
        providerDiagnostics: finalDiagnostics
      };
    } catch (error) {
      const detail = formatProviderError(error);

      providerWarnings.push(`${provider.displayName} failed: ${detail}`);
      providerDiagnostics.push(createProviderDiagnostic(providerId, provider.displayName, error, detail));
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
    providerWarnings: finalWarnings,
    providerDiagnostics: [
      ...providerDiagnostics,
      {
        provider: "mock",
        summary: "Final fallback provider: mock",
        detail: finalWarnings.at(-1) ?? "Mock generation was used as the final fallback."
      }
    ]
  };
}

function formatProviderError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown provider error.";
}

function createProviderDiagnostic(
  provider: AiProviderId,
  displayName: string,
  error: unknown,
  detail: string
): AiProviderDiagnostic {
  const status = error instanceof AiGatewayError ? error.status : undefined;

  return {
    provider,
    summary: summarizeProviderError(provider, displayName, detail, status),
    detail,
    status
  };
}

function summarizeProviderError(
  provider: AiProviderId,
  displayName: string,
  detail: string,
  status?: number
) {
  const lower = detail.toLowerCase();

  if (provider === "gemini" && (status === 429 || lower.includes("quota"))) return "Gemini quota exceeded";
  if (provider === "groq" && (status === 413 || lower.includes("request too large") || lower.includes("tokens per minute"))) {
    return "Groq request too large";
  }
  if (provider === "openrouter" && (lower.includes("unavailable") || lower.includes("not available") || lower.includes("model"))) {
    return "OpenRouter model unavailable";
  }
  if (status) return `${displayName} HTTP ${status}`;

  return `${displayName} failed`;
}
