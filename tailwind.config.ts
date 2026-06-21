import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta específica del brief: oro árabe sobre obsidiana
        obsidian: "#050505",
        ebony: "#0C0A08",
        coal: "#0A0908",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8C766",
          champagne: "#F4E088",
          dark: "#8B6F1E",
          deep: "#6B5418",
        },
        ivory: "#F5EFE0",
        pearl: "#EAE3D2",
        smoke: "#1A1714",
      },
      fontFamily: {
        // Identidad de marca: romana lapidaria
        lapidary: ["var(--font-cinzel)", "serif"],
        // Display editorial para precios y títulos
        display: ["var(--font-cormorant)", "serif"],
        // Sans geométrico para cuerpo
        sans: ["var(--font-jost)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        regal: "0.35em",
        imperial: "0.5em",
      },
      animation: {
        shimmer: "shimmer 4s linear infinite",
        "shimmer-fast": "shimmer 2.5s linear infinite",
        "gold-pulse": "gold-pulse 3s ease-in-out infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-up": "slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "twinkle": "twinkle 4s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "gold-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        gold: "0 0 30px -5px rgba(212, 175, 55, 0.4)",
        "gold-soft": "0 0 60px -15px rgba(212, 175, 55, 0.25)",
        "inner-gold": "inset 0 0 0 1px rgba(212, 175, 55, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
