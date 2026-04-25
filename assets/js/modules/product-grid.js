/**
 * ============================================================
 *  AVENA — ProductGrid Component
 *  assets/js/modules/product-grid.js
 *
 *  Composant réutilisable de grille produits (6 par ligne)
 *  ─────────────────────────────────────────────────────────
 *  USAGE :
 *    const grid = new ProductGrid('#product-grid-home', {
 *      source: 'mock',          // 'mock' | 'api'
 *      apiEndpoint: '/api/products',
 *      limit: 24,
 *      filters: { category: 'electronics' },
 *      personalized: false,     // active la reco par intérêt
 *    });
 *    grid.init();
 *
 *  RÉUTILISATION sur une autre page :
 *    const gridMarket = new ProductGrid('#marketplace-grid', {
 *      source: 'api',
 *      apiEndpoint: '/api/products',
 *      limit: 48,
 *    });
 *    gridMarket.init();
 *
 *  MIGRATION VERS EXPRESS + POSTGRES :
 *    Passe source: 'api' et apiEndpoint: '/api/products'
 *    Le reste est automatique — aucun changement dans ce fichier.
 * ============================================================
 */

'use strict';

/* ============================================================
   CONFIGURATION PAR DÉFAUT
   ============================================================ */
const GRID_DEFAULTS = {
  source:       'mock',                    // 'mock' | 'api'
  mockPath:     'data/mock/products.json', // chemin relatif depuis index.html
  apiEndpoint:  '/api/products',
  limit:        24,
  columns:      6,                         // cartes par ligne
  filters:      {},                        // { category, subcategory, tags[] }
  sort:         'default',                 // 'default' | 'price_asc' | 'price_desc' | 'rating'
  personalized: false,                     // reco par centre d'intérêt (voir section PERSONALISATION)
  currency:     'GHS',
};

/* ============================================================
   PRODUCT GRID CLASS
   ============================================================ */
class ProductGrid {
  /**
   * @param {string} selector  — CSS selector du conteneur parent dans le HTML
   * @param {object} options   — options qui écrasent GRID_DEFAULTS
   */
  constructor(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
      console.warn(`[ProductGrid] Conteneur "${selector}" introuvable.`);
      return;
    }
    this.options  = { ...GRID_DEFAULTS, ...options };
    this.products = [];        // données chargées
    this.filtered = [];        // données après filtrage/tri
  }

  /* ──────────────────────────────────────────────
     INIT — point d'entrée public
  ────────────────────────────────────────────── */
  async init() {
    this._renderSkeleton();
    try {
      this.products = await this._fetchProducts();
      this.filtered = this._applyFiltersAndSort(this.products);
      this._render(this.filtered);
    } catch (err) {
      this._renderError(err.message);
      console.error('[ProductGrid]', err);
    }
  }

  /* ──────────────────────────────────────────────
     DATA FETCHING
  ────────────────────────────────────────────── */
  async _fetchProducts() {
    if (this.options.source === 'api') {
      return this._fetchFromApi();
    }
    return this._fetchFromMock();
  }

  /**
   * Fetch mock JSON local (data/mock/products.json)
   * Sera remplacé par _fetchFromApi() une fois Express prêt
   */
  async _fetchFromMock() {
    const res = await fetch(this.options.mockPath);
    if (!res.ok) throw new Error(`Mock introuvable : ${this.options.mockPath}`);
    return res.json();
  }

  /**
   * Fetch API Express + PostgreSQL
   * Activé quand options.source === 'api'
   *
   * Express endpoint suggéré :
   *   GET /api/products?category=electronics&limit=24&sort=rating
   *
   *   app.get('/api/products', async (req, res) => {
   *     const { category, limit = 24, sort = 'created_at' } = req.query;
   *     const where = category ? `WHERE category = $1` : '';
   *     const params = category ? [category] : [];
   *     const result = await pool.query(
   *       `SELECT * FROM products ${where} ORDER BY ${sort} LIMIT $${params.length + 1}`,
   *       [...params, limit]
   *     );
   *     res.json(result.rows);
   *   });
   */
  async _fetchFromApi() {
    const params = new URLSearchParams();
    if (this.options.limit)              params.set('limit', this.options.limit);
    if (this.options.filters?.category)  params.set('category', this.options.filters.category);
    if (this.options.sort !== 'default') params.set('sort', this.options.sort);

    const url = `${this.options.apiEndpoint}?${params.toString()}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status} : ${url}`);
    return res.json();
  }

  /* ──────────────────────────────────────────────
     FILTRES & TRI (côté client pour le mock)
     En mode API, ces opérations se font côté Postgres
  ────────────────────────────────────────────── */
  _applyFiltersAndSort(products) {
    let list = [...products];

    // Filtre par catégorie
    if (this.options.filters?.category) {
      list = list.filter(p => p.category === this.options.filters.category);
    }

    // Filtre par tags (intersection)
    if (this.options.filters?.tags?.length) {
      list = list.filter(p =>
        this.options.filters.tags.some(t => p.tags?.includes(t))
      );
    }

    // Personnalisation par centres d'intérêt (voir section PERSONALISATION)
    if (this.options.personalized) {
      list = this._personalizeOrder(list);
    }

    // Tri
    switch (this.options.sort) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
      default: break; // ordre serveur
    }

    // Limite
    return list.slice(0, this.options.limit);
  }

  /* ──────────────────────────────────────────────
     PERSONALISATION PAR CENTRES D'INTÉRÊT
     ─────────────────────────────────────────────
     Cette fonctionnalité est DÉJÀ PRÊTE.
     Elle lit les catégories visitées depuis localStorage
     (écrit par ton module auth.js / storage.js quand
     l'utilisateur clique sur un produit).

     ACTIVATION :
       new ProductGrid('#grid', { personalized: true })

     QUAND LE BACKEND SERA PRÊT :
       Passe source: 'api' — l'endpoint Express retournera
       directement les produits triés par pertinence via
       une requête SQL avec JOIN sur user_interests.

     ÉCRITURE DES INTÉRÊTS (à placer dans product.js) :
       ProductGrid.trackInterest('electronics');
  ────────────────────────────────────────────── */
  _personalizeOrder(products) {
    const interests = ProductGrid.getInterests(); // ['electronics', 'school', ...]
    if (!interests.length) return products;

    return [...products].sort((a, b) => {
      const scoreA = a.tags?.filter(t => interests.includes(t)).length ?? 0;
      const scoreB = b.tags?.filter(t => interests.includes(t)).length ?? 0;
      return scoreB - scoreA; // plus de tags en commun = remonte
    });
  }

  /** Enregistre un intérêt utilisateur (appelle depuis product.js au clic) */
  static trackInterest(category) {
    const interests = ProductGrid.getInterests();
    if (!interests.includes(category)) {
      interests.unshift(category);
      localStorage.setItem('avena_interests', JSON.stringify(interests.slice(0, 10)));
    }
  }

  /** Lit les intérêts sauvegardés */
  static getInterests() {
    try {
      return JSON.parse(localStorage.getItem('avena_interests') ?? '[]');
    } catch { return []; }
  }

  /* ──────────────────────────────────────────────
     RENDER — SKELETON (loading)
  ────────────────────────────────────────────── */
  _renderSkeleton() {
    const count = Math.min(this.options.limit, 12);
    const skeletons = Array.from({ length: count }, () => `
      <div class="pg-card pg-card--skeleton">
        <div class="pg-card__img-wrap sk"></div>
        <div class="pg-card__body">
          <div class="sk sk--line sk--80"></div>
          <div class="sk sk--line sk--60"></div>
          <div class="sk sk--line sk--40"></div>
        </div>
      </div>`).join('');

    this.container.innerHTML = `
      <div class="pg-header">
        <div class="sk sk--title"></div>
      </div>
      <div class="pg-grid">${skeletons}</div>`;
  }

  /* ──────────────────────────────────────────────
     RENDER — GRILLE PRODUITS
  ────────────────────────────────────────────── */
  _render(products) {
    if (!products.length) {
      this.container.innerHTML = `
        <div class="pg-empty">
          <span class="pg-empty__icon">📦</span>
          <p>Aucun produit trouvé</p>
        </div>`;
      return;
    }

    const cards = products.map(p => this._buildCard(p)).join('');

    this.container.innerHTML = `
      <div class="pg-header">
        <h2 class="pg-title">Produits recommandés</h2>
        <div class="pg-controls">
          <select class="pg-sort" aria-label="Trier par">
            <option value="default">Pertinence</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="rating">Mieux notés</option>
          </select>
        </div>
      </div>
      <div class="pg-grid" role="list">${cards}</div>`;

    // Tri dynamique (côté client, mock uniquement)
    this.container.querySelector('.pg-sort')?.addEventListener('change', e => {
      this.options.sort = e.target.value;
      const sorted = this._applyFiltersAndSort(this.products);
      const grid   = this.container.querySelector('.pg-grid');
      grid.innerHTML = sorted.map(p => this._buildCard(p)).join('');
      this._bindCardEvents();
    });

    this._bindCardEvents();
  }

  /* ──────────────────────────────────────────────
     BUILD CARD HTML
  ────────────────────────────────────────────── */
  _buildCard(product) {
    const price     = this._formatPrice(product.price);
    const priceMax  = product.price_max ? `–&nbsp;${this._formatPrice(product.price_max)}` : '';
    const stars     = this._buildStars(product.rating);
    const verified  = product.verified
      ? `<span class="pg-badge pg-badge--verified">✔ Verified</span>`
      : '';
    const moq = product.moq
      ? `<p class="pg-moq">MOQ: <b>${product.moq}</b> ${product.moq_unit ?? ''}</p>`
      : '';
    const orders = product.orders
      ? `<span class="pg-orders">${product.orders} sold</span>`
      : '';

    return `
      <article class="pg-card" role="listitem" data-id="${product.id}" data-category="${product.category}">
        <div class="pg-card__img-wrap">
          <img
            class="pg-card__img"
            src="${product.image}"
            alt="${product.title}"
            loading="lazy"
            onerror="this.src='https://placehold.co/240x240/e8ecff/4361ee?text=No+Image'"
          />
          ${product.featured ? '<span class="pg-card__featured-badge">⚡ Featured</span>' : ''}
        </div>
        <div class="pg-card__body">
          <p class="pg-card__title">${product.title}</p>
          <p class="pg-card__price">
            <span class="pg-currency">${product.currency}</span>
            <span class="pg-amount">${price}${priceMax}</span>
          </p>
          <div class="pg-card__meta">
            <div class="pg-stars" aria-label="Note: ${product.rating}/5">${stars}</div>
            ${orders}
          </div>
          ${moq}
          <div class="pg-card__footer">
            <span class="pg-seller">${product.seller ?? ''}</span>
            ${verified}
          </div>
        </div>
      </article>`;
  }

  /* ──────────────────────────────────────────────
     CARD EVENTS — hover + clic
  ────────────────────────────────────────────── */
  _bindCardEvents() {
    this.container.querySelectorAll('.pg-card').forEach(card => {
      // Clic → track l'intérêt + navigation
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        const id       = card.dataset.id;
        ProductGrid.trackInterest(category); // enregistre l'intérêt
        // Navigation vers la page produit (à adapter à ton routing)
        // window.location.href = `/pages/product.html?id=${id}`;
        console.log(`[ProductGrid] Clic produit id=${id} category=${category}`);
      });
    });
  }

  /* ──────────────────────────────────────────────
     RENDER ERROR
  ────────────────────────────────────────────── */
  _renderError(msg) {
    this.container.innerHTML = `
      <div class="pg-error">
        <span class="pg-error__icon">⚠️</span>
        <p>Impossible de charger les produits</p>
        <small>${msg}</small>
      </div>`;
  }

  /* ──────────────────────────────────────────────
     HELPERS
  ────────────────────────────────────────────── */
  _formatPrice(n) {
    return Number(n).toLocaleString('fr-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  _buildStars(rating) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '★'.repeat(full) +
      (half ? '½' : '') +
      '☆'.repeat(empty)
    );
  }

  /* ──────────────────────────────────────────────
     API PUBLIQUE — filtrage externe
     (utilisé par le mega-menu ou une searchbar)
  ────────────────────────────────────────────── */

  /**
   * Recharge la grille avec de nouveaux filtres
   * @example  grid.filter({ category: 'electronics' })
   */
  async filter(newFilters = {}) {
    this.options.filters = { ...this.options.filters, ...newFilters };
    this._renderSkeleton();
    try {
      if (this.options.source === 'api') {
        this.products = await this._fetchFromApi();
      }
      this.filtered = this._applyFiltersAndSort(this.products);
      this._render(this.filtered);
    } catch (err) {
      this._renderError(err.message);
    }
  }

  /**
   * Recharge avec un terme de recherche
   * @example  grid.search('laptop')
   */
  search(term = '') {
    const t = term.toLowerCase().trim();
    if (!t) { this._render(this._applyFiltersAndSort(this.products)); return; }
    const results = this.products.filter(p =>
      p.title.toLowerCase().includes(t) ||
      p.tags?.some(tag => tag.includes(t))
    );
    this._render(results);
  }
}

/* ============================================================
   CSS — injecté dynamiquement (zéro fichier CSS supplémentaire)
   ============================================================ */
(function injectStyles() {
  if (document.getElementById('avena-pg-styles')) return;
  const style = document.createElement('style');
  style.id = 'avena-pg-styles';
  style.textContent = `
    /* ── Conteneur grille ── */
    .pg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
    margin: 50px;
}
    .pg-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1d2e;
    }
    .pg-sort {
      padding: 6px 12px;
      border: 1px solid #e4e7f0;
      border-radius: 8px;
      font-size: .83rem;
      color: #5c6080;
      background: #fff;
      cursor: pointer;
      outline: none;
    }
    .pg-sort:focus { border-color: #4361ee; }

    .pg-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 13px;
    margin: 53px;
}
    @media (max-width: 1200px) { .pg-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 860px)  { .pg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 560px)  { .pg-grid { grid-template-columns: repeat(2, 1fr); } }

    /* ── Card ── */
    .pg-card {
      background: #fff;
      border: 1px solid #e4e7f0;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 220ms cubic-bezier(.4,0,.2,1),
                  box-shadow 220ms cubic-bezier(.4,0,.2,1),
                  border-color 220ms;
      display: flex;
      flex-direction: column;
    }
    .pg-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 32px rgba(67,97,238,.15);
      border-color: #c7d0fa;
      z-index: 2;
    }

    /* ── Image ── */
    .pg-card__img-wrap {
      position: relative;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: #f7f8fc;
    }
    .pg-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 320ms cubic-bezier(.4,0,.2,1);
    }
    .pg-card:hover .pg-card__img {
      transform: scale(1.08);
    }
    .pg-card__featured-badge {
      position: absolute;
      top: 8px; left: 8px;
      background: #4361ee;
      color: #fff;
      font-size: .68rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 99px;
    }

    /* ── Body ── */
    .pg-card__body {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
    }
    .pg-card__title {
      font-size: .78rem;
      color: #1a1d2e;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pg-card__price {
      font-size: .83rem;
      color: #1a1d2e;
      font-weight: 600;
      margin-top: 2px;
    }
    .pg-currency { color: #5c6080; font-weight: 400; margin-right: 2px; font-size: .75rem; }
    .pg-amount   { color: #d94a00; }

    .pg-card__meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pg-stars   { color: #f5a623; font-size: .78rem; letter-spacing: 1px; }
    .pg-orders  { font-size: .72rem; color: #9499b5; }
    .pg-moq     { font-size: .72rem; color: #9499b5; }
    .pg-moq b   { color: #5c6080; }

    .pg-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-top: auto;
      flex-wrap: wrap;
    }
    .pg-seller { font-size: .7rem; color: #9499b5; }

    .pg-badge {
      font-size: .65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .pg-badge--verified {
      background: #e8fff0;
      color: #006633;
      border: 1px solid #b3e6cc;
    }

    /* ── Skeleton ── */
    .pg-card--skeleton { pointer-events: none; }
    .sk {
      background: linear-gradient(90deg, #f0f0f5 25%, #e4e7f0 50%, #f0f0f5 75%);
      background-size: 200% 100%;
      animation: sk-shimmer 1.4s infinite;
      border-radius: 6px;
    }
    .pg-card__img-wrap.sk { aspect-ratio: 1/1; }
    .sk--line   { height: 12px; margin: 4px 0; }
    .sk--80     { width: 80%; }
    .sk--60     { width: 60%; }
    .sk--40     { width: 40%; }
    .sk--title  { height: 22px; width: 200px; }
    @keyframes sk-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── Empty / Error ── */
    .pg-empty, .pg-error {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 24px;
      color: #9499b5;
    }
    .pg-empty__icon, .pg-error__icon { font-size: 2.5rem; display: block; margin-bottom: 8px; }
    .pg-error small { display: block; margin-top: 4px; font-size: .75rem; color: #c0c0d0; }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   EXPORT (si tu utilises des modules ES6 dans le futur)
   ============================================================ */
// export default ProductGrid;

/* ============================================================
   AUTO-INIT via attribut data (optionnel, pratique pour l'HTML statique)
   Usage HTML : <div id="product-grid-home" data-pg-source="mock" data-pg-limit="24"></div>
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-pg-source]').forEach(el => {
    const grid = new ProductGrid(`#${el.id}`, {
      source:       el.dataset.pgSource  ?? 'mock',
      limit:        Number(el.dataset.pgLimit)   || 24,
      personalized: el.dataset.pgPersonalized === 'true',
    });
    grid.init();

    // Expose l'instance sur l'élément pour accès externe
    // ex: document.querySelector('#product-grid-home')._grid.filter({category:'electronics'})
    el._grid = grid;
  });
});