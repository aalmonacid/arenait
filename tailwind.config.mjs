/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#0075C9', // Azul Cerúleo
        secondary: '#294E6C', // Azul Noche / Pizarra
        accent: '#FEA621', // Naranja Ámbar
        interactive: '#0446F1', // Azul Eléctrico
        neutral: {
          50: '#F8FAFC',
          200: '#E2E8F0',
          900: '#0F172A',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['"Codec Pro Extra Bold"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        body: ['"Codec Pro"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
