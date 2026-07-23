/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Plus Jakarta Sans", "ui-sans-serif"],
      },
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      boxShadow: {
        auth:  "0 25px 60px rgba(30, 64, 175, 0.20), 0 8px 20px rgba(0,0,0,0.08)",
        card:  "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.10)",
        sidebar: "4px 0 20px rgba(0,0,0,0.15)",
      },
      backgroundImage: {
        "auth-radial": "radial-gradient(ellipse at top left, rgba(59,130,246,0.25), transparent 50%), radial-gradient(ellipse at bottom right, rgba(30,64,175,0.15), transparent 50%)",
        "blue-mesh": "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%)",
      },
      borderRadius: {
        "2.5xl": "20px",
        "3.5xl": "28px",
      },
    },
  },
  plugins: [],
};
