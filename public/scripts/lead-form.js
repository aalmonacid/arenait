/**
 * Lógica de envío de LeadCaptureForm.astro. Archivo estático en /public a
 * propósito — ver el comentario en /scripts/consent.js: un <script> inline
 * en un .astro compartido queda bloqueado por la CSP en producción
 * (`script-src 'self'`, sin `unsafe-inline`), y este formulario es el único
 * flujo de captura de leads real del sitio.
 */
const form = document.getElementById('leadCaptureForm');
const emailInput = document.getElementById('corporateEmail');
const companyInput = document.getElementById('company');
const phoneInput = document.getElementById('phone');
const serviceOfInterestInput = document.getElementById('serviceOfInterest');
const messageInput = document.getElementById('message');
const fullNameInput = document.getElementById('fullName');
const honeypotInput = document.getElementById('companyWebsite');
const policyAcceptedInput = document.getElementById('policyAccepted');
const policyError = document.getElementById('policyError');
const emailError = document.getElementById('emailError');
const submitButton = form?.querySelector('button[type="submit"]');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

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

if (form && emailInput && emailError && submitButton && formSuccess && formError) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    formSuccess.classList.add('hidden');
    formError.classList.add('hidden');
    policyError?.classList.add('hidden');

    if (!policyAcceptedInput?.checked) {
      policyError?.classList.remove('hidden');
      return;
    }

    if (honeypotInput?.value) {
      // Probablemente un bot: simular éxito sin llamar a la API para no darle señal de qué falló.
      formSuccess.classList.remove('hidden');
      form.reset();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullNameInput?.value ?? '',
          company: companyInput?.value ?? '',
          corporateEmail: emailInput.value,
          phone: phoneInput?.value ?? '',
          serviceOfInterest: serviceOfInterestInput?.value ?? '',
          message: messageInput?.value ?? '',
          source: 'lead-capture-form',
          companyWebsite: honeypotInput?.value ?? '',
          policyAccepted: policyAcceptedInput?.checked ?? false,
          policyVersion: form.dataset.policyVersion ?? '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo enviar el mensaje.');
      }

      formSuccess.classList.remove('hidden');
      form.reset();
    } catch (err) {
      formError.textContent =
        err instanceof Error ? err.message : 'No se pudo enviar el mensaje. Intente nuevamente.';
      formError.classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar mensaje';
    }
  });

  emailInput.addEventListener('input', () => {
    emailError.classList.add('hidden');
  });
}
