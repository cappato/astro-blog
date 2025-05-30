/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#699CF9', // Nuevo azul RGB(105, 156, 249)
        secondary: '#A2F678', // Nuevo verde RGB(162, 246, 120)
        dark: '#111827',
        light: '#F9FAFB'
      }
    },
  },
  plugins: [],
}
