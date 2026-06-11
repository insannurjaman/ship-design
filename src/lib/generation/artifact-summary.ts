import { markdownToBodyLines, normalizeMarkdownForDisplay } from "@/lib/generation/markdown-cleanup";
import type { GenerationArtifact } from "@/lib/generation/progress";

export type ArtifactSummaryData = {
  title: string;
  shortSummary: string;
  keyPoints: string[];
};

export function createArtifactSummaryData({
  title,
  markdown,
  fallbackSummary
}: {
  title: string;
  markdown: string;
  fallbackSummary?: string;
}): ArtifactSummaryData {
  const normalized = normalizeMarkdownForDisplay(markdown);
  const headings = extractHeadings(normalized);
  const bullets = extractBullets(normalized);
  const bodyLines = markdownToBodyLines(normalized);
  const shortSummary =
    bodyLines.find((line) => !line.toLowerCase().startsWith(title.toLowerCase())) ??
    fallbackSummary ??
    `${title} generated for this package.`;
  const keyPoints = uniqueCompact([...bullets, ...headings])
    .filter((point) => point.toLowerCase() !== title.toLowerCase())
    .slice(0, 5);

  return {
    title,
    shortSummary: shortSummary.slice(0, 240),
    keyPoints: keyPoints.length > 0 ? keyPoints : bodyLines.slice(0, 5)
  };
}

export function getArtifactSummaryData(artifact: GenerationArtifact): ArtifactSummaryData {
  return artifact.summaryData ?? createArtifactSummaryData({
    title: artifact.title,
    markdown: artifact.markdown,
    fallbackSummary: artifact.summary
  });
}

export function formatArtifactSummaryForContext(artifact: GenerationArtifact) {
  const summary = getArtifactSummaryData(artifact);
  const points = summary.keyPoints.map((point) => `- ${point}`).join("\n");

  return [
    `## ${summary.title}`,
    `Summary: ${summary.shortSummary}`,
    points ? ["Key points:", points].join("\n") : ""
  ].filter(Boolean).join("\n");
}

function extractHeadings(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => /^(#{1,3})\s+(.+)$/.exec(line.trim())?.[2]?.trim())
    .filter((line): line is string => Boolean(line));
}

function extractBullets(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => /^[-*]\s+(.+)$/.exec(line.trim())?.[1]?.trim())
    .filter((line): line is string => Boolean(line));
}

function uniqueCompact(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").trim();
    const key = normalized.toLowerCase();

    if (!normalized || seen.has(key)) continue;

    seen.add(key);
    result.push(normalized);
  }

  return result;
}
