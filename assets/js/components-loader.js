/**
 * AVENA — Components Loader
 * assets/js/components-loader.js
 */

'use strict';

import './components/avenna-header.js';
import './components/avenna-footer.js';
import './components/avenna-modal.js';

document.addEventListener('DOMContentLoaded', () => {
  // Injecter le header s'il n'est pas déjà dans le HTML
  if (!document.querySelector('avenna-header')) {
    const headerPlaceholder = document.createElement('avenna-header');
    document.body.insertBefore(headerPlaceholder, document.body.firstChild);
  }

  // Injecter le footer s'il n'est pas déjà dans le HTML
  if (!document.querySelector('avenna-footer')) {
    const footerPlaceholder = document.createElement('avenna-footer');
    document.body.appendChild(footerPlaceholder);
  }

  // ✅ PAS de new MegaMenu() ici
  // Le MegaMenu est initialisé dans avenna-header.js → _initMegaMenu()
  // une fois que le fetch du header.html est terminé et que
  // #categoryTrigger est bien dans le DOM.
});