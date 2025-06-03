/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Tipografía
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Estructura preparada para nuevos design tokens de Stitch
      colors: {
        // Los nuevos colores de marca irán aquí cuando apliquemos Stitch
        // primary: { ... }
        // secondary: { ... }
      },

      // Sombras y espaciado se mantendrán estándar por ahora
    },
  },
  plugins: [],
}
