import { readConsent, writeConsent } from '/scripts/consent.js';

const banner = document.getElementById('cookie-consent-banner');
const acceptButton = document.getElementById('cookie-accept');
const rejectButton = document.getElementById('cookie-reject');
const whatsappButton = document.getElementById('whatsapp-float');

if (!readConsent()) {
  banner?.classList.remove('hidden');
  whatsappButton?.classList.add('hidden');
}

function decide(choice) {
  writeConsent(choice);
  banner?.classList.add('hidden');
  whatsappButton?.classList.remove('hidden');
  window.dispatchEvent(new CustomEvent('arenait:consent-changed', { detail: { choice } }));
}

acceptButton?.addEventListener('click', () => decide('accepted'));
rejectButton?.addEventListener('click', () => decide('rejected'));
