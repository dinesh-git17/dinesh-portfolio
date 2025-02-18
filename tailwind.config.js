/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",  // Scan Next.js pages & layouts
    "./components/**/*.{js,ts,jsx,tsx,mdx}",  // Scan components
    "./styles/**/*.{js,ts,jsx,tsx,mdx}"  // Scan additional styles
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
