export const generationPlatforms = ["mobile", "desktop"] as const;

export type GenerationPlatform = (typeof generationPlatforms)[number];

export const platformLabels: Record<GenerationPlatform, string> = {
  mobile: "Mobile app",
  desktop: "Desktop web"
};

export function isGenerationPlatform(value: unknown): value is GenerationPlatform {
  return typeof value === "string" && generationPlatforms.includes(value as GenerationPlatform);
}

export function getPlatformLabel(platform?: GenerationPlatform | "") {
  return platform ? platformLabels[platform] : "Platform not selected yet";
}
