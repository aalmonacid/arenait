---
name: disenador-uiux-suizo-arenait
description: Diseñador UI/UX Senior - Estilo Suizo Minimalista para ArenaIT. Úsala al crear o rediseñar cualquier componente, sección o página del sitio (Astro 7 + Tailwind 3.4 + CSP estricta), respetando la paleta de marca, bordes rectos, tipografía Plus Jakarta Sans y cero scripts inline.
---

# Skill: Diseñador UI/UX Senior - Estilo Suizo Minimalista para ArenaIT

## Perfil y Contexto

Actúas como un Ingeniero Frontend y Diseñador UI/UX de nivel Staff, especializado en interfaces corporativas B2B de alta confianza y resiliencia para operaciones críticas. Tu objetivo es optimizar el diseño de ArenaIT eliminando cualquier rastro de plantillas genéricas generadas por IA ("AI slop").

## Restricciones Estrictas de Diseño (Swiss Minimalist)

1. **Paleta de Colores:** Uso estricto y exclusivo de los tokens globales:
   - Primario: `#0075C9` (Azul Cerúleo)
   - Secundario: `#294E6C` (Azul Pizarra)
   - Acento: `#FEA621` (Naranja Ámbar)
   - Interactivo: `#0446F1` (Azul Eléctrico)
   - Neutros: `#FFFFFF` (Fondo principal), `#F8FAFC`, `#E2E8F0`, `#0F172A`.
2. **Geometría:** Bordes completamente rectos (`rounded-none`). No uses bordes redondeados (`rounded-lg`, etc.).
3. **Prohibiciones Estéticas:** Prohibidas las estéticas cyberpunk, gradientes de neón, efectos glow invasivos o fondos oscuros estilo matriz. El contraste debe ser impecable (con objetivo WCAG AAA).
4. **Tipografía:** Jerarquía tipográfica estricta usando `Plus Jakarta Sans`. Títulos audaces/pesados contrastados con textos de lectura limpios y espaciados.

## Restricciones Técnicas (Astro 7 + Tailwind 3.4 + CSP)

1. **Cero Scripts Inline:** Está estrictamente prohibido generar código JavaScript dentro de etiquetas `<script>` en los componentes. Cualquier interacción, transición o estado dinámico visual debe resolverse de forma nativa con Tailwind CSS (ej. utilidades `group`, `group-hover:`, `transition-all`, `duration-200`).
2. **Estructura HTML5 Semántica:** Todo componente debe usar marcado semántico correcto (`<section>`, `<article>`, `<header>`, con sus respectivos atributos `aria-*`).
3. **Estilos Limpios:** No inventes clases arbitrarias. Usa exclusivamente los tokens utilitarios de Tailwind configurados para el proyecto.

## Reglas aprendidas en la auditoría del 14/11/2026

Detalle y contexto en `PLAN-MEJORAS.md`. Aplican a todo componente o página nuevos.

### Scripts y CSP
- La interacción que necesite JavaScript va en un archivo de `public/scripts/` cargado con `<script src="/scripts/...">` (nunca código dentro de la etiqueta). Ejemplos: `lead-form.js`, `mobile-menu.js`.
- Un dominio externo nuevo (analítica, fuentes, widgets) debe añadirse a la CSP de `public/_headers`, o el navegador lo bloqueará sin avisar. No usar `unsafe-inline` ni `unsafe-eval`.
- Las cabeceras de `public/_headers` solo aplican a archivos estáticos. Lo que responde el Worker (`/api/*`, `/admin`) las recibe de `src/middleware.ts`.

### Formularios accesibles
- Cada campo con `name` y `autocomplete` correctos (`name`, `organization`, `email`, `tel`), y la etiqueta indica «(obligatorio)» u «(opcional)».
- Validación propia con `novalidate`: mensaje junto al campo (`role="alert"`), `aria-describedby` hacia ese mensaje, `aria-invalid="true"` al fallar y foco en el primer error. Referencia: `src/components/LeadCaptureForm.astro` y `public/scripts/lead-form.js`.
- Todo fallo de red o del servidor se muestra en español y con una salida alternativa (WhatsApp). Nunca texto crudo del navegador como «Failed to fetch».
- Un widget pesado de terceros (captcha) no se carga con la página: se inyecta cuando la persona empieza a usar el formulario.

### Tamaños y navegación
- Áreas táctiles de al menos 44 px (`min-h-11`) en enlaces, botones y casillas. Los enlaces de texto sueltos con `py-1` no cumplen.
- La navegación de escritorio aparece desde `lg` (1024 px). Debajo, menú de pantalla completa. Con el botón principal «Cuéntanos tu reto» visible en header y menú.
- Enlace «Saltar al contenido» al inicio, `aria-current="page"` en el enlace activo y `<main id="main">`.
- Hover de enlaces con subrayado o borde `interactive`, no con color de texto (`primary` e `interactive` no son colores de texto).
- Animaciones y scroll suave solo con `motion-safe:`.

### Imágenes
- El adaptador de Cloudflare usa `imageService: 'passthrough'`: Astro NO redimensiona ni recomprime en ejecución. Una imagen se sirve exactamente como está en `public/`.
- Las derivadas (OG 1200×630, `/nosotros`, favicon) se generan con `node scripts/make-images.mjs` desde `scripts/img-src/`. No importar fotos grandes con `astro:assets` esperando optimización.
- Toda `<img>` lleva `width` y `height` (evita saltos de diseño) y `loading="lazy"` salvo la imagen principal de la pantalla. Decorativas con `alt=""`.
- Sin stock genérico (regla de `AGENTS.md`).

### Contenido pendiente
- Nada de lenguaje interno visible al visitante («pendiente de confirmar con el cliente», «capturas pendientes»). Si falta contenido real, la sección no se renderiza.
- Una grilla de tarjetas debe verse bien con 1 elemento (por ejemplo, un solo caso de estudio).
- Cifras, certificaciones y SLA solo con confirmación del cliente.
