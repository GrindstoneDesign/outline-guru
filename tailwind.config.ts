
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
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "space-black": "#0A0A0F",
        "cosmic-purple": "#1A1A2E",
        "electric-teal": "#00F5E9",
        "neon-magenta": "#FF00FF",
        "spectral-white": "#E6F1FF",
        border: "#FFFFFF0D",
        input: "#1A1A2E",
        ring: "#00F5E9",
        background: "#0A0A0F",
        foreground: "#E6F1FF",
        primary: {
          DEFAULT: "#00F5E9",
          hover: "#33F7ED",
          foreground: "#0A0A0F",
        },
        secondary: {
          DEFAULT: "#FF00FF",
          hover: "#FF33FF",
          foreground: "#0A0A0F",
        },
        destructive: {
          DEFAULT: "hsl(0 62.8% 30.6%)",
          foreground: "#E6F1FF",
        },
        muted: {
          DEFAULT: "#1A1A2E",
          foreground: "#E6F1FF99",
        },
        accent: {
          DEFAULT: "#1A1A2E",
          foreground: "#E6F1FF",
        },
        card: {
          DEFAULT: "#1A1A2E",
          foreground: "#E6F1FF",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        heading: ["Rajdhani", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      boxShadow: {
        neon: "0 0 5px theme('colors.electric-teal'), 0 0 20px theme('colors.electric-teal')",
        "neon-strong": "0 0 10px theme('colors.electric-teal'), 0 0 30px theme('colors.electric-teal')",
        holographic: "0 0 20px rgba(0, 245, 233, 0.2), 0 0 40px rgba(255, 0, 255, 0.1)",
      },
      backgroundImage: {
        "gradient-cyber": "linear-gradient(45deg, #00F5E9, #FF00FF)",
        "gradient-dark": "linear-gradient(to bottom right, #0A0A0F, #1A1A2E)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        warp: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        warp: "warp 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
