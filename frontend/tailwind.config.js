/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canvas & surfaces
        canvas:   '#F4F5F7',
        surface:  '#FFFFFF',
        'surface-raised': '#F9FAFB',

        // Sidebar (dark)
        sidebar:         '#111827',
        'sidebar-hover':  '#1F2937',
        'sidebar-active': '#1D4ED8',
        'sidebar-text':   '#9CA3AF',
        'sidebar-text-active': '#FFFFFF',

        // Borders
        border:  '#E5E7EB',
        'border-strong': '#D1D5DB',

        // Text
        'text-primary':   '#111827',
        'text-secondary': '#6B7280',
        'text-muted':     '#9CA3AF',

        // Accent - single blue
        accent:       '#2563EB',
        'accent-hover': '#1D4ED8',
        'accent-light': '#EFF6FF',
        'accent-ring':  '#BFDBFE',

        // Semantic status colors
        'status-red':        '#DC2626',
        'status-red-bg':     '#FEF2F2',
        'status-red-border': '#FECACA',

        'status-green':        '#16A34A',
        'status-green-bg':     '#F0FDF4',
        'status-green-border': '#BBF7D0',

        'status-yellow':        '#D97706',
        'status-yellow-bg':     '#FFFBEB',
        'status-yellow-border': '#FDE68A',

        'status-blue':        '#2563EB',
        'status-blue-bg':     '#EFF6FF',
        'status-blue-border': '#BFDBFE',

        'status-purple':        '#7C3AED',
        'status-purple-bg':     '#F5F3FF',
        'status-purple-border': '#DDD6FE',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'sm':   '4px',
        'card': '8px',
        'lg':   '12px',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'raised': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'focus':  '0 0 0 3px rgba(37,99,235,0.15)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
