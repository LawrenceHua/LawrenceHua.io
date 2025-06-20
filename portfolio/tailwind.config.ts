import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/globals.css",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0070f3",
        secondary: "#1a1a1a",
      },
    },
  },
  plugins: [],
  safelist: ["rounded-md", "border-gray-300", "shadow-sm"],
};

export default config;
