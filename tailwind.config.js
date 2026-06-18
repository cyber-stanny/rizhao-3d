/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sea: {
          50: "#e6f4ff",
          100: "#bfe6ff",
          200: "#7fc9ff",
          300: "#3da8f0",
          400: "#1a86d8",
          500: "#0a6cb8",
          600: "#07508f",
          700: "#063f70",
          800: "#0a2f54",
          900: "#0a1f3d",
        },
        sand: {
          100: "#fff6e0",
          200: "#fde7b3",
          300: "#f5d690",
          400: "#ecc46c",
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        fadeUp: "fadeUp 0.5s ease-out",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
