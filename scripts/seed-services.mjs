/**
 * Carga los 6 servicios del respaldo en Sanity (dataset `production`).
 *
 * Uso (PowerShell, desde la raíz del proyecto):
 *   $env:SANITY_API_WRITE_TOKEN = "<token con permiso Editor>"
 *   node scripts/seed-services.mjs --dry-run     # muestra qué haría, sin escribir
 *   node scripts/seed-services.mjs               # carga los 6 servicios
 *   Remove-Item Env:SANITY_API_WRITE_TOKEN       # limpia el token de la sesión
 *
 * Reglas de seguridad del script:
 * - Si el dataset YA tiene servicios, se detiene (para no pisar lo que el cliente
 *   haya editado). Solo continúa con --force, que reemplaza los documentos con el
 *   mismo ID (`service-<slug>`) y NO borra los demás.
 * - El token solo se lee de la variable de entorno; nunca se imprime ni se guarda.
 * - Los IDs no llevan punto: los servicios son contenido público del sitio
 *   (los IDs con punto, como `lead.<uuid>`, son privados en Sanity).
 *
 * Importante: mientras el dataset no tenga NINGÚN servicio, el sitio usa el
 * respaldo del código. En cuanto hay uno, usa solo los de Sanity: por eso se
 * cargan los 6 en una misma transacción.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const force = args.has('--force');

const projectId = process.env.SANITY_PROJECT_ID || 'xbayv7k2';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

const docs = JSON.parse(readFileSync(new URL('./seed/services.json', import.meta.url), 'utf8'));

console.log(`Proyecto ${projectId} · dataset ${dataset} · ${docs.length} servicios a cargar`);
for (const d of docs) {
  console.log(`  ${String(d.order).padStart(2)}. ${d.title}${d.featured ? '  [destacado]' : ''}`);
}

if (dryRun) {
  console.log('\n--dry-run: no se escribió nada.');
  process.exit(0);
}

if (!token) {
  console.error('\nFalta la variable de entorno SANITY_API_WRITE_TOKEN.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

const existing = await client.fetch('*[_type == "service"]{_id, title}');
if (existing.length > 0 && !force) {
  console.error(`\nEl dataset ya tiene ${existing.length} servicio(s):`);
  for (const e of existing) console.error(`  - ${e.title} (${e._id})`);
  console.error(
    '\nNo se escribió nada. Si quieres reemplazar los que tengan el mismo ID, usa --force.',
  );
  process.exit(1);
}

let tx = client.transaction();
for (const d of docs) tx = tx.createOrReplace(d);
const result = await tx.commit();

console.log(`\nListo: ${result.results.length} documentos escritos.`);
console.log(
  'Verifica en el Studio (/admin) y recuerda que el sitio se actualiza cuando se reconstruye (Deploy Hook).',
);
