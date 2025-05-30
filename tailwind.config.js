/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // Habilitar dark mode con clase
  theme: {
    extend: {
      colors: {
        // Colores primarios con paleta completa
        primary: {
          50: '#EBF2FF',
          100: '#D6E4FF',
          200: '#B3CCFF',
          300: '#8FB5FF',
          400: '#699CF9', // Color principal
          500: '#5A8AE0', // Hover
          600: '#4A73C7',
          700: '#3B5CAE',
          800: '#2C4595',
          900: '#1D2E7C',
          DEFAULT: '#699CF9'
        },

        // Colores secundarios con paleta completa
        secondary: {
          50: '#F0FFF4',
          100: '#C6F6D5',
          200: '#9AE6B4',
          300: '#68D391',
          400: '#A2F678', // Color principal
          500: '#8FDB6A', // Hover
          600: '#7BC258',
          700: '#68A946',
          800: '#559034',
          900: '#427722',
          DEFAULT: '#A2F678'
        },

        // Grises del sistema (modo oscuro por defecto, claro con dark:)
        background: {
          primary: '#FFFFFF', // Claro por defecto
          secondary: '#F9FAFB', // Claro por defecto
          tertiary: '#F3F4F6' // Claro por defecto
        },

        // Colores de texto (modo claro por defecto, oscuro con dark:)
        text: {
          primary: '#111827', // Claro por defecto
          secondary: '#374151', // Claro por defecto
          tertiary: '#6B7280', // Claro por defecto
          muted: '#9CA3AF' // Claro por defecto
        },

        // Colores de borde (modo claro por defecto, oscuro con dark:)
        border: {
          primary: '#E5E7EB', // Claro por defecto
          secondary: '#D1D5DB', // Claro por defecto
          accent: '#699CF9'
        },

        // Colores semánticos
        success: {
          light: '#A2F678',
          dark: '#8FDB6A',
          bg: '#F0FFF4',
          text: '#559034',
          DEFAULT: '#A2F678'
        },

        warning: {
          light: '#FCD34D',
          dark: '#F59E0B',
          bg: '#FFFBEB',
          text: '#92400E',
          DEFAULT: '#FCD34D'
        },

        error: {
          light: '#F87171',
          dark: '#DC2626',
          bg: '#FEF2F2',
          text: '#991B1B',
          DEFAULT: '#F87171'
        },

        // Mantener compatibilidad con nombres anteriores
        dark: '#111827',
        light: '#F9FAFB'
      }
    },
  },
  plugins: [],
}
