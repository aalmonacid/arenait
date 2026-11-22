/**
 * Lógica de envío de LeadCaptureForm.astro. Archivo estático en /public a
 * propósito — ver el comentario en /scripts/consent.js: un <script> inline
 * en un .astro compartido queda bloqueado por la CSP en producción
 * (`script-src 'self'`, sin `unsafe-inline`), y este formulario es el único
 * flujo de captura de leads real del sitio.
 *
 * Validación: el formulario trae `novalidate`; aquí se validan los campos con
 * mensajes propios, asociados a cada campo (aria-invalid + aria-describedby +
 * role="alert") y con el foco en el primer error. El servidor valida de nuevo.
 *
 * Captcha: Cloudflare Turnstile pesa ~1,8 MB, así que su script NO se carga con
 * la página: se inyecta la primera vez que la persona toca el formulario (o al
 * intentar enviarlo). Su token llega en el campo oculto `cf-turnstile-response`
 * y se envía al servidor, que lo verifica.
 */
const form = document.getElementById('leadCaptureForm');
const formTitle = document.getElementById('formTitle');
const emailInput = document.getElementById('corporateEmail');
const companyInput = document.getElementById('company');
const phoneInput = document.getElementById('phone');
const serviceOfInterestInput = document.getElementById('serviceOfInterest');
const interestModelInput = document.getElementById('interestModel');
const messageInput = document.getElementById('message');
const fullNameInput = document.getElementById('fullName');
const honeypotInput = document.getElementById('companyWebsite');
const policyAcceptedInput = document.getElementById('policyAccepted');
const sendCopyInput = document.getElementById('sendCopy');
const submitButton = form?.querySelector('button[type="submit"]');
const formError = document.getElementById('formError');
const formErrorText = document.getElementById('formErrorText');
const formErrorWhatsapp = document.getElementById('formErrorWhatsapp');

const successPanel = document.getElementById('formSuccess');
const successTitle = document.getElementById('successTitle');
const successText = document.getElementById('successText');
const successCopy = document.getElementById('successCopy');
const sendAnotherButton = document.getElementById('sendAnother');

const SUBMIT_LABEL = 'Enviar mensaje';
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
// Mismo criterio que el servidor (src/lib/leadValidation.ts).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_ERROR = 'No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.';

if (serviceOfInterestInput) {
  const preselected = new URLSearchParams(window.location.search).get('servicio');
  if (preselected) {
    // `?servicio=` trae el slug del servicio (ancla de /servicios). Un valor
    // que no está en la lista deja el campo en «Otro».
    const options = Array.from(serviceOfInterestInput.options);
    const match = options.find((option) => option.value === preselected);
    const fallback = options.find((option) => option.value === 'otro');
    if (match) {
      serviceOfInterestInput.value = match.value;
    } else if (fallback) {
      serviceOfInterestInput.value = fallback.value;
    }
  }
}

/* ---------- Captcha (Turnstile) ---------- */

const captchaWidget = form?.querySelector('.cf-turnstile') ?? null;
const captchaError = document.getElementById('captchaError');
let turnstileRequested = false;
let turnstileFailed = false;

if (captchaWidget instanceof HTMLElement) {
  // Se fija ANTES de que Turnstile renderice: flexible ocupa el ancho de la
  // tarjeta; bajo 360 px (mínimo ≈300 px de flexible) se usa la versión compacta.
  // (innerWidth 0 = pestaña aún sin dimensiones: se trata como pantalla normal).
  captchaWidget.dataset.size =
    window.innerWidth > 0 && window.innerWidth < 360 ? 'compact' : 'flexible';
}

function loadTurnstile() {
  if (!captchaWidget || turnstileRequested) return;
  turnstileRequested = true;
  const script = document.createElement('script');
  script.src = TURNSTILE_SRC;
  script.async = true;
  script.defer = true;
  script.addEventListener('error', () => {
    // Bloqueador de anuncios o red restringida: sin widget no hay forma de
    // enviar, así que se avisa con el canal alternativo.
    turnstileFailed = true;
    showFormError(
      'No se pudo cargar la verificación de seguridad (puede que un bloqueador la esté impidiendo).',
      true,
    );
  });
  document.head.appendChild(script);
}

function captchaToken() {
  const field = form?.querySelector('[name="cf-turnstile-response"]');
  return field instanceof HTMLInputElement ? field.value : '';
}

function hasCaptchaWidget() {
  return Boolean(captchaWidget);
}

function resetCaptcha() {
  // `turnstile` lo define el script externo de Cloudflare, si está cargado.
  if (hasCaptchaWidget() && typeof window.turnstile?.reset === 'function') {
    window.turnstile.reset();
  }
}

if (captchaWidget) {
  // Primer contacto con el formulario: foco, puntero o toque.
  form?.addEventListener('focusin', loadTurnstile, { once: true });
  form?.addEventListener('pointerdown', loadTurnstile, { once: true });
}

/* ---------- Errores ---------- */

function showFormError(message, withWhatsapp = true) {
  if (!formError || !formErrorText) return;
  formErrorText.textContent = message;
  formErrorWhatsapp?.classList.toggle('hidden', !withWhatsapp);
  formErrorWhatsapp?.parentElement?.classList.toggle('hidden', !withWhatsapp);
  formError.classList.remove('hidden');
}

function clearFormError() {
  formError?.classList.add('hidden');
}

// Campo -> id del mensaje de error que le corresponde en el HTML.
const ERROR_IDS = {
  fullName: 'fullNameError',
  corporateEmail: 'emailError',
  message: 'messageError',
  policyAccepted: 'policyError',
};

function setFieldError(input, show) {
  if (!input) return;
  const errorEl = document.getElementById(ERROR_IDS[input.id]);
  errorEl?.classList.toggle('hidden', !show);
  if (show) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

/** Valida los campos y devuelve el primero con error (o null). */
function validateFields() {
  const checks = [
    [fullNameInput, Boolean(fullNameInput?.value.trim())],
    [emailInput, EMAIL_RE.test(emailInput?.value.trim() ?? '')],
    [messageInput, Boolean(messageInput?.value.trim())],
    [policyAcceptedInput, Boolean(policyAcceptedInput?.checked)],
  ];
  let firstInvalid = null;
  for (const [input, ok] of checks) {
    setFieldError(input, !ok);
    if (!ok && !firstInvalid) firstInvalid = input;
  }
  return firstInvalid;
}

/* ---------- Pantallas ---------- */

/** Muestra la pantalla de éxito en lugar del formulario y le pasa el foco. */
function showSuccess({ name, email, copy }) {
  const firstName = (name || '').trim().split(/\s+/)[0];
  if (successTitle) {
    successTitle.textContent = firstName
      ? `¡Gracias, ${firstName}! Recibimos tu mensaje`
      : '¡Gracias! Recibimos tu mensaje';
  }
  if (successText) {
    successText.textContent = email
      ? `Te escribiremos a ${email} con una propuesta concreta.`
      : 'Te escribiremos con una propuesta concreta.';
  }
  if (successCopy) {
    if (copy === 'sent') {
      successCopy.textContent = `También enviamos una confirmación de recibido a ${email}.`;
      successCopy.classList.remove('hidden');
    } else if (copy === 'failed') {
      successCopy.textContent =
        'No pudimos enviarte la confirmación por correo, pero tu mensaje sí nos llegó.';
      successCopy.classList.remove('hidden');
    } else {
      successCopy.classList.add('hidden');
    }
  }

  form?.classList.add('hidden');
  formTitle?.classList.add('hidden');
  successPanel?.classList.remove('hidden');
  successPanel?.focus();
  successPanel?.scrollIntoView({ block: 'center' });
}

function showForm() {
  successPanel?.classList.add('hidden');
  form?.classList.remove('hidden');
  formTitle?.classList.remove('hidden');
  fullNameInput?.focus();
}

/* ---------- Envío ---------- */

/** Mensaje para el visitante según lo que respondió (o no) el servidor. */
function messageForFailure(response, data) {
  if (response?.status === 429) {
    return 'Hiciste varios envíos seguidos. Espera unos minutos antes de intentarlo de nuevo.';
  }
  if (data && typeof data.error === 'string' && data.error) return data.error;
  return GENERIC_ERROR;
}

if (form && emailInput && submitButton && successPanel && formError) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormError();
    captchaError?.classList.add('hidden');

    const firstInvalid = validateFields();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (honeypotInput?.value) {
      // Probablemente un bot: simular éxito sin llamar a la API para no darle señal de qué falló.
      showSuccess({ name: '', email: '', copy: 'not_requested' });
      form.reset();
      return;
    }

    if (hasCaptchaWidget() && !captchaToken()) {
      loadTurnstile();
      if (turnstileFailed) {
        showFormError(
          'No se pudo cargar la verificación de seguridad (puede que un bloqueador la esté impidiendo).',
          true,
        );
      } else {
        captchaError?.classList.remove('hidden');
        captchaWidget?.scrollIntoView({ block: 'center' });
      }
      return;
    }

    const name = fullNameInput?.value ?? '';
    const email = emailInput.value.trim();
    const wantsCopy = Boolean(sendCopyInput?.checked);

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    let response = null;
    let data = null;
    try {
      response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          company: companyInput?.value ?? '',
          corporateEmail: email,
          phone: phoneInput?.value ?? '',
          serviceOfInterest: serviceOfInterestInput?.value ?? '',
          interestModel: interestModelInput?.value ?? '',
          message: messageInput?.value ?? '',
          source: 'lead-capture-form',
          companyWebsite: honeypotInput?.value ?? '',
          policyAccepted: policyAcceptedInput?.checked ?? false,
          policyVersion: form.dataset.policyVersion ?? '',
          sendCopy: wantsCopy,
          turnstileToken: captchaToken(),
        }),
      });

      // Una respuesta que no sea JSON (por ejemplo, un bloqueo de red) no debe
      // llegar al visitante como «Unexpected token».
      data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error('lead-failed');
      }

      form.reset();
      resetCaptcha();
      showSuccess({ name, email, copy: data.copy ?? 'not_requested' });
      // Evento de conversión (BACKLOG.md Épica J): window.arenaitAnalytics solo
      // existe si hay analítica activa; hoy no la hay y esto no hace nada.
      window.arenaitAnalytics?.trackEvent('Lead Form Submit', { result: 'success' });
    } catch {
      showFormError(messageForFailure(response, data), true);
      // Un token de Turnstile solo sirve una vez: se renueva para poder reintentar.
      resetCaptcha();
      window.arenaitAnalytics?.trackEvent('Lead Form Submit', { result: 'failure' });
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = SUBMIT_LABEL;
    }
  });

  sendAnotherButton?.addEventListener('click', showForm);

  // El error de un campo se retira en cuanto la persona lo corrige.
  for (const input of [fullNameInput, emailInput, messageInput]) {
    input?.addEventListener('input', () => setFieldError(input, false));
  }
  policyAcceptedInput?.addEventListener('change', () => {
    if (policyAcceptedInput.checked) setFieldError(policyAcceptedInput, false);
  });
}
