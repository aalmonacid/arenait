/**
 * La versión vigente de la Política de Tratamiento de Datos Personales ya no
 * se fija aquí: sale de los documentos `privacyPolicy` de Sanity (o del
 * respaldo `src/lib/content/privacyPolicy.ts`) mediante `getCurrentPolicy()`
 * en `src/lib/content.ts`. El contacto capturado queda con la versión que
 * aceptó (`data-policy-version` del formulario), como evidencia de
 * consentimiento.
 */
export const POLICY_URL = '/politica-de-tratamiento-de-datos';

/** Número de la versión del respaldo (la que existía antes de pasar a Sanity). */
export const FALLBACK_POLICY_VERSION = '1.1';
