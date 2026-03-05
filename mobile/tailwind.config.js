/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#F5F7FB",
        card: "#FFFFFF",
        foreground: "#111827",
        muted: "#6B7280",
        border: "#D9E0EB",
        primary: "#2563EB",
        "dark-background": "#0D111B",
        "dark-card": "#151C2C",
        "dark-foreground": "#EDF2FF",
        "dark-muted": "#A5AFC4",
        "dark-border": "#2D364A"
      }
    }
  },
  plugins: []
};

