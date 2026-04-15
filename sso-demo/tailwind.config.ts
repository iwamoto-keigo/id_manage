import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "var(--font-display)",
          '"Hiragino Mincho ProN"',
          '"Yu Mincho"',
          "ui-serif",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-body)",
          '"Hiragino Sans"',
          '"Yu Gothic"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        paper: "hsl(40 33% 94%)",
        ink: "hsl(35 13% 10%)",
        rule: "hsl(36 22% 80%)",
        sienna: "hsl(12 50% 36%)",
        forest: "hsl(165 34% 24%)",
        muted: "hsl(35 8% 38%)",
      },
      borderRadius: {
        none: "0",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
