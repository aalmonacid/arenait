/**
 * Menú mobile (Épica J). Abre/cierra el overlay de navegación de pantalla
 * completa, mantiene el foco atrapado dentro mientras está abierto, cierra
 * con Escape, y bloquea el scroll del body.
 *
 * Vive en /public/scripts/ (no inline en BaseLayout.astro) porque la CSP de
 * producción bloquea scripts inline — ver CONTEXT.md §5 bug #8 / Épica I.
 * Mismo patrón que cookie-consent.js: JS plano, sin build step, cargado con
 * <script type="module" src="/scripts/mobile-menu.js" is:inline>.
 */

const trigger = document.getElementById('mobile-menu-trigger');
const menu = document.getElementById('mobile-menu');
const closeButton = document.getElementById('mobile-menu-close');

if (trigger && menu && closeButton) {
  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';
  let lastFocused = null;

  function getFocusable() {
    return Array.from(menu.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null
    );
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
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

  function openMenu() {
    lastFocused = document.activeElement;
    menu.classList.remove('hidden');
    menu.classList.add('flex');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('overflow-hidden');
    document.addEventListener('keydown', handleKeydown);
    closeButton.focus();
  }

  function closeMenu() {
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('overflow-hidden');
    document.removeEventListener('keydown', handleKeydown);
    (lastFocused instanceof HTMLElement ? lastFocused : trigger).focus();
  }

  trigger.addEventListener('click', () => {
    if (menu.classList.contains('hidden')) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  closeButton.addEventListener('click', closeMenu);

  menu.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}
