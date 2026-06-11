import type { AiGenerationMode, AiProviderId, AiTokenUsage } from "@/lib/ai/types";

export type CreateGenerationRunRequest = {
  productName: string;
  productType: string;
  targetUsers: string;
  mainProblem: string;
  productGoal: string;
  platform: "Web" | "Mobile" | "Both" | string;
  outputTypes?: string[];
  preferredStyle?: string;
};

export type GenerationArtifactStatus = "ready" | "error";

export type GenerationArtifact = {
  id: "product-brief" | "ux-docs" | "user-flows";
  title: string;
  type: string;
  status: GenerationArtifactStatus;
  summary: string;
  body: string[];
  markdown: string;
  provider: AiProviderId;
  model: string;
  mode: AiGenerationMode;
  usage?: AiTokenUsage;
  warnings: string[];
  attemptedProviders: AiProviderId[];
  fallbackUsed: boolean;
  finalProvider: AiProviderId;
  providerWarnings: string[];
};

export type GenerationStepStatus = "queued" | "running" | "complete" | "error";

export type GenerationStep = {
  id: GenerationArtifact["id"];
  title: string;
  status: GenerationStepStatus;
  progress: number;
};

export type GenerationRun = {
  id: string;
  status: "complete" | "error";
  progress: number;
  createdAt: string;
  input: CreateGenerationRunRequest;
  artifacts: GenerationArtifact[];
  steps: GenerationStep[];
  provider: AiProviderId;
  model: string;
  mode: AiGenerationMode;
  warnings: string[];
  attemptedProviders: AiProviderId[];
  fallbackUsed: boolean;
  finalProvider: AiProviderId;
  providerWarnings: string[];
};

export const generationStepTemplates: Array<Pick<GenerationStep, "id" | "title">> = [
  {
    id: "product-brief",
    title: "Product Brief"
  },
  {
    id: "ux-docs",
    title: "UX Docs"
  },
  {
    id: "user-flows",
    title: "User Flows"
  }
];

export function createGenerationSteps(completedCount = 0, runningIndex?: number): GenerationStep[] {
  return generationStepTemplates.map((step, index) => {
    if (index < completedCount) {
      return {
        ...step,
        status: "complete",
        progress: 100
      };
    }

    if (runningIndex === index) {
      return {
        ...step,
        status: "running",
        progress: 50
      };
    }

    return {
      ...step,
      status: "queued",
      progress: 0
    };
  });
}

export function createErrorSteps(failedIndex: number): GenerationStep[] {
  return generationStepTemplates.map((step, index) => {
    if (index < failedIndex) {
      return {
        ...step,
        status: "complete",
        progress: 100
      };
    }

    if (index === failedIndex) {
      return {
        ...step,
        status: "error",
        progress: 0
      };
    }

    return {
      ...step,
      status: "queued",
      progress: 0
    };
  });
}

export function getGenerationProgress(completedCount: number) {
  return Math.round((completedCount / generationStepTemplates.length) * 100);
}
