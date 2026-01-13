import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#050b14",
        foreground: "#f8fafc",
        primary: {
          DEFAULT: "#C9A635",
          foreground: "#050b14",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#f8fafc",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#0f172a",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#C9A635",
          foreground: "#050b14",
        },
        card: {
          DEFAULT: "#0a121e",
          foreground: "#f8fafc",
        },
        // Tactical Colors
        'lapd-navy': '#0A1A2F',
        'lapd-darker': '#050b14',
        'lapd-gold': '#C9A635',
        'lapd-gray': '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;