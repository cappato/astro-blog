/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
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

        // Grises del sistema
        background: {
          primary: '#111827',
          secondary: '#1F2937',
          tertiary: '#374151'
        },

        // Colores de texto
        text: {
          primary: '#F9FAFB',
          secondary: '#D1D5DB',
          tertiary: '#9CA3AF',
          muted: '#6B7280'
        },

        // Colores de borde
        border: {
          primary: '#374151',
          secondary: '#4B5563',
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
