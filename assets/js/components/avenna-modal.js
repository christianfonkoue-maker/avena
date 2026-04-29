/**
 * AVENA — Modal Web Component
 * assets/js/components/avenna-modal.js
 * 
 * Utilisation:
 *   <avenna-modal id="myModal" title="Hello">
 *     <p>Contenu de la modale</p>
 *   </avenna-modal>
 *   
 *   document.getElementById('myModal').show()
 *   document.getElementById('myModal').hide()
 */

'use strict';

class AvennaModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._visible = false;
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const title = this.getAttribute('title') || 'Modal';
    
    this.shadowRoot.innerHTML = `
      <style>
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-container {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          animation: fadeIn 0.2s ease;
        }
        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e6f3;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 {
          font-family: 'Sora', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #7a7f9a;
        }
        .modal-body {
          padding: 20px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      </style>
      <div class="modal-overlay" id="overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>${this._escapeHtml(title)}</h3>
            <button class="modal-close" id="closeBtn">✕</button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    `;

    this._overlay = this.shadowRoot.getElementById('overlay');
    this._closeBtn = this.shadowRoot.getElementById('closeBtn');
    
    this._closeBtn.addEventListener('click', () => this.hide());
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.hide();
    });
  }

  show() {
    if (this._overlay) {
      this._overlay.style.display = 'flex';
      this._visible = true;
    }
  }

  hide() {
    if (this._overlay) {
      this._overlay.style.display = 'none';
      this._visible = false;
    }
  }

  _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
}

customElements.define('avenna-modal', AvennaModal);