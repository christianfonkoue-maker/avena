/**
 * AVENA — Header Web Component
 * assets/js/components/avenna-header.js
 */

'use strict';

class AvennaHeader extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      const response = await fetch('/components/header.html');
      const html = await response.text();

      this.innerHTML = html;

      this._updateAuthUI();
      this._initMegaMenu();
      this._initScrollBehavior();
    } catch (error) {
      console.error('Error loading header:', error);
      this.innerHTML = '<div style="color:red">Header failed to load</div>';
    }
  }

  _updateAuthUI() {
    let user = null;
    try {
      const raw = sessionStorage.getItem('avena_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Date.now() < parsed.expiresAt) {
          user = parsed;
        } else {
          sessionStorage.removeItem('avena_session');
        }
      }
    } catch (e) {
      sessionStorage.removeItem('avena_session');
    }

    const authButton = this.querySelector('#authButton');
    const userMenu   = this.querySelector('#userMenu');
    const userAvatar = this.querySelector('#userAvatar');

    if (user) {
      const firstName = user.first_name || user.firstName || '';
      const initial   = firstName.charAt(0).toUpperCase() || 'U';

      if (authButton) authButton.style.display = 'none';
      if (userMenu)   userMenu.style.display   = 'flex';
      if (userAvatar) userAvatar.textContent    = initial;
    } else {
      if (authButton) authButton.style.display = 'flex';
      if (userMenu)   userMenu.style.display   = 'none';
    }

    const logoutBtn = this.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('avena_session');
        sessionStorage.removeItem('avena_token');
        window.location.href = '/index.html';
      });
    }

    const toggle   = this.querySelector('#userDropdownToggle');
    const dropdown = this.querySelector('#userDropdown');
    
    if (toggle && dropdown) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove('open');
        }
      });
    }
  }

  _initMegaMenu() {
    if (window.MegaMenu && !window._megaMenuInitialized) {
      window._megaMenuInitialized = true;
      window.megaMenu = new window.MegaMenu();
    }
  }

  _initScrollBehavior() {
    setTimeout(() => {
      const headerElement = this.querySelector('header');
      if (!headerElement) {
        console.warn('Header not found for scroll behavior');
        return;
      }

      let lastScrollY = window.scrollY;

      if (!document.getElementById('scroll-header-style')) {
        const style = document.createElement('style');
        style.id = 'scroll-header-style';
        style.textContent = `
          avenna-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            transition: transform 0.3s ease-in-out;
          }
          avenna-header.header-hidden {
            transform: translateY(-100%);
          }
          avenna-header header {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
        `;
        document.head.appendChild(style);
      }

      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          this.classList.add('header-hidden');
        } else if (currentScrollY < lastScrollY) {
          this.classList.remove('header-hidden');
        }

        lastScrollY = currentScrollY;
      });
    }, 100);
  }
}

customElements.define('avenna-header', AvennaHeader);