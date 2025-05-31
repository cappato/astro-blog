/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // Habilitar modo oscuro basado en clase
  theme: {
    extend: {
      colors: {
        // Colores principales - funcionan en ambos temas
        primary: {
          DEFAULT: '#699CF9', // Azul principal
          50: '#EBF2FF',
          100: '#D6E4FF',
          200: '#B3CCFF',
          300: '#8FB5FF',
          400: '#699CF9',
          500: '#5A8AE0',
          600: '#4A73C7',
          700: '#3B5CAE',
          800: '#2C4595',
          900: '#1D2E7C'
        },
        secondary: {
          DEFAULT: '#6B8E23', // Verde militar (Olive Drab)
          50: '#F7F8F3',
          100: '#E8EDD7',
          200: '#D1DBAF',
          300: '#B4C687',
          400: '#8FA85F',
          500: '#6B8E23',
          600: '#5A7A1E',
          700: '#4A6619',
          800: '#3A5214',
          900: '#2A3E0F'
        },
        // Colores semánticos que se adaptan al tema
        background: {
          DEFAULT: '#f8fafc', // Light mode - Gris muy suave en lugar de blanco puro
          dark: '#0f172a'     // Dark mode
        },
        foreground: {
          DEFAULT: '#1e293b', // Light mode - Gris oscuro en lugar de negro puro
          dark: '#f8fafc'     // Dark mode
        },
        'primary-content': {
          DEFAULT: '#1e293b', // Light mode - Gris oscuro para texto principal
          dark: '#f8fafc'     // Dark mode - Gris claro para texto principal
        },
        muted: {
          DEFAULT: '#f1f5f9', // Light mode
          dark: '#1e293b'     // Dark mode
        },
        border: {
          DEFAULT: '#e2e8f0', // Light mode
          dark: '#334155'     // Dark mode
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.7)', // Light mode - Blanco semi-transparente
          dark: '#1e293b'     // Dark mode
        },
        // Grises mejorados para ambos temas
        surface: {
          50: '#f8fafc',   // Muy claro (light mode)
          100: '#f1f5f9',  // Claro
          200: '#e2e8f0',  // Claro medio
          300: '#cbd5e1',  // Medio claro
          400: '#94a3b8',  // Medio
          500: '#64748b',  // Medio oscuro
          600: '#475569',  // Oscuro medio
          700: '#334155',  // Oscuro
          800: '#1e293b',  // Muy oscuro
          900: '#0f172a'   // Extremo oscuro (dark mode)
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
