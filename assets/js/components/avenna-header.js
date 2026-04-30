/**
 * AVENA — Header Web Component
 * assets/js/components/avenna-header.js
 */

'use strict';

class AvennaHeader extends HTMLElement {
  constructor() {
    super();
    // PAS de attachShadow() → Light DOM
    // Sans Shadow DOM, document.querySelector('#categoryTrigger') fonctionne
  }

  async connectedCallback() {
    try {
      const response = await fetch('/components/header.html');
      const html = await response.text();

      // Injection dans le Light DOM
      this.innerHTML = html;

      this._updateAuthUI();
      this._initMegaMenu();
    } catch (error) {
      console.error('Error loading header:', error);
      this.innerHTML = '<div style="color:red">Header failed to load</div>';
    }
  }

  _updateAuthUI() {
    // ✅ FIX 1 : lire dans localStorage (c'est là que auth.js → Session.set() sauvegarde)
    let user = null;
    try {
      const raw = localStorage.getItem('avena_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Vérifier que la session n'est pas expirée
        if (parsed && Date.now() < parsed.expiresAt) {
          user = parsed;
        } else {
          localStorage.removeItem('avena_session');
        }
      }
    } catch (e) {
      localStorage.removeItem('avena_session');
    }

    const authButton = this.querySelector('#authButton');
    const userMenu   = this.querySelector('#userMenu');
    const userAvatar = this.querySelector('#userAvatar');

    if (user) {
      // ✅ FIX 2 : supporter first_name (backend) ET firstName (ancien format)
      const firstName = user.first_name || user.firstName || '';
      const initial   = firstName.charAt(0).toUpperCase() || 'U';

      if (authButton) authButton.style.display = 'none';
      if (userMenu)   userMenu.style.display   = 'flex';
      if (userAvatar) userAvatar.textContent    = initial;
    } else {
      if (authButton) authButton.style.display = 'flex';
      if (userMenu)   userMenu.style.display   = 'none';
    }

    // Déconnexion
    const logoutBtn = this.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('avena_session');
        localStorage.removeItem('avena_token');
        sessionStorage.removeItem('avena_token');
        window.location.href = '/index.html';
      });
    }

    // Toggle dropdown utilisateur
    const toggle   = this.querySelector('#userDropdownToggle');
    const dropdown = this.querySelector('#userDropdown');
    if (toggle && dropdown) {
      toggle.addEventListener('click', () => {
        dropdown.classList.toggle('open');
      });
      // Fermer si clic ailleurs
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target)) dropdown.classList.remove('open');
      });
    }
  }

  _initMegaMenu() {
    if (window.MegaMenu && !window._megaMenuInitialized) {
      window._megaMenuInitialized = true;
      window.megaMenu = new window.MegaMenu();
    }
  }
}

customElements.define('avenna-header', AvennaHeader);