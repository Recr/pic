import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        custom:
          'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary-gray': '#a39b23',
        'secondary-gray': '#f7f7f7',
      },
    },
  },
} satisfies Config
