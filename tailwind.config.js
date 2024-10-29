/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delay-1': 'float-delay-1 7s ease-in-out infinite',
        'float-delay-2': 'float-delay-2 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};