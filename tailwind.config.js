/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          950: '#0F1A2E',
          900: '#1B2A4A',
          800: '#243660',
          700: '#2E4478',
          600: '#3D5A99',
          500: '#4A6BA5',
          400: '#6B8CC2',
          300: '#8FA8D6',
          200: '#B5C7E6',
          100: '#D8E2F1',
          50: '#EEF2F8',
        },
        gold: {
          600: '#B8912E',
          500: '#D4A843',
          400: '#E0BE6A',
          300: '#ECD08E',
          200: '#F4E0B0',
          100: '#FAF0D8',
          50: '#FDF8EC',
        },
        surface: '#F8F7F4',
        'surface-alt': '#F0EFE9',
        border: '#E2E0D8',
        'border-light': '#EDECE6',
      },
      fontFamily: {
        sans: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
};
