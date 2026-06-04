/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#337AB7",
          light: "#5A97C8",
          dark: "#265A88",
        },
        secondary: {
          DEFAULT: "#A0C4FF",
          light: "#C1D9FF",
          dark: "#7FA6FF",
        },
        accent: {
          DEFAULT: "#FF7F50",
          light: "#FF9E7A",
          dark: "#E06030",
        },
        neutral: {
          DEFAULT: "#F4F7F9",
          dark: "#E2E8F0",
        },
        text: {
          DEFAULT: "#333333",
          light: "#4A5568",
        },
        // Post-UTME Hub Brand Colors
        hub: {
          navy: "#1D3557",
          "navy-light": "#264a77",
          "navy-dark": "#142440",
          gold: "#F4D35E",
          "gold-light": "#F7DF7E",
          "gold-dark": "#DDB832",
          aqua: "#457B9D",
          "aqua-light": "#5A93B5",
          "aqua-dark": "#326180",
          white: "#F9F9F9",
          "dark-bg": "#0D1B2A",
          "dark-surface": "#1A2942",
          "dark-border": "#243554",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
