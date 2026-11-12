// Tokens de marca (AGENTS.md). Se exponen planos (`bg-primary`, usados en todo
// el sitio) y agrupados bajo `brand` (`bg-brand-primary`) apuntando al mismo valor.
const brand = {
  primary: '#0075C9', // Azul Cerúleo
  secondary: '#294E6C', // Azul Noche / Pizarra
  accent: '#FEA621', // Naranja Ámbar
  interactive: '#0446F1', // Azul Eléctrico
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ...brand,
        brand,
        neutral: {
          50: '#F8FAFC',
          200: '#E2E8F0',
          900: '#0F172A',
          white: '#FFFFFF',
        },
      },
      // Escala tipográfica editorial del home (rediseño 12/11/2026): titulares
      // fluidos con clamp, sin valores arbitrarios repartidos por los componentes.
      fontSize: {
        display: [
          'clamp(2.5rem, 7.4vw, 6rem)',
          { lineHeight: '1', letterSpacing: '-0.035em', fontWeight: '800' },
        ],
        headline: [
          'clamp(2rem, 4.4vw, 3.5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '800' },
        ],
        'headline-xl': [
          'clamp(2rem, 5vw, 4rem)',
          { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '800' },
        ],
        // Titular de páginas interiores (un escalón por debajo del display del home).
        page: [
          'clamp(2.25rem, 5.6vw, 4.5rem)',
          { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '800' },
        ],
        lead: ['clamp(1.125rem, 1.6vw, 1.3rem)', { lineHeight: '1.6' }],
      },
      letterSpacing: {
        label: '0.16em',
      },
      maxWidth: {
        display: '14ch',
        headline: '20ch',
      },
      // Animaciones de entrada, solo CSS (compatibles con la CSP estricta). Se usan
      // siempre con `motion-safe:` para respetar prefers-reduced-motion, y todas
      // terminan en el estado visible final.
      keyframes: {
        draw: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        pop: { from: { transform: 'scale(0.2)' }, to: { transform: 'scale(1)' } },
      },
      animation: {
        draw: 'draw 0.9s 0.2s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        pop: 'pop 0.5s both',
        'pop-2': 'pop 0.5s 0.08s both',
        'pop-3': 'pop 0.5s 0.16s both',
        'pop-4': 'pop 0.5s 0.24s both',
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
