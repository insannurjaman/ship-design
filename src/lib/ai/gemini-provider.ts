import "server-only";

import type { AiGenerateResponse, AiProvider, AiProviderConfig } from "./types";
import { createProviderResponseError } from "./errors";
import { fetchJson, resolveRequestModel, splitSystemAndChatMessages } from "./providers";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

export function createGeminiProvider(config: AiProviderConfig): AiProvider {
  return {
    id: "gemini",
    displayName: config.displayName,
    isConfigured: () => Boolean(config.apiKey),
    async generate(request): Promise<AiGenerateResponse> {
      if (!config.apiKey) {
        throw createProviderResponseError({
          provider: "gemini",
          message: "Gemini API key is missing."
        });
      }

      const model = resolveRequestModel(request, config);
      const { system, messages } = splitSystemAndChatMessages(request);
      const userText = messages.map((message) => `${message.role}: ${message.content}`).join("\n\n");
      const url = `${config.baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${config.apiKey}`;

      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: userText }]
          }
        ],
        ...(system
          ? {
              systemInstruction: {
                parts: [{ text: system }]
              }
            }
          : {}),
        generationConfig: {
          temperature: request.temperature ?? 0.4,
          maxOutputTokens: request.maxOutputTokens
        }
      };

      const json = (await fetchJson({
        provider: "gemini",
        url,
        timeoutMs: config.timeoutMs,
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      })) as GeminiResponse;

      const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

      if (!text) {
        throw createProviderResponseError({
          provider: "gemini",
          message: "Gemini returned an empty response.",
          cause: json
        });
      }

      return {
        provider: "gemini",
        model,
        mode: "real",
        text,
        raw: json,
        usage: {
          inputTokens: json.usageMetadata?.promptTokenCount,
          outputTokens: json.usageMetadata?.candidatesTokenCount,
          totalTokens: json.usageMetadata?.totalTokenCount
        },
        warnings: []
      };
    }
  };
}
