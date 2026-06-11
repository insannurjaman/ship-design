export function normalizeMarkdownForDisplay(markdown: string) {
  let lines = markdown.replace(/\r\n/g, "\n").trim().split("\n");

  while (hasWrappingFence(lines)) {
    lines = lines.slice(1, -1);
  }

  return lines.join("\n").trim();
}

export function markdownToBodyLines(markdown: string) {
  return normalizeMarkdownForDisplay(markdown)
    .split("\n")
    .map((line) => cleanSummaryLine(line))
    .filter(Boolean)
    .slice(0, 12);
}

export function createArtifactSummary(markdown: string, title: string) {
  const titleText = cleanSummaryLine(title).toLowerCase();
  const firstUsefulLine = markdownToBodyLines(markdown).find((line) => {
    const normalized = line.toLowerCase();

    return normalized !== titleText && !normalized.startsWith(`${titleText}:`);
  });

  if (firstUsefulLine) {
    return `${title}: ${firstUsefulLine}`.slice(0, 180);
  }

  return `${title} generated for the current Ship Design intake.`;
}

export function isFenceLine(line: string) {
  return /^```(?:markdown|md|text)?\s*$/i.test(line.trim());
}

export function isTableSeparatorLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed.includes("|")) return false;

  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
}

function hasWrappingFence(lines: string[]) {
  const firstNonEmptyIndex = lines.findIndex((line) => line.trim());
  const lastNonEmptyIndex = findLastNonEmptyIndex(lines);

  if (firstNonEmptyIndex < 0 || lastNonEmptyIndex <= firstNonEmptyIndex) return false;

  return isFenceLine(lines[firstNonEmptyIndex]) && /^```\s*$/.test(lines[lastNonEmptyIndex].trim());
}

function findLastNonEmptyIndex(lines: string[]) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].trim()) return index;
  }

  return -1;
}

function cleanSummaryLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed) return "";
  if (isFenceLine(trimmed) || /^```\s*$/.test(trimmed)) return "";
  if (isTableSeparatorLine(trimmed)) return "";
  if (/^-{3,}$/.test(trimmed)) return "";

  const withoutMarkdown = trimmed
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");

  if (withoutMarkdown.includes("|")) {
    const cells = splitTableRow(withoutMarkdown);

    if (cells.length > 1) return cells.join(" - ");
  }

  return withoutMarkdown.trim();
}

function splitTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
}
