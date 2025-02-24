import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#222831",
        second: "#F1F0FF",
        third: "#faf8d7",
        danger: "#ff5959",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" }, // Changed to string
          "100%": { opacity: "1" }, // Changed to string
        },
        fadeOut: {
          "0%": { opacity: "1" }, // Changed to string
          "100%": { opacity: "0" }, // Changed to string
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "fade-out": "fadeOut 0.3s ease-in-out",
      },
      gridTemplateColumns: {
        20: "repeat(20, minmax(0, 1fr))",
      }
    },
  },
  plugins: [],
};

export default config;
