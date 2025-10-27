/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-orange': '#ff6b35',
        'dark-orange': '#f97316',
        'cyber-black': '#0a0a0a',
        'cyber-gray': '#1a1a1a',
      },
      boxShadow: {
        'neon': '0 0 10px #ff6b35, 0 0 20px #ff6b35, 0 0 30px #ff6b35',
        'neon-sm': '0 0 5px #ff6b35, 0 0 10px #ff6b35',
      },
    },
  },
  plugins: [],
}
