import "server-only";

import type { AiGenerateResponse, AiProvider, AiProviderConfig } from "./types";
import { createProviderResponseError } from "./errors";
import { fetchJson, normalizeOpenAiUsage, resolveRequestModel, splitSystemAndChatMessages } from "./providers";

type HuggingFaceResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: unknown;
};

export function createHuggingFaceProvider(config: AiProviderConfig): AiProvider {
  return {
    id: "huggingface",
    displayName: config.displayName,
    isConfigured: () => Boolean(config.apiKey),
    async generate(request): Promise<AiGenerateResponse> {
      if (!config.apiKey) {
        throw createProviderResponseError({
          provider: "huggingface",
          message: "Hugging Face API key is missing."
        });
      }

      const model = resolveRequestModel(request, config);
      const { system, messages } = splitSystemAndChatMessages(request);
      const json = (await fetchJson({
        provider: "huggingface",
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
      })) as HuggingFaceResponse;

      const text = json.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw createProviderResponseError({
          provider: "huggingface",
          message: "Hugging Face returned an empty response.",
          cause: json
        });
      }

      return {
        provider: "huggingface",
        model,
        mode: "real",
        text,
        raw: json,
        usage: normalizeOpenAiUsage(json.usage),
        warnings: []
      };
    }
  };
}
