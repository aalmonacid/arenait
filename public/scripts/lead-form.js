/**
 * Lógica de envío de LeadCaptureForm.astro. Archivo estático en /public a
 * propósito — ver el comentario en /scripts/consent.js: un <script> inline
 * en un .astro compartido queda bloqueado por la CSP en producción
 * (`script-src 'self'`, sin `unsafe-inline`), y este formulario es el único
 * flujo de captura de leads real del sitio.
 *
 * Captcha: si el formulario trae el widget de Cloudflare Turnstile, su token
 * llega en el campo oculto `cf-turnstile-response` y se envía al servidor, que
 * lo verifica. Sin widget (claves sin configurar) el flujo es el de siempre.
 */
const form = document.getElementById('leadCaptureForm');
const formTitle = document.getElementById('formTitle');
const emailInput = document.getElementById('corporateEmail');
const companyInput = document.getElementById('company');
const phoneInput = document.getElementById('phone');
const serviceOfInterestInput = document.getElementById('serviceOfInterest');
const messageInput = document.getElementById('message');
const fullNameInput = document.getElementById('fullName');
const honeypotInput = document.getElementById('companyWebsite');
const policyAcceptedInput = document.getElementById('policyAccepted');
const sendCopyInput = document.getElementById('sendCopy');
const policyError = document.getElementById('policyError');
const emailError = document.getElementById('emailError');
const captchaError = document.getElementById('captchaError');
const submitButton = form?.querySelector('button[type="submit"]');
const formError = document.getElementById('formError');

const successPanel = document.getElementById('formSuccess');
const successTitle = document.getElementById('successTitle');
const successText = document.getElementById('successText');
const successCopy = document.getElementById('successCopy');
const sendAnotherButton = document.getElementById('sendAnother');

const SUBMIT_LABEL = 'Enviar mensaje';

if (serviceOfInterestInput) {
  const preselected = new URLSearchParams(window.location.search).get('servicio');
  if (preselected) {
    const match = Array.from(serviceOfInterestInput.options).find(
      (option) => option.value === preselected,
    );
    if (match) {
      serviceOfInterestInput.value = preselected;
    }
  }
}

function captchaToken() {
  const field = form?.querySelector('[name="cf-turnstile-response"]');
  return field instanceof HTMLInputElement ? field.value : '';
}

function hasCaptchaWidget() {
  return Boolean(form?.querySelector('.cf-turnstile'));
}

function resetCaptcha() {
  // `turnstile` lo define el script externo de Cloudflare, si está cargado.
  if (hasCaptchaWidget() && typeof window.turnstile?.reset === 'function') {
    window.turnstile.reset();
  }
}

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
      successCopy.textContent = `También enviamos una copia de tu mensaje a ${email}.`;
      successCopy.classList.remove('hidden');
    } else if (copy === 'failed') {
      successCopy.textContent =
        'No pudimos enviarte la copia por correo, pero tu mensaje sí nos llegó.';
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

if (form && emailInput && emailError && submitButton && successPanel && formError) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    formError.classList.add('hidden');
    policyError?.classList.add('hidden');
    captchaError?.classList.add('hidden');

    if (!policyAcceptedInput?.checked) {
      policyError?.classList.remove('hidden');
      return;
    }

    if (honeypotInput?.value) {
      // Probablemente un bot: simular éxito sin llamar a la API para no darle señal de qué falló.
      showSuccess({ name: '', email: '', copy: 'not_requested' });
      form.reset();
      return;
    }

    if (hasCaptchaWidget() && !captchaToken()) {
      captchaError?.classList.remove('hidden');
      return;
    }

    const name = fullNameInput?.value ?? '';
    const email = emailInput.value;
    const wantsCopy = Boolean(sendCopyInput?.checked);

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          company: companyInput?.value ?? '',
          corporateEmail: email,
          phone: phoneInput?.value ?? '',
          serviceOfInterest: serviceOfInterestInput?.value ?? '',
          message: messageInput?.value ?? '',
          source: 'lead-capture-form',
          companyWebsite: honeypotInput?.value ?? '',
          policyAccepted: policyAcceptedInput?.checked ?? false,
          policyVersion: form.dataset.policyVersion ?? '',
          sendCopy: wantsCopy,
          turnstileToken: captchaToken(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const error = new Error(data.error || 'No se pudo enviar el mensaje.');
        error.isCaptcha = data.captcha === true;
        throw error;
      }

      form.reset();
      resetCaptcha();
      showSuccess({ name, email, copy: data.copy ?? 'not_requested' });
      // Evento de conversión (BACKLOG.md Épica J, ver /scripts/analytics.js).
      // window.arenaitAnalytics es no-op sin consentimiento aceptado.
      window.arenaitAnalytics?.trackEvent('Lead Form Submit', { result: 'success' });
    } catch (err) {
      formError.textContent =
        err instanceof Error ? err.message : 'No se pudo enviar el mensaje. Intente nuevamente.';
      formError.classList.remove('hidden');
      // Un token de Turnstile solo sirve una vez: se renueva para poder reintentar.
      resetCaptcha();
      window.arenaitAnalytics?.trackEvent('Lead Form Submit', { result: 'failure' });
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = SUBMIT_LABEL;
    }
  });

  sendAnotherButton?.addEventListener('click', showForm);

  emailInput.addEventListener('input', () => {
    emailError.classList.add('hidden');
  });
}
