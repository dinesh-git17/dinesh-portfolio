import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",  // Scans all Next.js pages & layouts
    "./components/**/*.{js,ts,jsx,tsx,mdx}",  // Scans components
    "./styles/**/*.{js,ts,jsx,tsx,mdx}",  // If you have extra styles
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;
