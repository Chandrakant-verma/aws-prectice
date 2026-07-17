/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F14",
          900: "#101720",
          800: "#161F2B",
          700: "#1F2B3A",
          600: "#2C3B4F",
        },
        signal: {
          400: "#7FF0C1",
          500: "#4CE0A8",
          600: "#2FC98D",
        },
        amber: {
          400: "#F5B95C",
          500: "#EDA23A",
        },
      },
      fontFamily: {
        display: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        body: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(127, 240, 193, 0.15), 0 8px 30px -12px rgba(76, 224, 168, 0.35)",
      },
    },
  },
  plugins: [],
};
