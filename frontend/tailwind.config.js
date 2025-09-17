/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9ebff",
          200: "#b9d7ff",
          300: "#8fbaff",
          400: "#5d93ff",
          500: "#3a76ff",
          600: "#235ef0",
          700: "#1d4dcc",
          800: "#1c419f",
          900: "#1b3a81",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      }
    },
  },
  plugins: [],
};
