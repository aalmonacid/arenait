/**
 * Carga no bloqueante de Plus Jakarta Sans (fallback real mientras Codec Pro
 * no tenga licencia, ver global.css). Archivo estático en /public a
 * propósito — ver el comentario en /scripts/consent.js sobre por qué un
 * <script> inline en un .astro compartido queda bloqueado por la CSP en
 * producción (`script-src 'self'`, sin `unsafe-inline`).
 */
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap';
document.head.appendChild(fontLink);
