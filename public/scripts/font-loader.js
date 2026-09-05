/**
 * Carga no bloqueante de Plus Jakarta Sans — tipografía oficial del sitio
 * desde la decisión del cliente (2026-09-04) de usar tipografía libre en vez
 * de licenciar Codec Pro (ver AGENTS.md, global.css). Archivo estático en
 * /public a propósito — ver el comentario en /scripts/consent.js sobre por
 * qué un <script> inline en un .astro compartido queda bloqueado por la CSP
 * en producción (`script-src 'self'`, sin `unsafe-inline`).
 */
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap';
document.head.appendChild(fontLink);
