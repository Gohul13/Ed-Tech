/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors will use CSS variables
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-color': 'var(--border-color)',
        'header-bg': 'var(--header-bg)',
        'footer-bg': 'var(--footer-bg)',
        'primary': 'var(--primary-color)',
        'primary-hover': 'var(--primary-hover)',
        'secondary': 'var(--secondary-color)',
        'secondary-hover': 'var(--secondary-hover)',
        'success': 'var(--success-color)',
        'danger': 'var(--danger-color)',
        'danger-hover': 'var(--danger-hover)',
        'card-bg': 'var(--card-bg)',
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}




