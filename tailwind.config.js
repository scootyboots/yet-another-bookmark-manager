/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(26, 9, 19)',
        'background-weak': 'rgba(24, 6, 17, 0.85)',
        foreground: 'white',
        primary: {
          DEFAULT: 'rgb(230, 60, 159)',
          weak: 'rgb(137, 37, 95)',
          'weak-transparent': 'rgba(230, 60, 159, 0.55)',
        },
        'background-accent': 'rgb(106, 29, 74)',
        error: {
          DEFAULT: 'rgb(236, 204, 62)',
          weak: 'rgb(150, 131, 47)',
        },
      },
      boxShadow: {
        primary: '0px 0px 25px 0px rgba(230, 60, 159, 0.25)',
        'primary-inset': 'inset 0px 0px 15px 0px rgba(230, 60, 159, 0.35)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
