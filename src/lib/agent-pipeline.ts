import { mockAgentRuns } from "./mock-data";

export const agentPipeline = [
  "Intake",
  "Strategy",
  "Research",
  "Flows",
  "Design System",
  "Figma Structure",
  "Prototype",
  "Landing Page",
  "QA Handoff"
];

export function getMockAgentPipeline() {
  return mockAgentRuns;
}

