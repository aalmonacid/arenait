# Contexto del Proyecto: ArenaIT

**Propósito:** Desarrollo de software a la medida para operaciones reales.

> Este archivo cubre reglas de diseño y arquitectura de alto nivel. Para el estado real auditado (bugs conocidos, brechas entre lo declarado y lo implementado) ver [`CONTEXT.md`](./CONTEXT.md). Para el plan de trabajo priorizado ver [`BACKLOG.md`](./BACKLOG.md).
>
> **Posicionamiento (2026-08-24):** el sitio pivotó de un posicionamiento "Ingeniería de misión crítica para CTO/CIO" (con certificaciones ISO 27001/TOGAF/ISO 25010, SLA 99.999% y ahorros de TCO 35-40%) a uno real, de "punto medio", acordado con el cliente — ver `copy-arenait-textos-reales.md`. Esas certificaciones/cifras nunca fueron reales y fueron eliminadas de todo el sitio (hero, cards de servicio, footer, calculadora FinOps — esta última se eliminó por completo). No reintroducir ese lenguaje ni esas cifras salvo que el cliente las confirme como reales.

## Restricciones y Reglas de Diseño (Swiss Minimalist)

- **Prohibido**: Estéticas cyberpunk, gradientes de neón, o fondos oscuros estilo matriz.
- **Mantener**: Diseño limpio, corporativo, alto contraste (WCAG AAA).
- **Palette**:
  - Primario: #0075C9 (Azul Cerúleo)
  - Secundario: #294E6C (Azul Noche / Pizarra)
  - Acento: #FEA621 (Naranja Ámbar)
  - Interactivo: #0446F1 (Azul Eléctrico)
  - Neutros: #FFFFFF, #F8FAFC, #E2E8F0, #0F172A
- **Tipografía**: Plus Jakarta Sans (titulares y cuerpo/UI, pesos 400-800 vía utilidades de Tailwind como `font-extrabold`). Fallback: Inter, sans-serif. **Decisión confirmada por el cliente (2026-09-04)**: usar tipografía libre en vez de licenciar Codec Pro — no reintroducir referencias a Codec Pro como tipografía objetivo (ver `CONTEXT.md` §5/§6).

## Iconografía e imágenes

- **Íconos**: el set en `src/components/Icon.astro` es una recreación fiel del set ilustrado de `Tablero de Marca ArenaIT.pdf` (página "ICONOS") — no un set genérico de terceros. Si se agrega un ícono nuevo, buscar primero si existe un concepto equivalente en ese PDF antes de usar un ícono libre sin relación con la marca.
- **Imágenes**: prohibido el stock genérico cliché (personas sonriendo mirando a cámara, manos en teclado sin contexto, código verde estilo "Matrix/hacker"). Preferir, en este orden: capturas reales de producto > fotografía editorial curada (Unsplash/Pexels, licencia libre) con composición conceptual/abstracta > no poner imagen. Ver Épica G de `BACKLOG.md` para los criterios de curaduría usados en el hero y `/nosotros`.

## Reglas de Arquitectura

- **Stack**: Astro 7 + Sanity.io + Tailwind CSS + TypeScript.
- **Sanity**: Project ID `xbayv7k2`, Dataset `production`.
- **Enfoque real**: desarrollo de software a la medida, con acompañamiento desde el diseño hasta el mantenimiento en producción. Sin certificaciones (ISO 27001/TOGAF/ISO 25010), SLAs ni ahorros de TCO publicados — no existen o no están verificados. Todo dato de este tipo debe venir confirmado por el cliente antes de publicarse; mientras tanto, se marca `[PENDIENTE]` (renderizado vía el componente `PendingContentTag`, nunca como texto crudo entre corchetes).
