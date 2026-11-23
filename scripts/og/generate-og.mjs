// Genera las imágenes Open Graph 1200x630 de /servicios, /proyectos y /contacto.
// Uso: node scripts/og/generate-og.mjs   (usa `sharp` y `fontkitten`, ambos ya
// presentes en node_modules vía Astro; no se agregan dependencias).
//
// Diseño Swiss minimalista: fondo secundario #294E6C, texto blanco, acento
// #FEA621. Tipografía Plus Jakarta Sans de public/fonts: el texto se convierte
// a trazados SVG (no depende de fuentes instaladas en el equipo). fontkitten no
// aplica variaciones a woff2, así que se usa la instancia 400 y el peso del
// título se simula con un trazo del mismo color. Sin cifras ni claims no
// confirmados: los textos salen del copy existente de cada página.
import sharp from 'sharp';
import { create } from 'fontkitten';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const font = create(readFileSync(path.join(root, 'public/fonts/plus-jakarta-sans-latin.woff2')));
const UPM = font.unitsPerEm;
const W = 1200;
const H = 630;
const M = 80;
const TEXT_W = W - M * 2 - 120;

const PAGES = [
  {
    file: 'og-servicios.jpg',
    kicker: 'Servicios',
    title: 'Software e IA para operaciones que no pueden fallar',
    lead: 'Diseñamos, construimos y operamos soluciones a la medida y automatizamos procesos.',
  },
  {
    file: 'og-proyectos.jpg',
    kicker: 'Proyectos',
    title: 'Proyectos que hemos entregado',
    lead: 'Implementamos y optimizamos procesos en Bizagi, desarrollamos software a la medida y migramos datos.',
  },
  {
    file: 'og-contacto.jpg',
    kicker: 'Contacto',
    title: 'Hablemos de tu proyecto',
    lead: 'Te respondemos con una propuesta concreta.',
  },
];

const glyphOf = (ch) => font.glyphForCodePoint(ch.codePointAt(0));
const widthOf = (str, size, tracking = 0) =>
  [...str].reduce((acc, ch) => acc + (glyphOf(ch).advanceWidth * size) / UPM + tracking, 0);

function wrap(str, size, maxW, tracking = 0) {
  const lines = [];
  let line = '';
  for (const word of str.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && widthOf(next, size, tracking) > maxW) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Devuelve el SVG (<path>) de un bloque de texto y su altura. */
function block(str, { x, y, size, color, lineHeight, stroke = 0, tracking = 0, maxW = TEXT_W }) {
  const lines = wrap(str, size, maxW, tracking);
  const scale = size / UPM;
  let out = '';
  lines.forEach((line, i) => {
    let cx = x;
    const baseline = y + size * 0.95 + i * size * lineHeight;
    for (const ch of line) {
      const g = glyphOf(ch);
      const d = g.path.toSVG();
      if (d) {
        out += `<path transform="translate(${cx.toFixed(2)} ${baseline.toFixed(2)}) scale(${scale} ${-scale})" d="${d}" fill="${color}"${
          stroke ? ` stroke="${color}" stroke-width="${(stroke / scale).toFixed(1)}" stroke-linejoin="round"` : ''
        }/>`;
      }
      cx += g.advanceWidth * scale + tracking;
    }
  });
  return { svg: out, height: size * 0.95 + (lines.length - 1) * size * lineHeight + size * 0.3 };
}

async function render(page) {
  const kicker = block(page.kicker.toUpperCase(), {
    x: M, y: M + 24, size: 22, color: '#FEA621', lineHeight: 1.2, stroke: 0.7, tracking: 3,
  });
  const title = block(page.title, {
    x: M, y: M + 64, size: 58, color: '#FFFFFF', lineHeight: 1.12, stroke: 1.6, tracking: -0.8,
  });
  const lead = block(page.lead, {
    x: M, y: M + 64 + title.height + 24, size: 26, color: '#E2E8F0', lineHeight: 1.4,
  });
  const brand = block('Arena IT', {
    x: M, y: H - 112 + 30, size: 34, color: '#FFFFFF', lineHeight: 1.2, stroke: 1.1, tracking: -0.3,
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#294E6C"/>
    <rect x="${W - 24}" width="24" height="${H}" fill="#FEA621"/>
    <rect x="${M}" y="${M}" width="64" height="6" fill="#FEA621"/>
    <rect x="${M}" y="${H - 112}" width="${W - M * 2 - 24}" height="1" fill="#FFFFFF" fill-opacity="0.35"/>
    ${kicker.svg}${title.svg}${lead.svg}${brand.svg}
  </svg>`;

  const out = path.join(root, 'public', page.file);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  console.log(page.file, `${statSync(out).size} bytes`);
}

for (const page of PAGES) await render(page);
