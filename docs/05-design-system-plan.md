# 05 Design System Kit

## Purpose

This document defines the early design system direction for Ship Design.

The design system should make the product feel technical, precise, and premium while staying readable for beginners.

## Visual Direction

Ship Design should use a dark technical interface with acid green accents, crisp 1px borders, minimal radius, and grid-based composition.

The style may reference terminal interfaces, command palettes, structured data tools, and developer dashboards.

## Design Principles

1. Clarity before decoration
2. Structure before spectacle
3. Calm density
4. Visible system status
5. Sharp but approachable technical feel
6. Beginner-friendly language inside expert-grade tooling

## Color Tokens

Suggested starting tokens:

| Token | Use | Example |
| --- | --- | --- |
| `bg.base` | Main app background | Near black |
| `bg.panel` | Panels and sections | Dark charcoal |
| `bg.elevated` | Active surfaces | Slightly lighter charcoal |
| `border.default` | Standard 1px borders | Muted gray |
| `border.strong` | Active or important borders | Brighter gray |
| `text.primary` | Main text | Off white |
| `text.secondary` | Supporting text | Cool gray |
| `text.muted` | Metadata | Muted gray |
| `accent.green` | Primary accent | Acid green |
| `status.warning` | Warning state | Amber |
| `status.error` | Error state | Red |
| `status.info` | Info state | Cyan |

## Typography

Recommended direction:

- Use a clean sans-serif for body text.
- Use a mono font for labels, metadata, IDs, statuses, command-like content, and artifact tags.
- Keep hierarchy clear, not oversized.

Text categories:

| Category | Font Style | Use |
| --- | --- | --- |
| Page title | Sans | Main screen title |
| Body | Sans | Descriptions and readable docs |
| Label | Mono | Field labels and panel headers |
| Status | Mono | Agent state and progress |
| Code-like | Mono | IDs, tokens, file names, output formats |

## Layout

Use grid-based layouts:

- App shell with sidebar, main content, and optional right context panel
- Crisp panel boundaries
- Consistent spacing scale
- Minimal radius, usually 0 to 4px
- No soft floating card-heavy layout

## Core Components

MVP components:

- App shell
- Sidebar navigation
- Top status bar
- Command input
- Text area
- Button
- Icon button
- Tabs
- Segmented control
- Progress stepper
- Agent status row
- Artifact list item
- Artifact editor panel
- Decision log item
- Checklist item
- Alert
- Modal
- Toast

## Interaction Style

Interactions should feel fast and precise:

- Clear hover and focus states
- Keyboard-friendly controls
- Visible loading and agent activity
- Compact status messages
- No vague animations
- No decorative motion that distracts from work

## Accessibility Notes

- Acid green should not be the only way to communicate meaning.
- Text contrast must be high.
- Focus states must be visible.
- Dense layouts still need readable spacing.
- Important controls must have text labels or accessible labels.

## Figma Use

When implemented in Figma, create:

- Color variables
- Text styles
- Layout grid styles
- Core components
- Component variants for states
- Example screens using the system
