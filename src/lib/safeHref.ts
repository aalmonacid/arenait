/**
 * Enlaces permitidos dentro de los textos que se editan en Sanity: dirección
 * http(s), `mailto:`, ruta interna (empieza por `/`, no por `//`) o ancla
 * (`#`). Cualquier otro esquema (`javascript:`, `data:`, `vbscript:`...) y las
 * rutas relativas ambiguas se descartan. Lo usan el conversor de Portable Text
 * y la validación del Studio, para que ambos apliquen la misma regla.
 */
export function isSafeHref(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  const value = href.trim();
  if (value === '' || /\s/.test(value)) return false;
  // Caracteres de control (se usan para esconder esquemas, p. ej. «java\tscript:»).
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return false;
  }
  if (/^https?:\/\/[^/\\]+/i.test(value)) return true;
  if (/^mailto:\S+$/i.test(value)) return true;
  if (value.startsWith('#') && value.length > 1) return true;
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
}

/** Enlace a otro sitio (se abre con `rel="noopener noreferrer"`). */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}
