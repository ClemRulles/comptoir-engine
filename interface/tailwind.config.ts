import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // HypeInvest — fond clair, accents verts du logo
        bg: "#f5f7fa",
        card: "#ffffff",
        line: "#e7ebf1",
        ink: "#0f2438",
        muted: "#6b7a90",
        brand: {
          DEFAULT: "#16a34a",
          600: "#15803d",
          500: "#22c55e",
          lime: "#84cc16",
          emerald: "#10b981",
        },
        ai: "#f59e0b",
        danger: "#ef4444",
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
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "pop-in": "pop-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
