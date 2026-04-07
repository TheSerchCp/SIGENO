/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./{components,js}/**/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280'
      }
    }
  },
  plugins: []
}
