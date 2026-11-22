/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#091413',
          900: '#0E1F1B',
          850: '#142B25',
          800: '#1A382F',
          700: '#234C40',
        },
        pine: {
          900: '#1B3B30',
          800: '#285A48',
          700: '#34725C',
          600: '#408A71',
        },
        jade: {
          700: '#285A48',
          600: '#33715C',
          500: '#408A71',
          400: '#55A388',
          300: '#75C1A6',
        },
        mint: {
          500: '#7BE0B8',
          400: '#98E0C2',
          300: '#B0E4CC',
          200: '#C9EFE0',
          100: '#E4F8F0',
          50: '#F0FAF5',
        },
        dark: {
          950: '#091413',
          900: '#0E1F1B',
          850: '#142B25',
          800: '#1A382F',
          750: '#21473C',
          700: '#285A48',
          600: '#408A71',
        },
        nexora: {
          300: '#C9EFE0',
          400: '#B0E4CC',
          500: '#7BE0B8',
          600: '#408A71',
          700: '#285A48',
          800: '#1A382F',
          900: '#0E1F1B',
          950: '#091413',
          glow: 'rgba(176, 228, 204, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(176, 228, 204, 0.25)',
        'glow-lg': '0 0 30px -5px rgba(176, 228, 204, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
