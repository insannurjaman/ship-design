export function normalizeMarkdownForDisplay(markdown: string) {
  let lines = stripReasoningPreamble(stripThinkBlocks(markdown))
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n");

  while (hasWrappingFence(lines)) {
    lines = lines.slice(1, -1);
  }

  return removeDuplicateEmptySections(lines).join("\n").trim();
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

function stripThinkBlocks(value: string) {
  return value.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function stripReasoningPreamble(value: string) {
  const lines = value.split(/\r?\n/);
  let startIndex = 0;

  for (let index = 0; index < Math.min(lines.length, 12); index += 1) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      startIndex = index + 1;
      continue;
    }

    if (isReasoningPreamble(trimmed)) {
      startIndex = index + 1;
      continue;
    }

    break;
  }

  return lines.slice(startIndex).join("\n").trim();
}

function isReasoningPreamble(line: string) {
  return /^(okay|ok|sure|certainly|first,?\s+i|i need to|i'll|let me|we need to|here'?s how|here is)\b/i.test(line);
}

function removeDuplicateEmptySections(lines: string[]) {
  const result: string[] = [];
  const seenHeadings = new Set<string>();
  let previousWasBlank = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());

    if (heading) {
      const headingKey = `${heading[1].length}:${cleanSummaryLine(heading[2]).toLowerCase()}`;

      if (seenHeadings.has(headingKey)) continue;

      seenHeadings.add(headingKey);
    }

    if (!line.trim()) {
      if (previousWasBlank) continue;
      previousWasBlank = true;
      result.push("");
      continue;
    }

    previousWasBlank = false;
    result.push(line);
  }

  return result;
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
