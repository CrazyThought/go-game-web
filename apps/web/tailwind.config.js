/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}',
    '../../packages/ui/src/**/*.{vue,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        board: {
          bg: '#DEB887',
          line: '#5D4037',
        },
        stone: {
          black: '#1a1a1a',
          'black-light': '#555555',
          white: '#f0f0f0',
          'white-dark': '#cccccc',
        },
        accent: {
          red: '#E53935',
          green: '#43A047',
        },
      },
    },
  },
  plugins: [],
};