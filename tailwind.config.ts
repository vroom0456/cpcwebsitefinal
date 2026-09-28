import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Premium Cinematic Purple Palette
        cpcDeep: "#0A0510",     // Very dark background purple
        cpcDark: "#170B24",     // Dark purple surface
        cpcPurple: "#4F168E",   // Primary brand purple
        cpcLight: "#9D5EE5",    // Highlight purple
        cpcWhite: "#F8F5FB",    // Off-white with purple tint
        cpcBlack: "#05020A",    // True black with purple tint
        // Legacy colors kept for components that still reference them
        DarkLava: "#393632",
        SageGray: "#8b8b73",
        sageGreen: "#8A9A86",
        darkMauve: "#5C4D54",
        gold: "#8A9A86",
        seaPrimary: "#e5e5e0",
        // Tailwind semantic tokens (from CSS variables)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Cinematic minimalistic font
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        garet: ["var(--font-outfit)", "system-ui", "sans-serif"], // Alias to outfit
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth expo out
        'cinematic-in': 'cubic-bezier(0.87, 0, 0.13, 1)', // Smooth ease in-out
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-100% - var(--gap, 0px)))" },
        },
        "float-orb": {
          "0%": { transform: "translateY(0px) translateX(0px) scale(1)" },
          "33%": { transform: "translateY(-30px) translateX(20px) scale(1.05)" },
          "66%": { transform: "translateY(-15px) translateX(-10px) scale(0.97)" },
          "100%": { transform: "translateY(0px) translateX(0px) scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "glow-pulse-slow": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(157,94,229,0.15)" },
          "50%": { borderColor: "rgba(157,94,229,0.4)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        marquee: "marquee 40s infinite linear",
        "float-y": "float-y 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float-orb": "float-orb 14s ease-in-out infinite",
        "glow-pulse-slow": "glow-pulse-slow 8s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease both",
        "border-glow": "border-glow 3s ease-in-out infinite",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
    },
  },
  plugins: [],
};

export default config;
