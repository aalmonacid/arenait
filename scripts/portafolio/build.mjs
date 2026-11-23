// Genera public/portafolio-arena-it.pdf desde scripts/portafolio/portafolio.html
// con Edge o Chrome sin interfaz. Uso: npm run portafolio:generate
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, 'portafolio.html');
const output = resolve(here, '../../public/portafolio-arena-it.pdf');

const candidates = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error('No se encontró Edge ni Chrome. Defina BROWSER_PATH con la ruta del ejecutable.');
  process.exit(1);
}

const result = spawnSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=5000',
    `--print-to-pdf=${output}`,
    pathToFileURL(source).href,
  ],
  { stdio: 'inherit' },
);
if (result.status !== 0 || !existsSync(output)) {
  console.error('No se pudo generar el PDF.');
  process.exit(1);
}
console.log(`PDF generado: ${output} (${Math.round(statSync(output).size / 1024)} KB)`);
