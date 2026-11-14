/**
 * Genera los derivados de imagen que el sitio sirve tal cual (el adaptador de
 * Cloudflare usa `imageService: 'passthrough'`, así que NO optimiza imágenes
 * en tiempo de ejecución). Ejecutar solo cuando cambien las fotos de origen:
 *
 *   node scripts/make-images.mjs
 *
 * Origen: scripts/img-src/*.jpg (fotos reales del sitio).
 * Salida (en public/, se versiona):
 *   og-home.jpg, og-nosotros.jpg      1200x630, para compartir en redes
 *   images/nosotros-{480,800,1200}.webp  cuadradas, para /nosotros
 *   favicon.ico                        48x48 (PNG dentro de ICO) desde favicon.svg
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'scripts/img-src';
const OUT = 'public';

await mkdir(`${OUT}/images`, { recursive: true });

// Open Graph: recorte 1200x630, JPEG progresivo liviano.
for (const [source, target] of [
  ['hero-facade.jpg', 'og-home.jpg'],
  ['nosotros-facade.jpg', 'og-nosotros.jpg'],
]) {
  const info = await sharp(`${SRC}/${source}`)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 72, progressive: true, mozjpeg: true })
    .toFile(`${OUT}/${target}`);
  console.log(target, info.width, info.height, `${(info.size / 1024).toFixed(0)} KB`);
}

// /nosotros: tres anchos cuadrados (la imagen se muestra en un cuadrado).
for (const width of [480, 800, 1200]) {
  const info = await sharp(`${SRC}/nosotros-facade.jpg`)
    .resize(width, width, { fit: 'cover', position: 'attention' })
    .webp({ quality: 72 })
    .toFile(`${OUT}/images/nosotros-${width}.webp`);
  console.log(`nosotros-${width}.webp`, `${(info.size / 1024).toFixed(0)} KB`);
}

// favicon.ico: un ICO puede contener un PNG tal cual (formato soportado por
// todos los navegadores actuales).
const png = await sharp(await readFile(`${OUT}/favicon.svg`), { density: 384 })
  .resize(48, 48)
  .png()
  .toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reservado
header.writeUInt16LE(1, 2); // tipo: icono
header.writeUInt16LE(1, 4); // una imagen
header.writeUInt8(48, 6); // ancho
header.writeUInt8(48, 7); // alto
header.writeUInt8(0, 8); // sin paleta
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); // planos
header.writeUInt16LE(32, 12); // bits por píxel
header.writeUInt32LE(png.length, 14); // tamaño de los datos
header.writeUInt32LE(22, 18); // desplazamiento de los datos
await writeFile(`${OUT}/favicon.ico`, Buffer.concat([header, png]));
console.log('favicon.ico', `${(png.length / 1024).toFixed(1)} KB`);
