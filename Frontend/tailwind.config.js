/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo instead of sharp blue
        secondary: '#64748b',
        danger: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        sidebar: '#1e1e1e', // Dark for sidebar
        'bg-main': '#f3f4f6', // Light background
        'card-bg': '#ffffff',
        'accent-purple': '#a78bfa',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem', 
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.3)', 
      }
    },
  },
  plugins: [],
}
