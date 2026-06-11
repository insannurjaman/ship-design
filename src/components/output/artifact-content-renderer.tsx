import type { ReactNode } from "react";
import {
  isFenceLine,
  isTableSeparatorLine,
  normalizeMarkdownForDisplay
} from "@/lib/generation/markdown-cleanup";

type ArtifactContentRendererProps = {
  markdown: string;
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "divider" }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; text: string };

export function ArtifactContentRenderer({ markdown }: ArtifactContentRendererProps) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="grid gap-6">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

function parseMarkdown(markdown: string) {
  const blocks: Block[] = [];
  const lines = normalizeMarkdownForDisplay(markdown).split("\n");
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let codeLines: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) return;

    blocks.push({
      type: "paragraph",
      text: paragraph.join(" ").trim()
    });
    paragraph = [];
  }

  function flushList() {
    if (listItems.length === 0) return;

    blocks.push({
      type: "list",
      ordered: listOrdered,
      items: listItems
    });
    listItems = [];
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trim();

    if (codeLines) {
      if (/^```\s*$/.test(line)) {
        blocks.push({ type: "code", text: codeLines.join("\n").trim() });
        codeLines = null;
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    if (isFenceLine(line)) {
      flushParagraph();
      flushList();
      codeLines = [];
      continue;
    }

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "divider" });
      continue;
    }

    if (looksLikeTableStart(lines, lineIndex)) {
      flushParagraph();
      flushList();

      const tableLines = collectTableLines(lines, lineIndex);
      const table = parseTable(tableLines);

      if (table) {
        blocks.push(table);
      } else {
        blocks.push({ type: "code", text: tableLines.join("\n") });
      }

      lineIndex += tableLines.length - 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2]
      });
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);

    if (unordered) {
      flushParagraph();
      if (listItems.length > 0 && listOrdered) flushList();
      listOrdered = false;
      listItems.push(unordered[1]);
      continue;
    }

    const ordered = /^\d+[.)]\s+(.+)$/.exec(line);

    if (ordered) {
      flushParagraph();
      if (listItems.length > 0 && !listOrdered) flushList();
      listOrdered = true;
      listItems.push(ordered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  if (codeLines?.length) {
    blocks.push({ type: "code", text: codeLines.join("\n").trim() });
  }

  return blocks;
}

function renderBlock(block: Block, index: number) {
  const blockKey = `block-${index}`;

  if (block.type === "divider") {
    return <hr key={blockKey} className="border-line" />;
  }

  if (block.type === "heading") {
    const content = renderInlineMarkdown(block.text, `${blockKey}-heading`);

    if (block.level === 1) {
      return (
        <h1 key={blockKey} className="text-2xl font-semibold leading-tight text-ink-primary">
          {content}
        </h1>
      );
    }

    if (block.level === 2) {
      return (
        <h2 key={blockKey} className="border-t border-line pt-5 font-mono text-sm font-medium uppercase text-accent-green">
          {content}
        </h2>
      );
    }

    return (
      <h3 key={blockKey} className="text-base font-semibold leading-snug text-ink-primary">
        {content}
      </h3>
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";

    return (
      <ListTag
        key={blockKey}
        className={
          block.ordered
            ? "grid list-decimal gap-2 pl-5 text-sm leading-7 text-ink-secondary"
            : "grid list-disc gap-2 pl-5 text-sm leading-7 text-ink-secondary marker:text-accent-green"
        }
      >
        {block.items.map((item, itemIndex) => (
          <li key={`${blockKey}-item-${itemIndex}`}>
            {renderInlineMarkdown(item, `${blockKey}-item-${itemIndex}`)}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "table") {
    return (
      <div key={blockKey} className="overflow-x-auto border border-line bg-surface-base">
        <table className="min-w-full border-collapse text-left text-sm text-ink-secondary">
          <thead className="bg-surface-raised">
            <tr>
              {block.headers.map((header, headerIndex) => (
                <th
                  key={`${blockKey}-header-${headerIndex}`}
                  scope="col"
                  className="border-b border-line px-3 py-2 font-mono text-xs font-medium uppercase text-accent-green"
                >
                  {renderInlineMarkdown(header, `${blockKey}-header-${headerIndex}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`${blockKey}-row-${rowIndex}`} className="border-t border-line">
                {block.headers.map((_, cellIndex) => (
                  <td key={`${blockKey}-row-${rowIndex}-cell-${cellIndex}`} className="px-3 py-2 align-top leading-6">
                    {renderInlineMarkdown(row[cellIndex] ?? "", `${blockKey}-row-${rowIndex}-cell-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <pre
        key={blockKey}
        className="overflow-x-auto border border-line bg-surface-raised p-4 font-mono text-xs leading-6 text-ink-secondary"
      >
        <code>{block.text}</code>
      </pre>
    );
  }

  return (
    <p key={blockKey} className="text-sm leading-7 text-ink-secondary">
      {renderInlineMarkdown(block.text, `${blockKey}-paragraph`)}
    </p>
  );
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-part-${index}`} className="font-semibold text-ink-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function looksLikeTableStart(lines: string[], index: number) {
  const currentLine = lines[index]?.trim() ?? "";
  const nextLine = lines[index + 1]?.trim() ?? "";

  return currentLine.includes("|") && isTableSeparatorLine(nextLine);
}

function collectTableLines(lines: string[], startIndex: number) {
  const tableLines: string[] = [];

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line || !line.includes("|")) break;

    tableLines.push(lines[index]);
  }

  return tableLines;
}

function parseTable(lines: string[]): Block | null {
  if (lines.length < 3 || !isTableSeparatorLine(lines[1])) return null;

  const headers = splitTableRow(lines[0]);
  const rows = lines.slice(2).map((line) => splitTableRow(line));

  if (headers.length === 0 || rows.length === 0) return null;

  return {
    type: "table",
    headers,
    rows
  };
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}
