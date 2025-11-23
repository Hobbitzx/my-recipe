/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morandi: {
          bg: '#F2F0EB',       // Warm Light Grey
          surface: '#FFFFFF',   // White
          primary: '#8F9E9D',   // Muted Teal/Sage
          secondary: '#D3C4BE', // Dusty Pink/Beige
          accent: '#A49E97',    // Warm Grey
          text: '#4A4A4A',      // Soft Charcoal
          subtext: '#8C8C8C',   // Muted Grey Text
          border: '#E0DCD6'     // Soft Border
        }
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}