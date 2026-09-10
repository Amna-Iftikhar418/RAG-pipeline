/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#F2EFE7',
          100: '#E8E5DB',
          200: '#C8DFDB',
          300: '#A0C4D4',
          400: '#66A3BF',
          500: '#3368A0',
          600: '#2B5888',
          700: '#234870',
          800: '#1C3A59',
          900: '#142B42',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'ocean-sm': '0 1px 3px rgba(51, 104, 160, 0.08)',
        'ocean-md': '0 4px 12px rgba(51, 104, 160, 0.12)',
        'ocean-lg': '0 8px 24px rgba(51, 104, 160, 0.16)',
        'ocean-xl': '0 12px 36px rgba(51, 104, 160, 0.2)',
      },
    },
  },
  plugins: [],
}
