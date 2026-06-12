"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArtifactContentRenderer } from "@/components/output/artifact-content-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { normalizeMarkdownForDisplay } from "@/lib/generation/markdown-cleanup";
import type { OutputArtifact } from "@/lib/mock-data";

type VisualArtifact = OutputArtifact & {
  markdown?: string;
};

type VisualArtifactRendererProps = {
  artifact: VisualArtifact;
};

type FlowGroup = {
  title: string;
  nodes: Array<{ id: string; label: string; purpose: string }>;
  edges: Array<{ from: string; to: string; label: string }>;
};

type ScreenSpec = {
  name: string;
  route: string;
  device: string;
  purpose: string;
  sections: string[];
  components: string[];
  copy: string;
  states: string[];
  interactions: string;
  notes: string;
};

type DesignToken = {
  name: string;
  value: string;
  usage: string;
};

export function VisualArtifactRenderer({ artifact }: VisualArtifactRendererProps) {
  const markdown = normalizeMarkdownForDisplay(artifact.markdown ?? createMarkdownFromArtifact(artifact));

  if (artifact.id === "user-flows") {
    return <UserFlowVisual markdown={markdown} />;
  }

  if (artifact.id === "figma-plan") {
    return <UIScreenVisual markdown={markdown} />;
  }

  if (artifact.id === "design-system-plan") {
    return <DesignSystemKitVisual markdown={markdown} />;
  }

  if (artifact.id === "landing-page-copy") {
    return <LandingPageCopyVisual markdown={markdown} />;
  }

  return <ArtifactContentRenderer markdown={markdown} />;
}

export function createStructuredExportBlock(artifact: VisualArtifact) {
  const markdown = normalizeMarkdownForDisplay(artifact.markdown ?? createMarkdownFromArtifact(artifact));

  if (artifact.id === "user-flows") {
    return [
      "```json",
      JSON.stringify({ type: "user-flow", flows: parseFlows(markdown) }, null, 2),
      "```"
    ].join("\n");
  }

  if (artifact.id === "figma-plan") {
    return [
      "```json",
      JSON.stringify({ type: "ui-screens", screens: parseScreens(markdown) }, null, 2),
      "```"
    ].join("\n");
  }

  if (artifact.id === "design-system-plan") {
    return [
      "```json",
      JSON.stringify(createDesignSystemPayload(markdown), null, 2),
      "```"
    ].join("\n");
  }

  return "";
}

function UserFlowVisual({ markdown }: { markdown: string }) {
  const flows = parseFlows(markdown);
  const mermaid = createMermaid(flows);
  const flowJson = JSON.stringify(flows, null, 2);
  const svg = createFlowSvg(flows);

  return (
    <div className="grid gap-5">
      <CopyActionRow
        actions={[
          ["Copy Flow as Markdown", markdown],
          ["Copy Flow as Mermaid", mermaid],
          ["Copy flow JSON", flowJson],
          ["Copy Flow as SVG", svg]
        ]}
      />
      <div className="grid gap-5">
        {flows.map((flow, flowIndex) => (
          <div key={`flow-${flowIndex}`} className="border border-line bg-surface-base p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-mono text-sm uppercase text-accent-green">{flow.title}</h3>
              <Badge tone="info">{flow.nodes.length} nodes</Badge>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {flow.nodes.map((node, nodeIndex) => (
                  <div key={`flow-${flowIndex}-node-${node.id}-${nodeIndex}`} className="border border-line bg-surface-panel p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[11px] uppercase text-ink-muted">{node.id}</p>
                      <Badge tone="muted">Step {nodeIndex + 1}</Badge>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-ink-primary">{node.label}</h4>
                    <p className="mt-2 text-xs leading-5 text-ink-secondary">{node.purpose}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 border border-line bg-surface-raised p-3 lg:w-64">
                <p className="font-mono text-[11px] uppercase text-ink-muted">Edges</p>
                {flow.edges.map((edge, edgeIndex) => (
                  <p key={`flow-${flowIndex}-edge-${edgeIndex}`} className="font-mono text-xs leading-5 text-ink-secondary">
                    {edge.from} -&gt; {edge.to}
                    {edge.label ? <span className="block text-ink-muted">{edge.label}</span> : null}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ArtifactContentRenderer markdown={markdown} />
    </div>
  );
}

function UIScreenVisual({ markdown }: { markdown: string }) {
  const screens = parseScreens(markdown);
  const spec = JSON.stringify(screens, null, 2);
  const svg = createScreensSvg(screens);
  const content = screens.map((screen) => `${screen.name}\n${screen.copy}`).join("\n\n");
  const checklist = screens
    .flatMap((screen) => screen.components.map((component) => `- [ ] ${screen.name}: ${component}`))
    .join("\n");

  return (
    <div className="grid gap-5">
      <CopyActionRow
        actions={[
          ["Copy screen spec", spec],
          ["Copy screen as SVG", svg],
          ["Copy all UI screens", markdown],
          ["Copy content", content],
          ["Copy component checklist", checklist || "- [ ] Review component needs"]
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {screens.map((screen, index) => (
          <div key={`screen-${index}-${screen.name}`} className="border border-line bg-surface-base p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase text-accent-green">{screen.route}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink-primary">{screen.name}</h3>
              </div>
              <Badge tone="accent">{screen.device}</Badge>
            </div>
            <div className="mt-4 border border-line bg-[#080A08] p-3">
              <div className={isMobileScreen(screen) ? "mx-auto max-w-[260px] border border-line bg-surface-panel p-3" : "border border-line bg-surface-panel p-3"}>
                <p className="font-mono text-[11px] uppercase text-ink-muted">Frame preview</p>
                <div className="mt-3 grid gap-2">
                  {screen.sections.slice(0, 5).map((section, sectionIndex) => (
                    <div
                      key={`screen-${index}-section-${sectionIndex}`}
                      className={sectionIndex === 0 ? "border border-accent-green/60 bg-accent-soft p-3" : "border border-line bg-surface-base p-3"}
                    >
                      <p className="text-xs font-medium text-ink-primary">{section}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <SpecRow label="Purpose" value={screen.purpose} />
              <SpecRow label="Components" value={screen.components.join(", ")} />
              <SpecRow label="States" value={screen.states.join(", ")} />
              <SpecRow label="Interactions" value={screen.interactions} />
              <SpecRow label="Design notes" value={screen.notes} />
            </dl>
          </div>
        ))}
      </div>
      <ArtifactContentRenderer markdown={markdown} />
    </div>
  );
}

function DesignSystemKitVisual({ markdown }: { markdown: string }) {
  const payload = createDesignSystemPayload(markdown);

  return (
    <div className="grid gap-5">
      <CopyActionRow
        actions={[
          ["Copy CSS variables", createCssVariables(payload.tokens)],
          ["Copy JSON tokens", JSON.stringify(payload, null, 2)],
          ["Copy Tailwind config draft", createTailwindDraft(payload.tokens)],
          ["Copy Figma variable checklist", createFigmaVariableChecklist(payload.tokens)]
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {payload.tokens.slice(0, 9).map((token, index) => (
          <div key={`token-${index}-${token.name}`} className="border border-line bg-surface-base p-4">
            <div className="h-14 border border-line" style={{ background: isHexColor(token.value) ? token.value : "var(--surface-panel)" }} />
            <p className="mt-3 font-mono text-xs uppercase text-accent-green">{token.name}</p>
            <p className="mt-2 text-sm text-ink-secondary">{token.value}</p>
            <p className="mt-2 text-xs leading-5 text-ink-muted">{token.usage}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SamplePanel title="Typography">
          <p className="text-2xl font-semibold text-ink-primary">Page title</p>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">Readable body copy for artifact review.</p>
          <p className="mt-3 font-mono text-xs uppercase text-accent-green">Mono label</p>
        </SamplePanel>
        <SamplePanel title="Spacing">
          {[4, 8, 16, 24].map((size) => (
            <div key={`spacing-${size}`} className="flex items-center gap-3">
              <div className="h-3 bg-accent-green" style={{ width: size * 3 }} />
              <span className="font-mono text-xs text-ink-muted">{size}px</span>
            </div>
          ))}
        </SamplePanel>
        <SamplePanel title="Radius">
          {[2, 4, 6, 10].map((size) => (
            <div key={`radius-${size}`} className="border border-accent-green bg-accent-soft p-3" style={{ borderRadius: size }}>
              <span className="font-mono text-xs text-ink-secondary">{size}px</span>
            </div>
          ))}
        </SamplePanel>
      </div>
      <div className="overflow-x-auto border border-line bg-surface-base">
        <table className="min-w-full text-left text-sm text-ink-secondary">
          <thead className="bg-surface-raised">
            <tr>
              {["Component", "Default", "Hover", "Focus", "Disabled"].map((header) => (
                <th key={header} className="border-b border-line px-3 py-2 font-mono text-xs uppercase text-accent-green">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["Button", "Input", "Card", "Badge"].map((component) => (
              <tr key={component} className="border-t border-line">
                <td className="px-3 py-2 font-medium text-ink-primary">{component}</td>
                <td className="px-3 py-2">Token-backed</td>
                <td className="px-3 py-2">Raised border</td>
                <td className="px-3 py-2">Accent ring</td>
                <td className="px-3 py-2">Muted text</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto border border-line bg-surface-base">
        <table className="min-w-full text-left text-sm text-ink-secondary">
          <thead className="bg-surface-raised">
            <tr>
              {["Figma variable", "Value", "Collection"].map((header) => (
                <th key={header} className="border-b border-line px-3 py-2 font-mono text-xs uppercase text-accent-green">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payload.tokens.slice(0, 10).map((token, index) => (
              <tr key={`figma-variable-${index}-${token.name}`} className="border-t border-line">
                <td className="px-3 py-2 font-mono text-xs text-ink-primary">{token.name.replace(/\./g, "/")}</td>
                <td className="px-3 py-2">{token.value}</td>
                <td className="px-3 py-2">Ship Design / V1</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Button", "Input", "Card", "Status Pill"].map((component) => (
          <div key={`component-card-${component}`} className="border border-line bg-surface-base p-4">
            <p className="font-mono text-xs uppercase text-accent-green">{component}</p>
            <p className="mt-2 text-sm leading-6 text-ink-secondary">Starter spec with default, hover, focus, disabled, loading, and error/review states where relevant.</p>
          </div>
        ))}
      </div>
      <ArtifactContentRenderer markdown={markdown} />
    </div>
  );
}

function LandingPageCopyVisual({ markdown }: { markdown: string }) {
  const sections = splitSections(markdown).filter((section) => section.title !== "Landing Page Copy");

  return (
    <div className="grid gap-4">
      {sections.map((section, sectionIndex) => (
        <div key={`landing-section-${sectionIndex}`} className="border border-line bg-surface-base p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-mono text-sm uppercase text-accent-green">{section.title}</h3>
            <CopyButton label="Copy section" value={[`## ${section.title}`, ...section.lines].join("\n")} />
          </div>
          <div className="mt-4">
            <ArtifactContentRenderer markdown={[`## ${section.title}`, ...section.lines].join("\n")} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CopyActionRow({ actions }: { actions: Array<[string, string]> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(([label, value]) => (
        <CopyButton key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      // The visual workflow still shows local feedback when clipboard permission is unavailable.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copy}>
      {copied ? "Copied" : label}
    </Button>
  );
}

function parseFlows(markdown: string): FlowGroup[] {
  const sections = splitSections(markdown).filter((section) => /flow/i.test(section.title));
  const flows = sections.map((section) => {
    const nodes = section.lines
      .map((line) => parseNodeLine(line))
      .filter((node): node is FlowGroup["nodes"][number] => Boolean(node));
    const edges = section.lines
      .map((line) => parseEdgeLine(line))
      .filter((edge): edge is FlowGroup["edges"][number] => Boolean(edge));

    return {
      title: section.title,
      nodes,
      edges
    };
  }).filter((flow) => flow.nodes.length > 0 || flow.edges.length > 0);

  if (flows.length > 0) return flows;

  const fallbackNodes = markdownToUsefulLines(markdown).slice(0, 5).map((line, index) => ({
    id: `step-${index + 1}`,
    label: line.slice(0, 42),
    purpose: line
  }));

  return [
    {
      title: "Primary Flow",
      nodes: fallbackNodes,
      edges: fallbackNodes.slice(1).map((node, index) => ({
        from: fallbackNodes[index].id,
        to: node.id,
        label: "Next"
      }))
    }
  ];
}

function parseNodeLine(line: string) {
  const cleaned = cleanListPrefix(line);
  const parts = cleaned.split("|").map((part) => part.trim());

  if (parts.length >= 3 && !cleaned.includes("->")) {
    return {
      id: slug(parts[0]),
      label: parts[1],
      purpose: parts.slice(2).join(" | ")
    };
  }

  return null;
}

function parseEdgeLine(line: string) {
  const cleaned = cleanListPrefix(line);
  const match = /^(.+?)\s*->\s*([^|]+)(?:\|\s*(.+))?$/.exec(cleaned);

  if (!match) return null;

  return {
    from: slug(match[1]),
    to: slug(match[2]),
    label: match[3]?.trim() ?? ""
  };
}

function parseScreens(markdown: string): ScreenSpec[] {
  const sections = splitSections(markdown).filter((section) => /^screen[:\s]/i.test(section.title));
  const screens = sections.map((section) => {
    const fields = parseFieldLines(section.lines);
    const name = section.title.replace(/^screen:\s*/i, "").trim();

    return {
      name,
      route: fields.route || fields["route or screen id"] || fields["screen id"] || fields.id || `/${slug(name)}`,
      device: fields["device target"] || "platform",
      purpose: fields.purpose || firstUsefulLine(section.lines) || "Describe the screen purpose.",
      sections: splitValue(fields["layout sections"] || fields.sections || "Header, Main content, Actions"),
      components: splitValue(fields.components || "Card, Button, Input"),
      copy: fields["main copy"] || fields.copy || "",
      states: splitValue(fields.states || "Default, Loading, Empty, Error"),
      interactions: fields["interaction notes"] || fields.interactions || "",
      notes: fields["design notes"] || fields.notes || ""
    };
  });

  if (screens.length > 0) return screens;

  return [
    {
      name: "Core Screen",
      route: "/core",
      device: "platform",
      purpose: firstUsefulLine(markdown.split("\n")) || "Core product experience.",
      sections: ["Header", "Primary content", "Action area"],
      components: ["Card", "Button", "Status pill"],
      copy: "",
      states: ["Default", "Loading", "Empty"],
      interactions: "Review generated artifact for detailed interactions.",
      notes: "Use Ship Design dark technical style."
    }
  ];
}

function createDesignSystemPayload(markdown: string) {
  return {
    type: "design-system-kit",
    tokens: parseTokens(markdown),
    source: markdown
  };
}

function parseTokens(markdown: string): DesignToken[] {
  const tableTokens = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes("|") && !/---/.test(line))
    .map((line) => line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2 && !/^token$/i.test(cells[0]))
    .map((cells) => ({
      name: cells[0],
      value: cells[1],
      usage: cells[2] ?? "Token"
    }));

  const listTokens = markdown
    .split("\n")
    .map((line) => /^[-*]\s+([^:]+):\s*(.+)$/.exec(line.trim()))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .map((match) => ({
      name: match[1].trim(),
      value: match[2].trim(),
      usage: "Token"
    }));

  const tokens = [...tableTokens, ...listTokens].filter((token) => token.name && token.value);

  if (tokens.length > 0) return uniqueByName(tokens).slice(0, 24);

  return [
    { name: "color.background.base", value: "#080A08", usage: "App background" },
    { name: "color.surface.panel", value: "#111511", usage: "Panels" },
    { name: "color.accent.primary", value: "#B6FF4D", usage: "Primary action" },
    { name: "radius.sm", value: "4px", usage: "Controls" },
    { name: "space.md", value: "16px", usage: "Layout spacing" }
  ];
}

function createMermaid(flows: FlowGroup[]) {
  const lines = ["flowchart TD"];

  for (const flow of flows) {
    lines.push(`  subgraph ${slug(flow.title)}["${flow.title}"]`);
    for (const node of flow.nodes) {
      lines.push(`    ${node.id}["${escapeMermaid(node.label)}"]`);
    }
    for (const edge of flow.edges) {
      lines.push(`    ${edge.from} -->|${escapeMermaid(edge.label || "next")}| ${edge.to}`);
    }
    lines.push("  end");
  }

  return lines.join("\n");
}

function createFlowSvg(flows: FlowGroup[]) {
  const nodes = flows.flatMap((flow) => flow.nodes.map((node) => ({ ...node, flow: flow.title }))).slice(0, 8);
  const height = Math.max(160, nodes.length * 72 + 32);
  const rows = nodes.map((node, index) => {
    const y = 24 + index * 72;

    return `<rect x="24" y="${y}" width="320" height="48" fill="#111511" stroke="#263126"/><text x="40" y="${y + 20}" fill="#B6FF4D" font-family="monospace" font-size="12">${escapeXml(node.label)}</text><text x="40" y="${y + 36}" fill="#A7ADA7" font-family="sans-serif" font-size="11">${escapeXml(node.flow)}</text>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="${height}" viewBox="0 0 380 ${height}"><rect width="380" height="${height}" fill="#080A08"/>${rows}</svg>`;
}

function createScreensSvg(screens: ScreenSpec[]) {
  const width = 390;
  const height = Math.max(240, screens.length * 220);
  const cards = screens.slice(0, 4).map((screen, index) => {
    const y = 24 + index * 208;

    return `<rect x="24" y="${y}" width="342" height="176" fill="#111511" stroke="#263126"/><text x="44" y="${y + 32}" fill="#B6FF4D" font-family="monospace" font-size="12">${escapeXml(screen.route)}</text><text x="44" y="${y + 58}" fill="#E6E8E6" font-family="sans-serif" font-size="18">${escapeXml(screen.name)}</text><rect x="44" y="${y + 82}" width="302" height="32" fill="#16220C" stroke="#3B4A3B"/><rect x="44" y="${y + 126}" width="140" height="24" fill="#0D100D" stroke="#263126"/><rect x="200" y="${y + 126}" width="146" height="24" fill="#0D100D" stroke="#263126"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#080A08"/>${cards}</svg>`;
}

function createCssVariables(tokens: DesignToken[]) {
  return [
    ":root {",
    ...tokens.map((token) => `  --${slug(token.name)}: ${token.value};`),
    "}"
  ].join("\n");
}

function createTailwindDraft(tokens: DesignToken[]) {
  return [
    "export default {",
    "  theme: {",
    "    extend: {",
    "      colors: {",
    ...tokens.filter((token) => token.name.includes("color") || isHexColor(token.value)).map((token) => `        '${slug(token.name)}': 'var(--${slug(token.name)})',`),
    "      }",
    "    }",
    "  }",
    "};"
  ].join("\n");
}

function createFigmaVariableChecklist(tokens: DesignToken[]) {
  return tokens.map((token) => `- [ ] ${token.name} = ${token.value}`).join("\n");
}

function splitSections(markdown: string) {
  const sections: Array<{ title: string; lines: string[] }> = [];
  let current = { title: "Overview", lines: [] as string[] };

  for (const line of normalizeMarkdownForDisplay(markdown).split("\n")) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());

    if (heading) {
      if (current.lines.length > 0 || current.title !== "Overview") sections.push(current);
      current = { title: heading[2].trim(), lines: [] };
      continue;
    }

    current.lines.push(line);
  }

  if (current.lines.length > 0 || current.title !== "Overview") sections.push(current);

  return sections;
}

function parseFieldLines(lines: string[]) {
  const fields: Record<string, string> = {};

  for (const line of lines) {
    const match = /^[-*]?\s*([^:]+):\s*(.+)$/.exec(line.trim());

    if (match) fields[match[1].trim().toLowerCase()] = match[2].trim();
  }

  return fields;
}

function splitValue(value: string) {
  return value.split(/,|;/).map((item) => item.trim()).filter(Boolean);
}

function markdownToUsefulLines(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.replace(/^#{1,3}\s+/, "").replace(/^[-*]\s+/, "").trim())
    .filter((line) => line && !line.includes("| ---"));
}

function firstUsefulLine(lines: string[]) {
  return markdownToUsefulLines(lines.join("\n"))[0] ?? "";
}

function cleanListPrefix(value: string) {
  return value.trim().replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "");
}

function createMarkdownFromArtifact(artifact: VisualArtifact) {
  return [`# ${artifact.title}`, "", artifact.summary, "", ...artifact.body.map((line) => `- ${line}`)].join("\n");
}

function uniqueByName(tokens: DesignToken[]) {
  const seen = new Set<string>();

  return tokens.filter((token) => {
    const key = token.name.toLowerCase();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function SamplePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 border border-line bg-surface-base p-4">
      <h3 className="font-mono text-sm uppercase text-accent-green">{title}</h3>
      {children}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase text-ink-muted">{label}</dt>
      <dd className="mt-1 leading-6 text-ink-secondary">{value || "Not specified"}</dd>
    </div>
  );
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{3,8}$/i.test(value.trim());
}

function isMobileScreen(screen: ScreenSpec) {
  return /mobile|phone|ios|android/i.test(screen.device);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

function escapeMermaid(value: string) {
  return value.replace(/"/g, "'");
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&apos;"
  }[character] ?? character));
}
