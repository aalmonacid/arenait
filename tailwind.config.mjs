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
        // Tipografía libre confirmada por el cliente (2026-09-04) en vez de
        // licenciar Codec Pro — ver AGENTS.md. El peso extra-bold de los
        // titulares se logra con la utilidad `font-extrabold` de Tailwind,
        // no con una familia tipográfica distinta.
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
