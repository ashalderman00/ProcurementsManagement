/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { lg: "1024px", xl: "1200px", "2xl": "1280px" } },
    extend: {
      colors: {
        brand: {
          50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",
          400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",
          800:"#1e40af",900:"#1e3a8a"
        },
        mint:  { 50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981" },
        iris:  { 50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1" },
        slate: { 950:"#0b1220" }
      },
      boxShadow: {
        card: "0 4px 16px rgba(2,6,23,.08)",
        glow: "0 10px 40px rgba(59,130,246,.35)"
      },
      borderRadius: { xl:"1rem", "2xl":"1.25rem" }
    },
  },
  plugins: [],
};
