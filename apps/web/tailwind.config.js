/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7ee',
          100: '#f5edd7',
          200: '#ecdaae',
          300: '#e1c27e',
          400: '#d7ab54',
          500: '#c59138',
          600: '#ad762d',
          700: '#8a5826',
          800: '#714624',
          900: '#5e3a22',
          gold: '#e5a93c',
          amber: '#f59e0b',
          crimson: '#e11d48',
          dark: '#0b0f19',
          card: '#121826',
          border: '#1f293d'
        }
      }
    },
  },
  plugins: [],
};
