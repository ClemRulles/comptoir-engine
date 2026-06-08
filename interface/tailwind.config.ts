import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

// Couleur via variables CSS : `rgb(var(--x) / <alpha-value>)` garde le support des
// modificateurs d'opacité (bg-bg/70, text-muted/40…). Les tokens neutres ET la palette
// `slate` (utilisée un peu partout) basculent automatiquement en dark mode (classe .dark).
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens sémantiques (thématisés)
        bg: v("--c-bg"),
        card: v("--c-card"),
        line: v("--c-line"),
        ink: v("--c-ink"),
        muted: v("--c-muted"),
        // Accents (identiques light/dark)
        brand: {
          DEFAULT: "#16a34a",
          600: "#15803d",
          500: "#22c55e",
          lime: "#84cc16",
          emerald: "#10b981",
        },
        ai: "#f59e0b",
        danger: "#ef4444",
        // Palette slate : on garde toutes les nuances par défaut et on rend
        // thématiques les 5 nuances réellement employées dans l'app.
        slate: {
          ...colors.slate,
          100: v("--slate-100"),
          300: v("--slate-300"),
          500: v("--slate-500"),
          600: v("--slate-600"),
          700: v("--slate-700"),
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,36,56,0.04), 0 8px 24px rgba(16,36,56,0.06)",
        glow: "0 10px 30px rgba(22,163,74,0.25)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #84cc16 0%, #16a34a 55%, #0d9488 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "drift-slow": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, 3%, 0) scale(1.06)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        "spark-draw": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "pop-in": "pop-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.6s infinite",
        "drift-slow": "drift-slow 18s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "spark-draw": "spark-draw 0.7s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
