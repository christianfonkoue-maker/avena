/**
 * AVENA — Footer Web Component
 * assets/js/components/avenna-footer.js
 */

'use strict';

class AvennaFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      const response = await fetch('/avena/components/footer.html');
      let html = await response.text();
      
      // Remplacer l'année dynamiquement
      html = html.replace('{currentYear}', new Date().getFullYear());
      
      this.shadowRoot.innerHTML = `
        <style>
          @import url('/avena/assets/css/global.css');
          /* Styles supplémentaires pour le footer */
          .avenna-footer {
            background: #1a1d2e;
            color: #e4e7f0;
            padding: 48px 24px 24px;
            margin-top: 60px;
          }
          .footer-container {
            max-width: 1280px;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 40px;
          }
          .footer-brand img { filter: brightness(0) invert(1); }
          .footer-socials a { color: #a0a5c0; margin-right: 16px; font-size: 1.2rem; }
          .footer-bottom { text-align: center; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 32px; }
          @media (max-width: 768px) { .footer-container { flex-direction: column; } }
        </style>
        ${html}
      `;
    } catch (error) {
      console.error('Error loading footer:', error);
      this.shadowRoot.innerHTML = '<footer style="background:#1a1d2e;color:white;text-align:center;padding:20px">© Avena</footer>';
    }
  }
}

customElements.define('avenna-footer', AvennaFooter);