export type AiProviderId = "mock" | "gemini" | "groq" | "openrouter" | "huggingface";

export type AiGenerationMode = "mock" | "real";

export type AiMessageRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type AiGenerateRequest = {
  messages: AiMessage[];
  model?: string;
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

export type AiProviderWarning = {
  code: string;
  message: string;
};

export type AiGenerateResponse = {
  provider: AiProviderId;
  model: string;
  text: string;
  raw?: unknown;
  usage?: AiTokenUsage;
  warnings: AiProviderWarning[];
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
  defaultModel: string;
  timeoutMs: number;
};
