/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",  // Ensure it scans the app directory
    "./components/**/*.{js,ts,jsx,tsx}",  // Scan components folder
    "./styles/**/*.{js,ts,jsx,tsx}",  // If you have extra styles
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
