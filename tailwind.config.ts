import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#0F6E56",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1A1A2E",
          foreground: "#E0E0E0",
        },
        warning: {
          DEFAULT: "#BA7517",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#A32D2D",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#1A1A2E",
          foreground: "#FFFFFF",
          border: "#2A2A3E",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
