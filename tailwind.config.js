/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0e17',
          surface: '#111827',
          card: '#161f30',
          accent: '#00f0ff',
          success: '#10b981',
          warning: '#f59e0b',
          muted: '#6b7280',
        },
      },
      boxShadow: {
        'cyber-sm': '0 0 10px rgba(0, 240, 255, 0.15)',
        'cyber-md': '0 0 20px rgba(0, 240, 255, 0.25)',
        'cyber-lg': '0 0 35px rgba(0, 240, 255, 0.35)',
        'cyber-card': '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 240, 255, 0.1)',
        'cyber-active': '0 0 25px rgba(0, 240, 255, 0.4)',
      },
    },
  },
  plugins: [],
};
