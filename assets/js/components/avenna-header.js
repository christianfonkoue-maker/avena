/**
 * AVENA — Header Web Component
 * assets/js/components/avenna-header.js
 */

'use strict';

class AvennaHeader extends HTMLElement {
  constructor() {
    super();
    // ✅ PAS de attachShadow() → Light DOM
    // Sans Shadow DOM, document.querySelector('#categoryTrigger') fonctionne
  }

  async connectedCallback() {
    try {
      const response = await fetch('/avena/components/header.html');
      const html = await response.text();

      // ✅ Injection dans le Light DOM (this.innerHTML, pas this.shadowRoot)
      this.innerHTML = html;

      this._updateAuthUI();
      this._initMegaMenu();
    } catch (error) {
      console.error('Error loading header:', error);
      this.innerHTML = '<div style="color:red">Header failed to load</div>';
    }
  }

  _updateAuthUI() {
    const session = sessionStorage.getItem('avena_session');
    const user = session ? JSON.parse(session) : null;
    // ✅ this.querySelector (Light DOM), plus this.shadowRoot
    const authBtn = this.querySelector('.main3four');
    const messagingIcon = this.querySelector('.main3two');

    if (authBtn) {
      if (user) {
        authBtn.innerHTML = `<a href="/pages/dashboard.html" style="color:white;text-decoration:none">${user.firstName || 'Dashboard'}</a>`;
      } else {
        authBtn.innerHTML = `<a href="/pages/auth/login.html" style="color:white;text-decoration:none">Sign in</a>`;
      }
    }

    if (messagingIcon && user) {
      const link = messagingIcon.querySelector('a');
      if (link) link.href = '/pages/messaging/inbox.html';
    }
  }

  _initMegaMenu() {
    // ✅ On initialise ici APRÈS que le HTML du header est dans le DOM
    // #categoryTrigger est maintenant trouvable par document.querySelector
    if (window.MegaMenu && !window._megaMenuInitialized) {
      window._megaMenuInitialized = true;
      window.megaMenu = new window.MegaMenu();
    }
  }
}

customElements.define('avenna-header', AvennaHeader);