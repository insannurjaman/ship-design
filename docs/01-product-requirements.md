# 01 Product Requirements

## Goal

Create a guided AI product design system that transforms a product idea into practical design artifacts.

## MVP User

The MVP should focus on one main user:

> A founder or product designer who has an idea and needs to quickly turn it into a clear product design plan.

## Main User Input

The user starts with a short product idea, for example:

> "A dashboard that helps small SaaS teams understand customer churn risk."

Ship Design should then ask focused questions only when needed.

## Core MVP Output

The MVP should generate:

| Output | Purpose |
| --- | --- |
| Product brief | Clarifies the idea, audience, problem, and promise |
| Requirements | Defines core features, constraints, and success metrics |
| Research plan | Lists assumptions, questions, and lightweight research tasks |
| User flows | Shows how users move through the product |
| Screen list | Names every needed screen and its purpose |
| Design system plan | Defines typography, colors, components, and interaction patterns |
| Figma structure | Explains how to organize pages, frames, and components |
| Prototype plan | Defines clickable paths and demo scenarios |
| Landing page strategy | Explains how to sell the product clearly |
| Handoff notes | Gives developers implementation context |

## Functional Requirements

1. Accept a product idea from the user.
2. Identify the likely product category and target user.
3. Ask clarifying questions if the idea is too vague.
4. Generate product strategy documentation.
5. Generate UX research documentation.
6. Generate user flows.
7. Generate a screen inventory.
8. Generate a design system direction.
9. Generate a Figma-ready structure.
10. Generate a prototype plan.
11. Generate landing page messaging and structure.
12. Generate developer handoff documentation.
13. Allow the user to revise outputs.
14. Keep all generated artifacts organized by project.

## Non-Functional Requirements

- Outputs should be readable by beginners.
- Outputs should be structured enough for automation.
- The interface should make progress visible.
- The system should preserve decisions across steps.
- The product should feel fast even when agents are working.
- Generated docs should be editable.
- Every artifact should have a clear purpose.

## Key Product Behaviors

### Guided Intake

The system should start with the product idea, then ask for missing basics:

- Target user
- Problem
- Product type
- Business goal
- Platform
- Style preference
- Constraints

### Agentic Generation

The system should divide work across specialized agents. Each agent should have a clear job and output format.

### Review Before Next Step

The user should be able to review major outputs before using them as input for later stages.

### Practical Defaults

If the user does not know an answer, Ship Design should suggest a reasonable default and explain it briefly.

## MVP Constraints

- One project at a time
- One primary product idea per project
- Text-first artifact generation
- Figma-ready structure before direct Figma automation
- Simple prototype planning before advanced prototyping

## Success Metrics

Track:

- Time from idea to complete design package
- Number of artifacts generated
- User edits per artifact
- Completion rate through the full workflow
- User rating of output usefulness
- Number of projects that move into Figma or engineering

## Risks

| Risk | Mitigation |
| --- | --- |
| Outputs feel generic | Ask better intake questions and use product-specific patterns |
| Too much text overwhelms users | Use summaries, progressive reveal, and clear artifact sections |
| Figma output is hard to use | Maintain a strict Figma structure plan |
| Agents contradict each other | Use a shared project brief and decision log |
| MVP scope grows too large | Keep the first version text-first and guided |

