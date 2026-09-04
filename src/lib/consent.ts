/**
 * Estado de consentimiento de cookies, persistido en localStorage propio (no
 * cookie de terceros). Hoy el sitio no carga analítica ni reCAPTCHA — este
 * módulo es el punto único que un script futuro de ese tipo debe consultar
 * antes de inyectarse, para que quede condicionado a la elección real del
 * visitante desde el día en que se agregue (ver BACKLOG.md, Épica H):
 *
 *   import { hasAcceptedTracking } from '../lib/consent';
 *   if (hasAcceptedTracking()) {
 *     // inyectar aquí el <script> de analítica/reCAPTCHA
 *   }
 */
export const CONSENT_STORAGE_KEY = 'arenait-cookie-consent';
export const CONSENT_VERSION = '1.0';

export type ConsentChoice = 'accepted' | 'rejected';

export interface ConsentRecord {
  choice: ConsentChoice;
  version: string;
  timestamp: string;
}

export function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.choice === 'accepted' || parsed?.choice === 'rejected') {
      return parsed as ConsentRecord;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): ConsentRecord {
  const record: ConsentRecord = {
    choice,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage inaccesible (modo privado estricto, cuotas): no persiste
    // entre visitas, pero no debe romper la UI del banner.
  }
  return record;
}

export function hasAcceptedTracking(): boolean {
  return readConsent()?.choice === 'accepted';
}
