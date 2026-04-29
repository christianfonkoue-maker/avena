

/**
 * ============================================================
 *  CAMPUS HUB — MEGA MENU CONTROLLER
 *  mega-menu.js
 *
 *  Fonctionnalités :
 *  - Ouverture au hover + clic sur le bouton Catégories
 *  - Changement de panel au hover sur les items sidebar
 *  - Fermeture via backdrop / Escape / clic extérieur
 *  - Accessibilité clavier (Tab, Arrow, Enter)
 *  - Structure prête pour branchement avec data/mock/ JSON
 *  - Prêt pour migration vers Express + PostgreSQL
 * ============================================================
 */
 
'use strict';
 
/* ============================================================
   DATA LAYER
   Structure miroir de data/mock/ — remplacer par appels API
   ============================================================ */
 
/**
 * Charge les catégories depuis le fichier mock local.
 * Dans la future version Express, remplacer par :
 *   const res = await fetch('/api/categories');
 *   return res.json();
 */
async function loadCategories() {
  // Pour l'instant on retourne les données en dur.
  // Quand tu auras l'API Express ready, tu feras :
  //   const res = await fetch('/api/categories');
  //   return res.json();
  return MOCK_CATEGORIES;
}
 
/**
 * Données mock — identique à ce que tu mettras dans products.json
 * Clé   : data-category attribute dans le HTML
 * Value : métadonnées utilisées pour enrichir le menu dynamiquement
 *
 * STRUCTURE D'UN LIEN (nouveau format avec image) :
 * {
 *   label : string   — texte affiché
 *   href  : string   — URL de destination (default '#')
 *   image : string   — chemin local (/assets/images/...)
 *                      ou URL externe
 *                      ou null → placeholder généré automatiquement
 * }
 *
 * QUAND TU AURAS TES VRAIES IMAGES :
 *   Remplace null par le chemin : image: '/assets/images/cahiers.webp'
 *   L'helper _thumb() gère automatiquement null vs chemin réel.
 */
const MOCK_CATEGORIES = {
  school: {
    id: 'school',
    label: 'School Features',
    emoji: '🎓',
    featured: { tag: '🔥 Rentrée 2025', text: 'Kits complets dès', price: '15 GHS' },
    groups: [
      { title: 'Fournitures', links: [
        { label: 'Cahiers & Classeurs',   href: '#', image: null },
        { label: 'Stylos & Crayons',      href: '#', image: null },
        { label: 'Calculatrices',          href: '#', image: null },
        { label: 'Règles & Géométrie',    href: '#', image: null },
        { label: 'Post-it & Surligneurs', href: '#', image: null },
      ]},
      { title: 'Sacs & Transport', links: [
        { label: 'Sacs à dos',      href: '#', image: null },
        { label: 'Cartables',       href: '#', image: null },
        { label: 'Trousses',        href: '#', image: null },
        { label: 'Porte-documents', href: '#', image: null },
      ]},
      { title: 'Livres & Docs', links: [
        { label: 'Manuels scolaires',  href: '#', image: null },
        { label: 'Dictionnaires',      href: '#', image: null },
        { label: 'Agendas & Planners', href: '#', image: null },
        { label: 'Flashcards',         href: '#', image: null },
      ]},
      { title: 'Impression', links: [
        { label: 'Impression de cours', href: '#', image: null },
        { label: 'Reliure de mémoire',  href: '#', image: null },
        { label: 'Papier A4',           href: '#', image: null },
      ]},
    ]
  },
  electronics: {
    id: 'electronics',
    label: 'Electronics',
    emoji: '💻',
    featured: { tag: '⚡ Meilleure vente', text: 'Laptops étudiants dès', price: '800 GHS' },
    groups: [
      { title: 'Ordinateurs', links: [
        { label: 'Laptops',        href: '#', image: null },
        { label: 'Tablettes',      href: '#', image: null },
        { label: 'Chromebooks',    href: '#', image: null },
        { label: 'Accessoires PC', href: '#', image: null },
      ]},
      { title: 'Audio', links: [
        { label: 'Écouteurs',           href: '#', image: null },
        { label: 'Casques',             href: '#', image: null },
        { label: 'Enceintes Bluetooth', href: '#', image: null },
        { label: 'Microphones',         href: '#', image: null },
      ]},
      { title: 'Téléphones', links: [
        { label: 'Smartphones',        href: '#', image: null },
        { label: 'Coques & Protection',href: '#', image: null },
        { label: 'Chargeurs',          href: '#', image: null },
        { label: 'Power Banks',        href: '#', image: null },
      ]},
      { title: 'Câbles & Adaptateurs', links: [
        { label: 'USB-C / USB-A', href: '#', image: null },
        { label: 'HDMI',          href: '#', image: null },
        { label: 'Hubs USB',      href: '#', image: null },
      ]},
    ]
  },
  furniture: {
    id: 'furniture',
    label: 'Furniture',
    emoji: '🪑',
    featured: { tag: '🏠 Populaire', text: 'Bureau compact dès', price: '120 GHS' },
    groups: [
      { title: 'Bureau', links: [
        { label: 'Bureaux',           href: '#', image: null },
        { label: 'Chaises de bureau', href: '#', image: null },
        { label: 'Lampes de bureau',  href: '#', image: null },
        { label: 'Organisateurs',     href: '#', image: null },
      ]},
      { title: 'Chambre', links: [
        { label: 'Lits & Matelas',  href: '#', image: null },
        { label: 'Bibliothèques',   href: '#', image: null },
        { label: 'Étagères',        href: '#', image: null },
        { label: 'Miroirs',         href: '#', image: null },
      ]},
      { title: 'Rangement', links: [
        { label: 'Armoires',            href: '#', image: null },
        { label: 'Boîtes de rangement', href: '#', image: null },
        { label: 'Cintres',             href: '#', image: null },
      ]},
      { title: 'Déco', links: [
        { label: 'Coussins & Plaids',   href: '#', image: null },
        { label: 'Tableaux & Affiches', href: '#', image: null },
        { label: 'Tapis',               href: '#', image: null },
      ]},
    ]
  },
  food: {
    id: 'food',
    label: 'Food & Collation',
    emoji: '🍱',
    featured: { tag: '🍫 Nouveau', text: 'Pack collation semaine dès', price: '25 GHS' },
    groups: [
      { title: 'Snacks', links: [
        { label: 'Biscuits & Gâteaux',   href: '#', image: null },
        { label: 'Chips & Crackers',     href: '#', image: null },
        { label: 'Fruits secs & Noix',   href: '#', image: null },
        { label: 'Barres céréales',      href: '#', image: null },
      ]},
      { title: 'Boissons', links: [
        { label: 'Eau & Jus',            href: '#', image: null },
        { label: 'Café & Thé',           href: '#', image: null },
        { label: 'Boissons énergisantes',href: '#', image: null },
        { label: 'Smoothies',            href: '#', image: null },
      ]},
      { title: 'Repas rapides', links: [
        { label: 'Plats cuisinés',      href: '#', image: null },
        { label: 'Soupes instantanées', href: '#', image: null },
        { label: 'Sandwichs',           href: '#', image: null },
      ]},
      { title: 'Cuisine dorm', links: [
        { label: 'Épices & Sauces', href: '#', image: null },
        { label: 'Riz & Pâtes',     href: '#', image: null },
        { label: 'Conserves',       href: '#', image: null },
      ]},
    ]
  },
  dress: {
    id: 'dress',
    label: 'Dress',
    emoji: '👗',
    featured: { tag: '✨ Tendance', text: 'Collection campus dès', price: '35 GHS' },
    groups: [
      { title: 'Femmes', links: [
        { label: 'Robes & Jupes',     href: '#', image: null },
        { label: 'T-shirts & Tops',   href: '#', image: null },
        { label: 'Jeans & Pantalons', href: '#', image: null },
        { label: 'Vestes & Hoodies',  href: '#', image: null },
      ]},
      { title: 'Hommes', links: [
        { label: 'T-shirts & Polos', href: '#', image: null },
        { label: 'Jeans & Shorts',   href: '#', image: null },
        { label: 'Chemises',         href: '#', image: null },
        { label: 'Hoodies & Sweats', href: '#', image: null },
      ]},
      { title: 'Chaussures', links: [
        { label: 'Sneakers',  href: '#', image: null },
        { label: 'Sandales',  href: '#', image: null },
        { label: 'Mocassins', href: '#', image: null },
      ]},
      { title: 'Accessoires', links: [
        { label: 'Casquettes & Bonnets', href: '#', image: null },
        { label: 'Ceintures',           href: '#', image: null },
        { label: 'Montres',             href: '#', image: null },
      ]},
    ]
  },
  sport: {
    id: 'sport',
    label: 'Sport Equipment',
    emoji: '⚽',
    featured: { tag: '🏃 Sport', text: 'Kit fitness complet dès', price: '80 GHS' },
    groups: [
      { title: 'Sports collectifs', links: [
        { label: 'Football',   href: '#', image: null },
        { label: 'Basketball', href: '#', image: null },
        { label: 'Volleyball', href: '#', image: null },
        { label: 'Rugby',      href: '#', image: null },
      ]},
      { title: 'Fitness', links: [
        { label: 'Tapis de yoga',      href: '#', image: null },
        { label: 'Haltères',           href: '#', image: null },
        { label: 'Bandes élastiques',  href: '#', image: null },
        { label: 'Cordes à sauter',    href: '#', image: null },
      ]},
      { title: 'Running', links: [
        { label: 'Chaussures de course', href: '#', image: null },
        { label: 'Brassards & GPS',      href: '#', image: null },
        { label: 'Vêtements running',    href: '#', image: null },
      ]},
      { title: 'Natation', links: [
        { label: 'Maillots de bain',    href: '#', image: null },
        { label: 'Lunettes de piscine', href: '#', image: null },
        { label: 'Bonnets',             href: '#', image: null },
      ]},
    ]
  },
  beauty: {
    id: 'beauty',
    label: 'Beauty',
    emoji: '💄',
    featured: { tag: '🌸 Best seller', text: 'Routines soin dès', price: '20 GHS' },
    groups: [
      { title: 'Soin du visage', links: [
        { label: 'Crèmes hydratantes', href: '#', image: null },
        { label: 'Nettoyants',         href: '#', image: null },
        { label: 'Masques & Sérums',   href: '#', image: null },
        { label: 'SPF & Protection',   href: '#', image: null },
      ]},
      { title: 'Maquillage', links: [
        { label: 'Fond de teint',     href: '#', image: null },
        { label: 'Rouges à lèvres',   href: '#', image: null },
        { label: 'Mascara & Eyeliner',href: '#', image: null },
        { label: 'Palettes fards',    href: '#', image: null },
      ]},
      { title: 'Cheveux', links: [
        { label: 'Shampooings',          href: '#', image: null },
        { label: 'Huiles capillaires',   href: '#', image: null },
        { label: 'Accessoires cheveux',  href: '#', image: null },
      ]},
      { title: 'Corps & Parfums', links: [
        { label: 'Déodorants',   href: '#', image: null },
        { label: 'Parfums',      href: '#', image: null },
        { label: 'Lotions corps',href: '#', image: null },
      ]},
    ]
  },
};
 
/* ============================================================
   DOM HELPERS
   ============================================================ */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];
 
/* ============================================================
   MEGA MENU CONTROLLER
   ============================================================ */
class MegaMenu {
  constructor() {
    this.trigger   = $('#categoryTrigger');
    this.menu      = $('#megaMenu');
    this.btn       = $('.categories-btn', this.trigger);
    this.backdrop  = $('#menuBackdrop');
    this.sideItems = $$('.sidebar__item', this.menu);
    this.panels    = $$('.content-panel', this.menu);
 
    this.isOpen        = false;
    this.hoverTimer    = null;
    this.activeCategory = 'school';
 
    this._init();
  }
 
  /* ------ INIT ------ */
  async _init() {
    // Génère le menu depuis les données JS (mock ou future API)
    // C'est ici que les vignettes image sont rendues
    await this._renderFromData();
 
    this._bindEvents();
    this._updateAria();
  }
 
  /* ------ RENDER FROM DATA (optionnel, prêt pour l'API) ------
   * Génère le menu entier depuis les données mock / API Express.
   * Appelle cette méthode depuis _init() pour activer le rendu dynamique.
   */
  async _renderFromData() {
    const categories = await loadCategories();
    const sidebar = $('.sidebar__list', this.menu);
    const content = $('.mega-menu__content', this.menu);
 
    if (!sidebar || !content) return;
 
    sidebar.innerHTML = '';
    content.innerHTML = '';
 
    let first = true;
    for (const [key, cat] of Object.entries(categories)) {
      // Sidebar item
      const li = this._buildSidebarItem(key, cat, first);
      sidebar.appendChild(li);
 
      // Content panel
      const panel = this._buildPanel(key, cat, first);
      content.appendChild(panel);
 
      first = false;
    }
 
    // Re-bind sidebar items after DOM rebuild
    this.sideItems = $$('.sidebar__item', this.menu);
    this.panels    = $$('.content-panel', this.menu);
    this._bindSidebarHover();
  }
 
  _buildSidebarItem(key, cat, isActive) {
    const li = document.createElement('li');
    li.className = 'sidebar__item' + (isActive ? ' active' : '');
    li.dataset.category = key;
    li.setAttribute('role', 'listitem');
    li.innerHTML = `
      <button class="sidebar__btn" ${isActive ? 'aria-selected="true"' : ''}>
        <span class="sidebar__icon">${cat.emoji}</span>
        <span class="sidebar__text">${cat.label}</span>
        <svg class="sidebar__arrow" viewBox="0 0 8 14" fill="none">
          <path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>`;
    return li;
  }
 
  /**
   * _thumb(link) — génère le HTML de la vignette
   *
   * • link.image = null     → placeholder SVG coloré avec initiale
   * • link.image = '/...'   → vraie balise <img> (chemin local ou URL)
   *
   * MIGRATION VERS TES VRAIES IMAGES :
   *   Dans le mock, remplace `image: null` par `image: '/assets/images/mon-fichier.webp'`
   *   ou par une URL externe. Le reste est automatique.
   */
  _thumb(link) {
    if (link.image) {
      // Vraie image disponible
      return `<img
        class="group__link-img"
        src="${link.image}"
        alt="${link.label}"
        loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      /><span class="group__link-placeholder" style="display:none" aria-hidden="true">${link.label.charAt(0).toUpperCase()}</span>`;
    }
    // Placeholder : initiale sur fond teinté
    return `<span class="group__link-placeholder" aria-hidden="true">${link.label.charAt(0).toUpperCase()}</span>`;
  }
 
  _buildPanel(key, cat, isActive) {
    const div = document.createElement('div');
    div.className = 'content-panel' + (isActive ? ' active' : '');
    div.dataset.panel = key;
 
    const groupsHTML = cat.groups.map(g => `
      <div class="subcategory-group">
        <h3 class="group__title">${g.title}</h3>
        <ul class="group__list">
          ${g.links.map(l => `
            <li>
              <a href="${l.href ?? '#'}" class="group__link">
                <span class="group__link-thumb">${this._thumb(l)}</span>
                <span class="group__link-label">${l.label}</span>
              </a>
            </li>`).join('')}
        </ul>
      </div>`).join('');
 
    div.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title">${cat.emoji} ${cat.label}</h2>
        <p class="panel__desc">${cat.featured?.text ?? ''}</p>
      </div>
      <div class="panel__grid">${groupsHTML}</div>
      <div class="panel__featured">
        <div class="featured-tag">${cat.featured.tag}</div>
        <p>${cat.featured.text} <strong>${cat.featured.price}</strong></p>
      </div>`;
    return div;
  }
 
  /* ------ EVENTS ------ */
  _bindEvents() {
    // Hover on trigger area
    this.trigger.addEventListener('mouseenter', () => this._scheduleOpen());
    this.trigger.addEventListener('mouseleave', (e) => this._handleMouseLeave(e));
 
    // Hover on menu itself to keep open
    this.menu.addEventListener('mouseenter', () => clearTimeout(this.hoverTimer));
    this.menu.addEventListener('mouseleave', (e) => this._handleMouseLeave(e));
 
    // Click toggle (for touch / keyboard users)
    this.btn.addEventListener('click', () => this.toggle());
 
    // Backdrop click closes
    this.backdrop.addEventListener('click', () => this.close());
 
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.btn.focus();
      }
    });
 
    // Sidebar hover
    this._bindSidebarHover();
  }
 
  _bindSidebarHover() {
    this.sideItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this._switchPanel(item.dataset.category);
      });
      // Keyboard: Enter or Space on sidebar button
      const btn = item.querySelector('.sidebar__btn');
      if (btn) {
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._switchPanel(item.dataset.category);
          }
        });
      }
    });
  }
 
  /* ------ OPEN / CLOSE / TOGGLE ------ */
  _scheduleOpen() {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => this.open(), 80);
  }
 
  _handleMouseLeave(e) {
    // Don't close if moving between trigger and menu
    const related = e.relatedTarget;
    if (this.trigger.contains(related) || this.menu.contains(related)) return;
    this.hoverTimer = setTimeout(() => this.close(), 150);
  }
 
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.trigger.classList.add('is-open');
    this.backdrop.classList.add('is-visible');
    this._updateAria();
    // inert remplace aria-hidden : bloque focus ET lecteurs d'écran quand fermé
    this.menu.removeAttribute('inert');
    this.menu.removeAttribute('aria-hidden');
  }
 
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.trigger.classList.remove('is-open');
    this.backdrop.classList.remove('is-visible');
    this._updateAria();
    // Déplacer le focus hors du menu avant d'appliquer inert
    if (this.menu.contains(document.activeElement)) {
      this.btn.focus();
    }
    this.menu.setAttribute('inert', '');
  }
 
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
 
  /* ------ PANEL SWITCH ------ */
  _switchPanel(categoryKey) {
    if (categoryKey === this.activeCategory) return;
    this.activeCategory = categoryKey;
 
    // Update sidebar active state
    this.sideItems.forEach(item => {
      const isActive = item.dataset.category === categoryKey;
      item.classList.toggle('active', isActive);
      const btn = item.querySelector('.sidebar__btn');
      if (btn) btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
 
    // Update content panels
    this.panels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === categoryKey);
    });
  }
 
  /* ------ ARIA ------ */
  _updateAria() {
    this.btn.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
    // inert gère tout : focus trap + masquage lecteur d'écran
    // aria-hidden n'est plus nécessaire (évite l'erreur console)
    if (!this.isOpen) {
      this.menu.setAttribute('inert', '');
    } else {
      this.menu.removeAttribute('inert');
    }
  }
}
 window.MegaMenu = MegaMenu;