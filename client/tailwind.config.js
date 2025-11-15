/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0ea5e9",
          light: "#38bdf8",
          dark: "#0284c7",
        },
        accent: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        success: {
          DEFAULT: "#22c55e",
          dark: "#16a34a",
        },
        danger: {
          DEFAULT: "#ef4444",
          dark: "#dc2626",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#1f2937",
        },
        overlay: "rgba(0,0,0,0.65)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 4px 14px rgba(0,0,0,0.08)",
        modal: "0 6px 20px rgba(0,0,0,0.15)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
};
