export type AgentStatus = "queued" | "running" | "complete" | "needs-review" | "error";

export type Project = {
  id: string;
  name: string;
  idea: string;
  type: string;
  targetUsers: string;
  goal: string;
  status: "draft" | "generating" | "review" | "ready";
  updatedAt: string;
  outputs: number;
  progress: number;
};

export type AgentRun = {
  id: string;
  name: string;
  status: AgentStatus;
  output: string;
  description: string;
  progress: number;
};

export type OutputArtifact = {
  id: string;
  title: string;
  type: string;
  status: "draft" | "ready" | "needs-review" | "error";
  summary: string;
  body: string[];
};

export type AgentTemplate = {
  name: string;
  role: string;
  status: "enabled" | "queued" | "beta";
};

export type ActivityLog = {
  id: string;
  time: string;
  label: string;
  message: string;
  tone: "success" | "info" | "warning" | "danger";
};

export const mockProjects: Project[] = [
  {
    id: "project-aurora",
    name: "Aurora Retention OS",
    idea: "A dashboard that helps small SaaS teams understand customer churn risk before renewal conversations.",
    type: "B2B SaaS",
    targetUsers: "Founders, customer success leads, and product managers at lean SaaS teams",
    goal: "Turn scattered product and account signals into a prioritized retention workspace.",
    status: "review",
    updatedAt: "Today",
    outputs: 8,
    progress: 72
  },
  {
    id: "project-forge",
    name: "Forge Brief",
    idea: "A product planning workspace for agencies turning client ideas into MVP specs.",
    type: "Agency workflow",
    targetUsers: "Product strategists, agency founders, and delivery leads",
    goal: "Make discovery outputs consistent enough to move directly into design and engineering.",
    status: "generating",
    updatedAt: "Yesterday",
    outputs: 8,
    progress: 48
  },
  {
    id: "project-nova",
    name: "Nova Launch Desk",
    idea: "A launch command center for founders preparing landing pages, onboarding flows, and investor demos.",
    type: "Founder tool",
    targetUsers: "Solo founders and tiny teams shipping first versions",
    goal: "Compress launch planning into one clear design and handoff package.",
    status: "draft",
    updatedAt: "3 days ago",
    outputs: 0,
    progress: 12
  }
];

export const mockAgentRuns: AgentRun[] = [
  {
    id: "strategy",
    name: "Product Strategy Agent",
    status: "complete",
    output: "Positioning, audience, promise, MVP scope",
    description: "Locked the product thesis and the first buyer/user segment.",
    progress: 100
  },
  {
    id: "research",
    name: "UX Research Agent",
    status: "complete",
    output: "Assumptions, research questions, risks",
    description: "Converted product unknowns into a lightweight validation plan.",
    progress: 100
  },
  {
    id: "flows",
    name: "UX Flow Agent",
    status: "running",
    output: "Primary journey and screen inventory",
    description: "Mapping the intake-to-output review path and edge cases.",
    progress: 68
  },
  {
    id: "system",
    name: "Design System Agent",
    status: "queued",
    output: "Token plan, components, layout rules",
    description: "Waiting for flow approval before generating component needs.",
    progress: 0
  },
  {
    id: "figma",
    name: "Figma Builder Agent",
    status: "queued",
    output: "Pages, frames, components, prototype links",
    description: "Ready to assemble Figma structure after design system pass.",
    progress: 0
  },
  {
    id: "landing",
    name: "Landing Page Agent",
    status: "queued",
    output: "Hero copy, proof points, CTA structure",
    description: "Preparing the marketing narrative from approved product strategy.",
    progress: 0
  },
  {
    id: "handoff",
    name: "QA Handoff Agent",
    status: "queued",
    output: "Developer handoff docs, states, QA notes",
    description: "Ready to package implementation notes and review gates.",
    progress: 0
  }
];

export const mockOutputs: OutputArtifact[] = [
  {
    id: "brief",
    title: "Product Brief",
    type: "Strategy",
    status: "ready",
    summary: "Source of truth for audience, problem, promise, and constraints.",
    body: [
      "Aurora Retention OS helps lean SaaS teams turn churn signals into a focused weekly action plan.",
      "Primary users need a calm workspace that explains which accounts need attention and why.",
      "MVP success means teams can create one prioritized retention review without spreadsheets."
    ]
  },
  {
    id: "research",
    title: "UX Docs",
    type: "Research",
    status: "ready",
    summary: "Assumptions, user questions, lightweight interview prompts.",
    body: [
      "Key assumption: small teams already have signals, but lack a shared interpretation layer.",
      "Research should test whether risk explanations are trusted enough to trigger action.",
      "Interview users should include founders, CS leads, and product managers who own renewals."
    ]
  },
  {
    id: "flows",
    title: "User Flows",
    type: "UX",
    status: "needs-review",
    summary: "Primary path from idea intake to approved design package.",
    body: [
      "Start with a workspace summary, select a high-risk account, inspect signals, assign next action.",
      "Secondary flow covers importing account notes and confirming the scoring model.",
      "Recovery flow explains what happens when signal quality is low or stale."
    ]
  },
  {
    id: "screens",
    title: "Screen List",
    type: "Inventory",
    status: "ready",
    summary: "Dashboard, account detail, risk review, action queue, settings, and handoff states.",
    body: [
      "Dashboard: portfolio health, urgent accounts, trend deltas, and weekly focus.",
      "Account detail: risk drivers, activity timeline, next action recommendation.",
      "Settings: integrations, scoring controls, workspace preferences."
    ]
  },
  {
    id: "system",
    title: "Design System Plan",
    type: "Design",
    status: "draft",
    summary: "Token plan, component inventory, state coverage, and responsive behavior.",
    body: [
      "Use a technical dark interface with acid green as action and focus color.",
      "Core components include app shell, cards, tabs, progress, logs, status pills, and form controls.",
      "All system states must include loading, empty, error, success, disabled, and review variants."
    ]
  },
  {
    id: "figma",
    title: "Figma Plan",
    type: "Figma",
    status: "draft",
    summary: "Page, frame, component, and handoff organization plan.",
    body: [
      "Create pages for strategy, research, flows, screens, design system, prototype, and handoff.",
      "Use slash-based names and variable-backed color decisions.",
      "Prototype should follow dashboard, intake, agent run, output review, Figma generation, and handoff."
    ]
  },
  {
    id: "landing",
    title: "Landing Page Copy",
    type: "Marketing",
    status: "needs-review",
    summary: "Positioning, first viewport, proof points, and conversion actions.",
    body: [
      "Lead with the promise: one product idea becomes a design-ready package.",
      "Show the artifact pipeline instead of generic AI claims.",
      "Primary CTA starts a project; secondary CTA opens a sample output."
    ]
  },
  {
    id: "handoff",
    title: "Handoff Docs",
    type: "Engineering",
    status: "ready",
    summary: "Implementation notes, component map, states, and open decisions.",
    body: [
      "Engineering handoff includes routes, component inventory, data requirements, and edge states.",
      "Open decisions are explicitly separated from confirmed implementation guidance.",
      "Figma links and exported markdown should reference the same artifact names."
    ]
  }
];

export const mockAgentTemplates: AgentTemplate[] = [
  { name: "Strategy", role: "Positioning and MVP scope", status: "enabled" },
  { name: "Research", role: "Assumptions and interview plan", status: "enabled" },
  { name: "Flows", role: "Journeys and screen inventory", status: "enabled" },
  { name: "Design System", role: "Tokens, components, and responsive rules", status: "enabled" },
  { name: "Figma", role: "Pages, frames, components", status: "queued" },
  { name: "Landing", role: "Hero copy, proof points, CTA structure", status: "enabled" },
  { name: "Handoff", role: "Engineering notes and export", status: "beta" }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    time: "09:41",
    label: "Strategy",
    message: "Defined Aurora's core promise and excluded enterprise analytics from MVP.",
    tone: "success"
  },
  {
    id: "log-2",
    time: "09:48",
    label: "Research",
    message: "Added validation questions for trust, explainability, and action ownership.",
    tone: "success"
  },
  {
    id: "log-3",
    time: "09:57",
    label: "Flow",
    message: "Generating the account-risk review path and low-confidence recovery branch.",
    tone: "info"
  },
  {
    id: "log-4",
    time: "10:02",
    label: "Review",
    message: "One output needs human review before Figma generation starts.",
    tone: "warning"
  },
  {
    id: "log-5",
    time: "10:04",
    label: "Figma",
    message: "Prepared Figma page map, component notes, and prototype-ready frame names.",
    tone: "info"
  },
  {
    id: "log-6",
    time: "10:07",
    label: "Complete",
    message: "Mock package generated with strategy, UX, design system, landing copy, and handoff docs.",
    tone: "success"
  }
];

export const mockUsageSummary = {
  projectsThisMonth: 3,
  agentRuns: 21,
  figmaSyncs: 7,
  handoffs: 8
};

export const mockFigmaConnection = {
  workspace: "Career Workspace",
  file: "Ship Design - V1",
  status: "Connected",
  lastSync: "2 minutes ago"
};

export const mockSettings = {
  workspaceName: "Money Print",
  defaultOutputs: [
    "Product Brief",
    "UX Docs",
    "User Flows",
    "Screen List",
    "Design System Plan",
    "Figma Plan",
    "Landing Page Copy",
    "Handoff Docs"
  ],
  modelPreference: "Balanced orchestration",
  exportFormat: "Markdown + Figma notes"
};
