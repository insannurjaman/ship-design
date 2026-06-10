import "server-only";

import type { AiGenerateResponse, AiProvider, AiProviderConfig } from "./types";
import { joinMessagesForPrompt, resolveRequestModel } from "./providers";

export function createMockProvider(config: AiProviderConfig): AiProvider {
  return {
    id: "mock",
    displayName: "Mock",
    isConfigured: () => true,
    async generate(request): Promise<AiGenerateResponse> {
      const prompt = joinMessagesForPrompt(request);

      return {
        provider: "mock",
        model: resolveRequestModel(request, config),
        mode: "mock",
        text: [
          "# Mock Ship Design Output",
          "",
          "This is a local mock AI response. No external provider was called.",
          "",
          "## Input Summary",
          prompt.slice(0, 1200),
          "",
          "## Next Step",
          "Use this normalized response shape to wire the real agent pipeline later."
        ].join("\n"),
        usage: {
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: 80,
          totalTokens: Math.ceil(prompt.length / 4) + 80
        },
        warnings: []
      };
    }
  };
}
