/**
 * Apertura/cierre/submit del modal de descarga gated en /recursos
 * (WhitepaperGateModal.astro). Archivo real en /public/scripts/ — un
 * <script> inline en un componente usado en una página del sitio queda
 * bloqueado por la CSP en producción (script-src 'self', sin unsafe-inline),
 * ver CONTEXT.md §5 bug #8. Mismo patrón que mobile-menu.js (focus trap,
 * Escape) y lead-form.js (validación + fetch).
 */

const overlay = document.getElementById('whitepaperGateOverlay');
const modal = document.getElementById('whitepaperGateModal');
const closeButton = document.getElementById('whitepaperGateClose');
const titleEl = document.getElementById('whitepaperGateTitle');
const idInput = document.getElementById('whitepaperGateId');
const form = document.getElementById('whitepaperGateForm');
const fullNameInput = document.getElementById('whitepaperFullName');
const emailInput = document.getElementById('whitepaperEmail');
const emailError = document.getElementById('whitepaperEmailError');
const companyInput = document.getElementById('whitepaperCompany');
const honeypotInput = document.getElementById('whitepaperCompanyWebsite');
const policyAcceptedInput = document.getElementById('whitepaperPolicyAccepted');
const policyError = document.getElementById('whitepaperPolicyError');
const formError = document.getElementById('whitepaperFormError');
const successView = document.getElementById('whitepaperGateSuccess');
const downloadLink = document.getElementById('whitepaperDownloadLink');
const triggers = document.querySelectorAll('.whitepaper-download-trigger');

if (overlay && modal && closeButton && form && triggers.length > 0) {
  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled])';
  let lastFocused = null;

  function getFocusable() {
    return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null,
    );
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusable();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function resetToForm() {
    form.reset();
    form.classList.remove('hidden');
    successView?.classList.add('hidden');
    emailError?.classList.add('hidden');
    policyError?.classList.add('hidden');
    formError?.classList.add('hidden');
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Descargar ahora';
    }
  }

  function openModal(whitepaperId, whitepaperTitle) {
    lastFocused = document.activeElement;
    resetToForm();
    if (idInput) idInput.value = whitepaperId ?? '';
    if (titleEl) titleEl.textContent = whitepaperTitle ?? '';
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    document.addEventListener('keydown', handleKeydown);
    fullNameInput?.focus();
  }

  function closeModal() {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    document.removeEventListener('keydown', handleKeydown);
    (lastFocused instanceof HTMLElement ? lastFocused : null)?.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openModal(trigger.dataset.whitepaperId, trigger.dataset.whitepaperTitle);
    });
  });

  closeButton.addEventListener('click', closeModal);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal();
  });

  emailInput?.addEventListener('input', () => {
    emailError?.classList.add('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    formError?.classList.add('hidden');
    policyError?.classList.add('hidden');
    emailError?.classList.add('hidden');

    if (!policyAcceptedInput?.checked) {
      policyError?.classList.remove('hidden');
      return;
    }

    if (honeypotInput?.value) {
      // Probablemente un bot: simular éxito sin llamar a la API.
      successView?.classList.remove('hidden');
      form.classList.add('hidden');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }

    try {
      const response = await fetch('/api/whitepaper-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whitepaperId: idInput?.value ?? '',
          fullName: fullNameInput?.value ?? '',
          corporateEmail: emailInput?.value ?? '',
          company: companyInput?.value ?? '',
          companyWebsite: honeypotInput?.value ?? '',
          policyAccepted: policyAcceptedInput?.checked ?? false,
          policyVersion: form.dataset.policyVersion ?? '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo procesar la descarga.');
      }

      if (downloadLink && data.pdfUrl) {
        downloadLink.href = data.pdfUrl;
      }
      form.classList.add('hidden');
      successView?.classList.remove('hidden');
      downloadLink?.focus();
      window.arenaitAnalytics?.trackEvent('Whitepaper Download', { result: 'success' });
    } catch (err) {
      if (formError) {
        formError.textContent =
          err instanceof Error ? err.message : 'No se pudo procesar la descarga. Intente nuevamente.';
        formError.classList.remove('hidden');
      }
      window.arenaitAnalytics?.trackEvent('Whitepaper Download', { result: 'failure' });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Descargar ahora';
      }
    }
  });
}
