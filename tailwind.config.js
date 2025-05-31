/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // Habilitar modo oscuro basado en clase
  theme: {
    extend: {
      colors: {
        // Colores principales usando el sistema centralizado
        primary: {
          DEFAULT: '#699CF9', // Azul principal RGB(105, 156, 249)
          50: '#EBF2FF',
          100: '#D6E4FF',
          200: '#B3CCFF',
          300: '#8FB5FF',
          400: '#699CF9',
          500: '#5A8AE0', // Hover
          600: '#4A73C7',
          700: '#3B5CAE',
          800: '#2C4595',
          900: '#1D2E7C'
        },
        secondary: {
          DEFAULT: '#A2F678', // Verde secundario RGB(162, 246, 120)
          50: '#F0FFF4',
          100: '#C6F6D5',
          200: '#9AE6B4',
          300: '#68D391',
          400: '#A2F678',
          500: '#8FDB6A', // Hover
          600: '#7BC258',
          700: '#68A946',
          800: '#559034',
          900: '#427722'
        },
        // Grises personalizados para mejor consistencia
        surface: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827' // Fondo principal oscuro
        }
      },
      // Espaciado consistente
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Tipografía mejorada
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      // Sombras consistentes
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
