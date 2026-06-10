# 04 Screen List

## Purpose

The screen list is the inventory of screens Ship Design may need for the MVP.

This is not final UI. It is a planning document that helps future design and development work stay organized.

## Core Product Screens

| Screen | Purpose | Notes |
| --- | --- | --- |
| Project Dashboard | Shows all design projects | Can be simple in MVP |
| New Project Intake | Captures the product idea | Most important first interaction |
| Clarifying Questions | Collects missing context | Should feel focused, not like a long form |
| Project Brief | Shows the approved source of truth | Used by all agents |
| Agent Run Overview | Shows current generation progress | Should communicate status clearly |
| Artifact List | Lists generated docs | Helps users navigate outputs |
| Artifact Detail | Shows one generated artifact | Must support review and editing later |
| Decision Log | Stores approved decisions | Prevents agent contradictions |
| Open Questions | Tracks unresolved issues | Useful for designers and founders |
| Export Center | Prepares docs for copying or download | Later can support Figma handoff |

## Artifact Screens

| Screen | Purpose |
| --- | --- |
| Product Strategy | Displays positioning, audience, goals, and scope |
| UX Research | Displays assumptions, questions, and research plan |
| User Flows | Displays step-by-step flows |
| Screen Inventory | Displays all planned screens |
| Design System | Displays color, type, components, and interaction rules |
| Figma Structure | Displays page, frame, and component organization |
| Prototype Plan | Displays clickable paths and demo scenarios |
| Landing Page Strategy | Displays page structure and messaging |
| Developer Handoff | Displays implementation notes |
| Quality Checklist | Displays completeness and consistency checks |

## Important States

Each major screen should consider:

- Empty state
- Loading state
- Agent working state
- Success state
- Error state
- Needs review state
- Approved state

## Navigation Model

Recommended MVP navigation:

- Left sidebar for project sections
- Main panel for current artifact
- Right panel for context, decisions, or open questions
- Top status bar for project and agent state

## Screen Naming Rules

Use clear, practical names:

- Good: `Project Brief`
- Good: `Screen Inventory`
- Good: `Agent Run Overview`
- Avoid: `Magic Workspace`
- Avoid: `AI Studio`

Names should explain what the user can inspect or do.

