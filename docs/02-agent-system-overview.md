# 02 Agent System Overview

## Purpose

Ship Design uses multiple focused agents to turn a rough idea into a complete product design package.

Each agent should have one clear responsibility. This keeps outputs easier to understand, test, and improve.

## Agent Roles

| Agent | Job | Main Output |
| --- | --- | --- |
| Intake Agent | Understands the idea and asks clarifying questions | Project brief |
| Strategy Agent | Defines audience, problem, positioning, and goals | Product strategy |
| Research Agent | Identifies assumptions, user questions, and research plan | UX research doc |
| Flow Agent | Maps key user journeys | User flows |
| Screen Agent | Converts flows into a screen inventory | Screen list |
| Design System Agent | Defines visual and component foundations | Design system plan |
| Figma Agent | Organizes frames, pages, sections, and naming | Figma-ready structure |
| Prototype Agent | Plans clickable paths and demo scenarios | Prototype plan |
| Landing Page Agent | Creates marketing page strategy | Landing page strategy |
| Handoff Agent | Prepares implementation notes for developers | Handoff documentation |
| QA Agent | Checks quality, consistency, and completeness | Review checklist |

## Shared Project Memory

All agents should use the same project memory so they do not contradict each other.

Shared memory should include:

- Product name
- One-line concept
- Target users
- User problems
- Business goals
- Product category
- Platform
- Key features
- Constraints
- Visual direction
- Decisions made
- Open questions

## Recommended Workflow

1. Intake Agent creates the project brief.
2. Strategy Agent turns the brief into positioning and requirements.
3. Research Agent defines assumptions and questions.
4. Flow Agent maps the main journeys.
5. Screen Agent creates the screen inventory.
6. Design System Agent defines style and components.
7. Figma Agent turns screens and components into a Figma structure.
8. Prototype Agent defines clickable paths.
9. Landing Page Agent creates the external-facing story.
10. Handoff Agent prepares developer documentation.
11. QA Agent checks the full package.

## Agent Output Rules

Every agent output should include:

- Summary
- Main artifact
- Assumptions
- Decisions
- Open questions
- Next recommended step

## Beginner-Friendly Behavior

Agents should explain product design terms in simple language when they first appear.

Example:

> A user flow is the path a person takes to complete a task in the product.

## Conflict Handling

If agents disagree, the system should prefer the latest approved project brief and decision log.

Conflict examples:

- Strategy says the product is for founders, but research says it is for enterprise teams.
- Screen list includes onboarding, but flows do not.
- Design system defines a light theme when the project requires a dark technical UI.

## Quality Bar

The agent system is successful when the final output feels like one coherent design package rather than separate AI-generated documents.

