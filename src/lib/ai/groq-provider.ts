import "server-only";

import type { AiGenerateResponse, AiProvider, AiProviderConfig } from "./types";
import { createProviderResponseError } from "./errors";
import { fetchJson, normalizeOpenAiUsage, splitSystemAndChatMessages } from "./providers";

type OpenAiCompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: unknown;
};

export function createGroqProvider(config: AiProviderConfig): AiProvider {
  return {
    id: "groq",
    displayName: config.displayName,
    isConfigured: () => Boolean(config.apiKey),
    async generate(request): Promise<AiGenerateResponse> {
      if (!config.apiKey) {
        throw createProviderResponseError({
          provider: "groq",
          message: "Groq API key is missing."
        });
      }

      const model = request.model ?? config.defaultModel;
      const { system, messages } = splitSystemAndChatMessages(request);
      const json = (await fetchJson({
        provider: "groq",
        url: `${config.baseUrl}/chat/completions`,
        timeoutMs: config.timeoutMs,
        init: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: system ? [{ role: "system", content: system }, ...messages] : messages,
            temperature: request.temperature ?? 0.4,
            max_tokens: request.maxOutputTokens
          })
        }
      })) as OpenAiCompatibleResponse;

      const text = json.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw createProviderResponseError({
          provider: "groq",
          message: "Groq returned an empty response.",
          cause: json
        });
      }

      return {
        provider: "groq",
        model,
        text,
        raw: json,
        usage: normalizeOpenAiUsage(json.usage),
        warnings: []
      };
    }
  };
}
