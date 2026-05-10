/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'nomad-slate': '#1E293B',
        'nomad-gray':  '#F8FAFC',
        'nomad-orange': '#FF5A00',
        'nomad-blue':  '#0066FF',
        'nomad-muted': '#64748B',
        'nomad-border': '#E2E8F0',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(100,116,139,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.07) 1px, transparent 1px)`,
      },
      boxShadow: {
        'hard': '4px 4px 0 0 #1E293B',
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07)',
        'premium': '0 20px 50px -12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
