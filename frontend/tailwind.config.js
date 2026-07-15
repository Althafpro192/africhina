/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#3525cd',
        'primary-hover': '#4f378a',
        background: '#f7f9fb',
        surface: '#ffffff',
        border: '#c7c4d8',
        'status-pending-bg': '#fef3c7',
        'status-pending-text': '#92400e',
        'status-processing-bg': '#dbeafe',
        'status-processing-text': '#1e40af',
        'status-quoted-bg': 'rgba(53, 37, 205, 0.1)',
        'status-quoted-text': '#3525cd',
        'status-completed-bg': '#d1fae5',
        'status-completed-text': '#065f46',
      },
      boxShadow: {
        'level-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'inner-input': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'deep': '0 20px 50px rgba(79, 70, 229, 0.15)',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      }
    },
  },
  plugins: [],
}