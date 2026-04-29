/**
 * AVENA — Components Loader
 * assets/js/components-loader.js
 * 
 * Charge tous les Web Components et initialise la page
 */

'use strict';

// Importer tous les composants
import './components/avenna-header.js';
import './components/avenna-footer.js';
import './components/avenna-modal.js';

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si la page a déjà un header
  if (!document.querySelector('avenna-header')) {
    const headerPlaceholder = document.createElement('avenna-header');
    document.body.insertBefore(headerPlaceholder, document.body.firstChild);
  }
  
  // Vérifier si la page a déjà un footer
  if (!document.querySelector('avenna-footer')) {
    const footerPlaceholder = document.createElement('avenna-footer');
    document.body.appendChild(footerPlaceholder);
  }
  
  // Réinitialiser le mega menu globalement
  if (window.MegaMenu && !window._megaMenuInitialized) {
    window._megaMenuInitialized = true;
    window.megaMenu = new MegaMenu();
  }
});