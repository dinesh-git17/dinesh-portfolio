/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {fontFamily: {
        sans: ["Inter", "sans-serif"], // Set Inter as the default font
      },},
  },
  plugins: [],
};

