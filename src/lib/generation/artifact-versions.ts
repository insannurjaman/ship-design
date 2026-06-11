import type { AiGenerationMode, AiProviderId, AiTokenUsage } from "@/lib/ai/types";
import type { GenerationArtifact } from "@/lib/generation/progress";

export type ArtifactVersion = {
  version: number;
  markdown: string;
  summary: string;
  body: string[];
  provider: AiProviderId;
  mode: AiGenerationMode;
  model: string;
  createdAt: string;
  feedback?: string;
  usage?: AiTokenUsage;
  warnings: string[];
  attemptedProviders: AiProviderId[];
  fallbackUsed: boolean;
  finalProvider: AiProviderId;
  providerWarnings: string[];
};

export type ArtifactVersionInput = Omit<ArtifactVersion, "version" | "createdAt"> & {
  version?: number;
  createdAt?: string;
};

export function createArtifactVersion(input: ArtifactVersionInput): ArtifactVersion {
  return {
    ...input,
    version: input.version ?? 1,
    createdAt: input.createdAt ?? new Date().toISOString()
  };
}

export function getActiveArtifactVersion(artifact: GenerationArtifact): ArtifactVersion {
  const existing = artifact.versions?.find((version) => version.version === artifact.activeVersion);

  if (existing) return existing;

  return createArtifactVersion({
    version: artifact.activeVersion ?? 1,
    markdown: artifact.markdown,
    summary: artifact.summary,
    body: artifact.body,
    provider: artifact.provider,
    mode: artifact.mode,
    model: artifact.model,
    usage: artifact.usage,
    warnings: artifact.warnings,
    attemptedProviders: artifact.attemptedProviders,
    fallbackUsed: artifact.fallbackUsed,
    finalProvider: artifact.finalProvider,
    providerWarnings: artifact.providerWarnings
  });
}

export function getNextArtifactVersionNumber(artifact: GenerationArtifact) {
  const versions = artifact.versions?.length ? artifact.versions : [getActiveArtifactVersion(artifact)];
  const latest = Math.max(...versions.map((version) => version.version));

  return latest + 1;
}

export function applyActiveArtifactVersion(
  artifact: GenerationArtifact,
  activeVersion: ArtifactVersion
): GenerationArtifact {
  const versions = artifact.versions?.length ? artifact.versions : [getActiveArtifactVersion(artifact)];
  const nextVersions = [
    ...versions.filter((version) => version.version !== activeVersion.version),
    activeVersion
  ].sort((a, b) => a.version - b.version);

  return {
    ...artifact,
    status: "ready",
    summary: activeVersion.summary,
    body: activeVersion.body,
    markdown: activeVersion.markdown,
    provider: activeVersion.provider,
    model: activeVersion.model,
    mode: activeVersion.mode,
    usage: activeVersion.usage,
    warnings: activeVersion.warnings,
    attemptedProviders: activeVersion.attemptedProviders,
    fallbackUsed: activeVersion.fallbackUsed,
    finalProvider: activeVersion.finalProvider,
    providerWarnings: activeVersion.providerWarnings,
    activeVersion: activeVersion.version,
    versions: nextVersions
  };
}
