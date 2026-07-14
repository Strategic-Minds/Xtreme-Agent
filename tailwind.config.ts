import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F3460',
        secondary: '#E94560',
        accent: '#00B4D8',
        dark: '#1A1A2E',
      },
      fontFamily: {
        sans: ['Calibri', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
