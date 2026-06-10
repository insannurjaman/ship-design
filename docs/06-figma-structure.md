# 06 Figma Structure

## Purpose

This document explains how Ship Design outputs should be organized for Figma.

The goal is to make generated design work easy for a human designer to inspect, edit, and extend.

## Recommended Figma Pages

| Page | Purpose |
| --- | --- |
| `00 Cover` | Project title, summary, and status |
| `01 Product Strategy` | Strategy, audience, goals, and scope |
| `02 Research` | Assumptions, questions, and research plan |
| `03 Flows` | User flows and journey diagrams |
| `04 Wireframes` | Low-fidelity layouts |
| `05 Screens` | High-fidelity product screens |
| `06 Components` | Design system components |
| `07 Prototype` | Clickable prototype paths |
| `08 Handoff` | Developer notes and specs |

## Frame Naming

Use names that describe the screen and state.

Examples:

- `Intake / Empty`
- `Intake / With Idea`
- `Agent Run / In Progress`
- `Artifact Detail / Product Strategy`
- `Export Center / Ready`

Avoid vague names like:

- `Frame 1`
- `Final`
- `New screen`
- `Dashboard v7`

## Component Naming

Use slash-based component names:

- `Button/Primary`
- `Button/Secondary`
- `Input/Text Area`
- `Status/Agent Running`
- `Navigation/Sidebar Item`
- `Artifact/List Item`
- `Checklist/Row`

## Layer Naming

Layers should be readable and practical.

Good layer names:

- `Page title`
- `Project status`
- `Artifact list`
- `Agent activity row`
- `Decision log`

Avoid:

- `Rectangle 123`
- `Group 48`
- `Vector`

## Auto Layout Guidance

Use Auto Layout for:

- Navigation groups
- Toolbar rows
- Forms
- Lists
- Cards or repeated items
- Modal content
- Artifact sections

Use layout grids for:

- App shell
- Dashboard
- Multi-panel workspace
- Screen composition

## Prototype Structure

Recommended prototype paths:

- New project intake
- Clarifying questions
- Agent generation progress
- Artifact review
- Figma structure review
- Export or handoff

## Handoff Notes

Each screen should include:

- Purpose
- Primary user action
- Important states
- Component list
- Data requirements
- Edge cases

## Figma Quality Checklist

- Pages are ordered logically.
- Frames are named clearly.
- Components use consistent naming.
- Text styles are applied consistently.
- Color variables are used.
- Important states are represented.
- Prototype links follow real user flows.
- Handoff notes are visible and practical.

