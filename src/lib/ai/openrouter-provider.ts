import "server-only";

import type { AiGenerateResponse, AiProvider, AiProviderConfig } from "./types";
import { createProviderResponseError } from "./errors";
import { fetchJson, normalizeOpenAiUsage, splitSystemAndChatMessages } from "./providers";

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: unknown;
};

export function createOpenRouterProvider(config: AiProviderConfig): AiProvider {
  return {
    id: "openrouter",
    displayName: config.displayName,
    isConfigured: () => Boolean(config.apiKey),
    async generate(request): Promise<AiGenerateResponse> {
      if (!config.apiKey) {
        throw createProviderResponseError({
          provider: "openrouter",
          message: "OpenRouter API key is missing."
        });
      }

      const model = request.model ?? config.defaultModel;
      const { system, messages } = splitSystemAndChatMessages(request);
      const json = (await fetchJson({
        provider: "openrouter",
        url: `${config.baseUrl}/chat/completions`,
        timeoutMs: config.timeoutMs,
        init: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002",
            "X-Title": "Ship Design"
          },
          body: JSON.stringify({
            model,
            messages: system ? [{ role: "system", content: system }, ...messages] : messages,
            temperature: request.temperature ?? 0.4,
            max_tokens: request.maxOutputTokens
          })
        }
      })) as OpenRouterResponse;

      const text = json.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw createProviderResponseError({
          provider: "openrouter",
          message: "OpenRouter returned an empty response.",
          cause: json
        });
      }

      return {
        provider: "openrouter",
        model,
        text,
        raw: json,
        usage: normalizeOpenAiUsage(json.usage),
        warnings: []
      };
    }
  };
}
