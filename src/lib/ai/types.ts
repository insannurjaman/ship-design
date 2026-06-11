export type AiProviderId = "mock" | "gemini" | "groq" | "openrouter" | "huggingface";

export type AiGenerationMode = "mock" | "real";

export type AiModelTier = "fast" | "default" | "reasoning";

export type AiMessageRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type AiGenerateRequest = {
  messages: AiMessage[];
  model?: string;
  modelTier?: AiModelTier;
  temperature?: number;
  maxOutputTokens?: number;
  metadata?: {
    projectId?: string;
    agentId?: string;
    taskId?: string;
  };
};

export type AiTokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type AiProviderDiagnostic = {
  provider: AiProviderId;
  summary: string;
  detail: string;
  status?: number;
};

export type AiGenerateResponse = {
  provider: AiProviderId;
  model: string;
  mode: AiGenerationMode;
  text: string;
  raw?: unknown;
  usage?: AiTokenUsage;
  warnings: string[];
  attemptedProviders: AiProviderId[];
  fallbackUsed: boolean;
  finalProvider: AiProviderId;
  providerWarnings: string[];
  providerDiagnostics?: AiProviderDiagnostic[];
};

export type AiProvider = {
  id: AiProviderId;
  displayName: string;
  isConfigured: () => boolean;
  generate: (request: AiGenerateRequest) => Promise<AiGenerateResponse>;
};

export type AiProviderConfig = {
  id: AiProviderId;
  displayName: string;
  apiKey?: string;
  baseUrl: string;
  models: Record<AiModelTier, string>;
  defaultModel: string;
  timeoutMs: number;
};
