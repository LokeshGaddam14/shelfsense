/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#18181A',
        foreground: '#F5F5F5',
        primary: '#f59e0b',
        card: '#1F1F22',
        border: '#ffffff1a',
      }
    },
  },
  plugins: [],
}
