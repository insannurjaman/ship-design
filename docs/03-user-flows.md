# 03 User Flows

## Purpose

This document describes the main user journeys for Ship Design.

A user flow shows the steps a person takes to complete a task.

## Primary Flow: Idea To Design Package

1. User starts a new project.
2. User enters a product idea.
3. Ship Design summarizes the idea.
4. Ship Design asks clarifying questions if needed.
5. User confirms the project brief.
6. Agents generate strategy and requirements.
7. User reviews and edits the strategy.
8. Agents generate research, flows, and screen inventory.
9. User reviews the design plan.
10. Agents generate Figma structure, design system plan, prototype plan, landing page strategy, and handoff notes.
11. QA Agent checks the full package.
12. User exports, copies, or continues into Figma.

## Flow: Clarify A Weak Idea

1. User enters a vague idea.
2. Intake Agent detects missing information.
3. System asks focused questions.
4. User answers what they know.
5. System suggests defaults for unknowns.
6. User accepts or edits defaults.
7. Project brief is created.

## Flow: Review And Revise Artifact

1. User opens a generated artifact.
2. User reads the summary.
3. User edits sections directly or asks for changes.
4. Agent updates the artifact.
5. QA Agent checks whether related artifacts need updates.
6. User approves the new version.

## Flow: Prepare For Figma

1. User approves the screen inventory.
2. Figma Agent creates a page and frame structure.
3. Design System Agent defines components and tokens.
4. Prototype Agent defines clickable paths.
5. User reviews the Figma plan.
6. System prepares output that can be recreated or automated in Figma.

## Flow: Prepare Developer Handoff

1. User approves final screens and prototype plan.
2. Handoff Agent summarizes features and states.
3. Handoff Agent lists components and data needs.
4. Handoff Agent identifies edge cases.
5. QA Agent checks for missing screens or unclear states.
6. User exports developer handoff documentation.

## Flow Quality Checklist

- Does every flow have a clear start and end?
- Does each flow match a real user goal?
- Are important decision points included?
- Are errors and empty states considered?
- Can the screen list be derived from the flows?
- Can the prototype be derived from the flows?

