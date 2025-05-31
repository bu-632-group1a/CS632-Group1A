/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50))',
          100: 'rgb(var(--color-primary-100))',
          200: 'rgb(var(--color-primary-200))',
          300: 'rgb(var(--color-primary-300))',
          400: 'rgb(var(--color-primary-400))',
          500: 'rgb(var(--color-primary-500))',
          600: 'rgb(var(--color-primary-600))',
          700: 'rgb(var(--color-primary-700))',
          800: 'rgb(var(--color-primary-800))',
          900: 'rgb(var(--color-primary-900))',
          950: 'rgb(var(--color-primary-950))',
        },
        secondary: {
          50: 'rgb(var(--color-secondary-50))',
          100: 'rgb(var(--color-secondary-100))',
          200: 'rgb(var(--color-secondary-200))',
          300: 'rgb(var(--color-secondary-300))',
          400: 'rgb(var(--color-secondary-400))',
          500: 'rgb(var(--color-secondary-500))',
          600: 'rgb(var(--color-secondary-600))',
          700: 'rgb(var(--color-secondary-700))',
          800: 'rgb(var(--color-secondary-800))',
          900: 'rgb(var(--color-secondary-900))',
          950: 'rgb(var(--color-secondary-950))',
        },
        accent: {
          50: 'rgb(var(--color-accent-50))',
          100: 'rgb(var(--color-accent-100))',
          200: 'rgb(var(--color-accent-200))',
          300: 'rgb(var(--color-accent-300))',
          400: 'rgb(var(--color-accent-400))',
          500: 'rgb(var(--color-accent-500))',
          600: 'rgb(var(--color-accent-600))',
          700: 'rgb(var(--color-accent-700))',
          800: 'rgb(var(--color-accent-800))',
          900: 'rgb(var(--color-accent-900))',
          950: 'rgb(var(--color-accent-950))',
        },
        success: 'rgb(var(--color-success))',
        warning: 'rgb(var(--color-warning))',
        error: 'rgb(var(--color-error))',
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};