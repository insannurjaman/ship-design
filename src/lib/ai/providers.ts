import "server-only";

import type { AiGenerateRequest, AiModelTier, AiProviderId, AiTokenUsage } from "./types";
import { createProviderHttpError } from "./errors";

export function resolveRequestModel(
  request: AiGenerateRequest,
  defaultModels: { defaultModel: string; models: Record<AiModelTier, string> }
) {
  return request.model ?? defaultModels.models[request.modelTier ?? "default"] ?? defaultModels.defaultModel;
}

export function joinMessagesForPrompt(request: AiGenerateRequest) {
  return request.messages
    .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
    .join("\n\n");
}

export function splitSystemAndChatMessages(request: AiGenerateRequest) {
  const system = request.messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");

  const messages = request.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role,
      content: message.content
    }));

  return {
    system,
    messages: messages.length > 0 ? messages : [{ role: "user" as const, content: joinMessagesForPrompt(request) }]
  };
}

export async function fetchJson({
  provider,
  url,
  init,
  timeoutMs
}: {
  provider: AiProviderId;
  url: string;
  init: RequestInit;
  timeoutMs: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal
    });

    const text = await response.text();

    if (!response.ok) {
      throw createProviderHttpError({
        provider,
        status: response.status,
        body: text
      });
    }

    return text ? JSON.parse(text) : {};
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeOpenAiUsage(usage: unknown): AiTokenUsage | undefined {
  if (!usage || typeof usage !== "object") return undefined;

  const value = usage as {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };

  return {
    inputTokens: value.prompt_tokens,
    outputTokens: value.completion_tokens,
    totalTokens: value.total_tokens
  };
}
