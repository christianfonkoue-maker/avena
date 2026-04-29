/**
 * AVENA — Header Web Component
 * assets/js/components/avenna-header.js
 * 
 * Récupère le header depuis components/header.html et l'injecte
 */

'use strict';

class AvennaHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      const response = await fetch('/avena/components/header.html');
      const html = await response.text();
      
      // Injecter le HTML dans le shadow DOM
      this.shadowRoot.innerHTML = `
        <style>
          /* Copier les styles essentiels du header depuis global.css */
          @import url('/avena/assets/css/global.css');
          /* Styles additionnels pour le shadow DOM si besoin */
        </style>
        ${html}
      `;
      
      // Ré-attacher les scripts après injection
      this._attachEvents();
      this._updateAuthUI();
    } catch (error) {
      console.error('Error loading header:', error);
      this.shadowRoot.innerHTML = '<div style="color:red">Header failed to load</div>';
    }
  }

  _attachEvents() {
    // Ré-initialiser le mega menu
    if (window.MegaMenu) {
      const trigger = this.shadowRoot.querySelector('#categoryTrigger');
      if (trigger && !trigger._megaMenuInitialized) {
        trigger._megaMenuInitialized = true;
        // Le mega menu sera ré-initialisé globalement
      }
    }
  }

  _updateAuthUI() {
    const session = sessionStorage.getItem('avena_session');
    const user = session ? JSON.parse(session) : null;
    const authBtn = this.shadowRoot.querySelector('.main3four');
    const messagingIcon = this.shadowRoot.querySelector('.main3two');

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
}

customElements.define('avenna-header', AvennaHeader);