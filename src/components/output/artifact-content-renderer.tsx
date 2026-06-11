import type { ReactNode } from "react";

type ArtifactContentRendererProps = {
  markdown: string;
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "divider" }
  | { type: "list"; ordered: boolean; items: string[] };

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
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

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

  for (const rawLine of lines) {
    const line = rawLine.trim();

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

  return blocks;
}

function renderBlock(block: Block, index: number) {
  if (block.type === "divider") {
    return <hr key={index} className="border-line" />;
  }

  if (block.type === "heading") {
    const content = renderInlineMarkdown(block.text);

    if (block.level === 1) {
      return (
        <h1 key={index} className="text-2xl font-semibold leading-tight text-ink-primary">
          {content}
        </h1>
      );
    }

    if (block.level === 2) {
      return (
        <h2 key={index} className="border-t border-line pt-5 font-mono text-sm font-medium uppercase text-accent-green">
          {content}
        </h2>
      );
    }

    return (
      <h3 key={index} className="text-base font-semibold leading-snug text-ink-primary">
        {content}
      </h3>
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";

    return (
      <ListTag
        key={index}
        className={
          block.ordered
            ? "grid list-decimal gap-2 pl-5 text-sm leading-7 text-ink-secondary"
            : "grid list-disc gap-2 pl-5 text-sm leading-7 text-ink-secondary marker:text-accent-green"
        }
      >
        {block.items.map((item) => (
          <li key={item}>{renderInlineMarkdown(item)}</li>
        ))}
      </ListTag>
    );
  }

  return (
    <p key={index} className="text-sm leading-7 text-ink-secondary">
      {renderInlineMarkdown(block.text)}
    </p>
  );
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-ink-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}
