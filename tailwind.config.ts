import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      /* ── Fonts ── */
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontWeight: {
        normal:   "400",
        medium:   "500",
        semibold: "600",
      },

      /* ── Brand & Palette ── */
      colors: {
        brand: {
          50:  "#ECFDF5",
          100: "#D1FAE5",
          500: "#059669",
          600: "#047857",
        },
        gray: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#030712",
        },
        green:  { 400: "#34D399", 500: "#10B981" },
        red:    { 400: "#F87171", 500: "#EF4444" },
        amber:  { 400: "#FBBF24", 500: "#F59E0B" },
        blue:   { 400: "#60A5FA", 500: "#3B82F6" },

        /* Semantic aliases via CSS var — usados em utilities */
        "ff-bg":       "var(--color-bg-primary)",
        "ff-bg-sub":   "var(--color-bg-secondary)",
        "ff-bg-3":     "var(--color-bg-tertiary)",
        "ff-elevated": "var(--color-bg-elevated)",
        "ff-text":     "var(--color-text-primary)",
        "ff-muted":    "var(--color-text-muted)",
        "ff-accent":   "var(--color-accent)",
        "ff-border":   "var(--color-border)",
        "ff-success":  "var(--color-success)",
        "ff-warning":  "var(--color-warning)",
        "ff-danger":   "var(--color-danger)",
        "ff-info":     "var(--color-info)",
      },

      /* ── Border Radius (Swiss precision) ── */
      borderRadius: {
        none: "0",
        sm:   "0.25rem",
        md:   "0.375rem",
        lg:   "0.5rem",
        xl:   "0.75rem",
      },

      /* ── Spacing (Base 8px modular scale) ── */
      spacing: {
        "px05": "0.125rem",
        "1":    "0.25rem",
        "2":    "0.5rem",
        "3":    "0.75rem",
        "4":    "1rem",
        "6":    "1.5rem",
        "8":    "2rem",
        "10":   "2.5rem",
        "12":   "3rem",
        "16":   "4rem",
        "20":   "5rem",
        "24":   "6rem",
        "32":   "8rem",
      },
    },
  },
  plugins: [],
};

export default config;
