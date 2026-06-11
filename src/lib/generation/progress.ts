import type { AiGenerationMode, AiProviderDiagnostic, AiProviderId, AiTokenUsage } from "@/lib/ai/types";
import type { ArtifactSummaryData } from "@/lib/generation/artifact-summary";
import type { ArtifactVersion } from "@/lib/generation/artifact-versions";
import type { GenerationPlatform } from "@/lib/platforms";

export type CreateGenerationRunRequest = {
  productName: string;
  productType: string;
  targetUsers: string;
  mainProblem: string;
  productGoal: string;
  platform: GenerationPlatform;
  outputTypes?: string[];
  preferredStyle?: string;
};

export type GenerationArtifactStatus = "ready" | "needs-review" | "error" | "skipped";

export type GenerationArtifactId =
  | "product-brief"
  | "ux-docs"
  | "user-flows"
  | "screen-list"
  | "design-system-plan"
  | "figma-plan"
  | "landing-page-copy"
  | "handoff-docs";

export type GenerationArtifact = {
  id: GenerationArtifactId;
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
  providerDiagnostics?: AiProviderDiagnostic[];
  activeVersion: number;
  versions: ArtifactVersion[];
  summaryData?: ArtifactSummaryData;
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
  providerDiagnostics?: AiProviderDiagnostic[];
};

export const generationStepTemplates: Array<Pick<GenerationStep, "id" | "title">> = [
  {
    id: "product-brief",
    title: "Product Strategy"
  },
  {
    id: "ux-docs",
    title: "UX Research"
  },
  {
    id: "user-flows",
    title: "UX Flow"
  },
  {
    id: "screen-list",
    title: "Screen Inventory"
  },
  {
    id: "design-system-plan",
    title: "Design System Kit"
  },
  {
    id: "figma-plan",
    title: "UI Screens"
  },
  {
    id: "landing-page-copy",
    title: "Landing Page"
  },
  {
    id: "handoff-docs",
    title: "QA Handoff"
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

export function createGenerationStepsFromArtifacts(artifacts: GenerationArtifact[]): GenerationStep[] {
  return generationStepTemplates.map((step) => {
    const artifact = artifacts.find((item) => item.id === step.id);

    if (!artifact) {
      return {
        ...step,
        status: "queued",
        progress: 0
      };
    }

    return {
      ...step,
      status: artifact.status === "error" ? "error" : artifact.status === "skipped" ? "queued" : "complete",
      progress: artifact.status === "error" || artifact.status === "skipped" ? 0 : 100
    };
  });
}

export function getGenerationProgress(completedCount: number) {
  return Math.round((completedCount / generationStepTemplates.length) * 100);
}
