import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: "rgb(var(--surface-base) / <alpha-value>)",
          panel: "rgb(var(--surface-panel) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)"
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)"
        },
        accent: {
          green: "rgb(var(--accent-green) / <alpha-value>)",
          strong: "rgb(var(--accent-strong) / <alpha-value>)",
          muted: "rgb(var(--accent-muted) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)"
        },
        ink: {
          primary: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)"
        },
        status: {
          success: "rgb(var(--color-success-rgb) / <alpha-value>)",
          warning: "rgb(var(--color-warning-rgb) / <alpha-value>)",
          danger: "rgb(var(--color-danger-rgb) / <alpha-value>)",
          info: "rgb(var(--color-info-rgb) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      },
      borderRadius: {
        none: "var(--radius-none)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)"
      },
      spacing: {
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)"
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }],
        base: ["var(--text-md)", { lineHeight: "var(--leading-normal)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-normal)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-snug)" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-snug)" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-tight)" }],
        "4xl": ["var(--text-4xl)", { lineHeight: "var(--leading-tight)" }],
        "5xl": ["var(--text-5xl)", { lineHeight: "var(--leading-tight)" }],
        "6xl": ["var(--text-6xl)", { lineHeight: "var(--leading-tight)" }]
      },
      boxShadow: {
        none: "var(--shadow-none)",
        panel: "var(--shadow-panel)",
        elevated: "var(--shadow-elevated)",
        accent: "var(--shadow-accent)",
        danger: "var(--shadow-danger)"
      }
    }
  },
  plugins: []
};

export default config;
