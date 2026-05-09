/**
 * ============================================================
 *  AVENA — CategoryProductGrid Component
 *  assets/js/modules/category-product-grid.js
 *  Version dédiée à category.html (avec export ES6)
 * ============================================================
 */

'use strict';

const GRID_DEFAULTS = {
  limit: 12,
  columns: 4,
  currentPage: 1,
  filters: {},
  currency: 'GHS',
  autoLoad: true,
};

export class CategoryProductGrid {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' 
      ? document.getElementById(containerId) 
      : containerId;
      
    if (!this.container) {
      console.warn(`[CategoryProductGrid] Conteneur "${containerId}" introuvable.`);
      return;
    }
    
    this.options = { ...GRID_DEFAULTS, ...options };
    
    const API_URL = window.APP_CONFIG?.API_URL || 'https://avena-backend-os8d.onrender.com';
    this.apiUrl = `${API_URL}/api/products/paginated`;
    
    this.products = [];
    this.totalPages = 1;
    this.currentPage = this.options.currentPage;
    this.isLoading = false;
    this.autoLoadDisabled = !this.options.autoLoad;
    this.paginationContainer = null;
    this.onProductClick = null;
    
    this.init();
  }

  async init() {
    this._injectStyles();
    if (!this.autoLoadDisabled) {
      await this.loadProducts();
    }
  }

  async loadProducts(customParams = {}) {
    if (this.isLoading) return;
    this.isLoading = true;
    this._renderSkeleton();
    
    try {
      const params = this._buildParams(customParams);
      const url = `${this.apiUrl}?${params.toString()}`;
      
      const response = await fetch(url, { headers: this._getHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this._processResponse(data);
      
    } catch (error) {
      console.error('[CategoryProductGrid] Error:', error);
      this._renderError('Impossible de charger les produits');
    } finally {
      this.isLoading = false;
    }
  }

  updateProducts(products, pagination = {}) {
    this.products = products || [];
    this.totalPages = pagination.totalPages || 1;
    this.currentPage = pagination.currentPage || 1;
    this._render();
  }

  setApiUrl(url) {
    this.apiUrl = url;
  }

  setPaginationContainer(containerId) {
    this.paginationContainer = document.getElementById(containerId);
  }

  disableAutoLoad() {
    this.autoLoadDisabled = true;
  }

  _buildParams(customParams = {}) {
    const params = new URLSearchParams({
      page: this.currentPage,
      limit: this.options.limit,
      sort: 'created_at',
      order: 'DESC'
    });
    
    if (this.options.filters.category) {
      params.append('category', this.options.filters.category);
    }
    
    Object.entries(customParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.append(key, value);
    });
    
    return params;
  }

  _getHeaders() {
    const token = localStorage.getItem('avena_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  _processResponse(data) {
    this.products = data.products || [];
    this.totalPages = data.totalPages || 1;
    this.currentPage = data.currentPage || 1;
    this._render();
  }

  _render() {
    if (!this.products.length) {
      this._renderEmpty();
      return;
    }
    
    const cards = this.products.map(product => this._buildCard(product)).join('');
    
    this.container.innerHTML = `
      <div class="pg-grid" role="list" style="grid-template-columns: repeat(${this.options.columns}, 1fr);">
        ${cards}
      </div>
    `;
    
    this._bindCardEvents();
  }

  _buildCard(product) {
    const price = Number(product.price).toLocaleString('en-GH', { minimumFractionDigits: 2 });
    const stars = this._buildStars(product.rating || 0);
    const hasImage = product.cover_image && product.cover_image.startsWith('http');
    const views = product.views || 0;
    const likes = product.likes || 0;
    const sellerName = product.first_name || product.seller?.name || 'Vendeur';
    
    return `
      <article class="pg-card" data-id="${product.id}" data-category="${product.category}">
        <div class="pg-card__img-wrap">
          ${hasImage 
            ? `<img class="pg-card__img" src="${product.cover_image}" alt="${this._escapeHtml(product.title)}" loading="lazy"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="pg-card__placeholder" style="display:none">${this._escapeHtml(product.title)}</div>`
            : `<div class="pg-card__placeholder">${this._escapeHtml(product.title)}</div>`
          }
        </div>
        <div class="pg-card__body">
          <p class="pg-card__title">${this._escapeHtml(product.title.substring(0, 60))}${product.title.length > 60 ? '...' : ''}</p>
          <p class="pg-card__price">GHS ${price}</p>
          <div class="pg-card__meta">
            <div class="pg-stars">${stars}</div>
            <span class="pg-views">👁️ ${views}</span>
            <span class="pg-likes">❤️ ${likes}</span>
          </div>
          <div class="pg-card__footer">
            <span class="pg-seller">${this._escapeHtml(sellerName)}</span>
          </div>
        </div>
      </article>`;
  }

  _renderEmpty() {
    this.container.innerHTML = `
      <div class="pg-empty">
        <span class="pg-empty__icon">📦</span>
        <p>Aucun produit disponible pour le moment.</p>
      </div>`;
  }

  _renderError(msg) {
    this.container.innerHTML = `
      <div class="pg-error">
        <span class="pg-error__icon">⚠️</span>
        <p>${msg}</p>
      </div>`;
  }

  _renderSkeleton() {
    const skeletons = Array.from({ length: Math.min(this.options.limit, 12) }, () => `
      <div class="pg-card pg-card--skeleton">
        <div class="pg-card__img-wrap sk"></div>
        <div class="pg-card__body">
          <div class="sk sk--line sk--80"></div>
          <div class="sk sk--line sk--60"></div>
          <div class="sk sk--line sk--40"></div>
        </div>
      </div>`).join('');
    
    this.container.innerHTML = `<div class="pg-grid" style="grid-template-columns: repeat(${this.options.columns}, 1fr);">${skeletons}</div>`;
  }

  _bindCardEvents() {
    this.container.querySelectorAll('.pg-card').forEach(card => {
      const clonedCard = card.cloneNode(true);
      card.parentNode?.replaceChild(clonedCard, card);
      
      clonedCard.addEventListener('click', () => {
        const id = clonedCard.dataset.id;
        if (id && this.onProductClick) {
          this.onProductClick(id);
        }
      });
    });
  }

  _buildStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  _injectStyles() {
    if (document.getElementById('avena-category-pg-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'avena-category-pg-styles';
    style.textContent = `
      .pg-grid { display: grid; gap: 20px; margin-bottom: 20px; }
      @media (max-width: 1200px) { .pg-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      @media (max-width: 860px) { .pg-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      @media (max-width: 560px) { .pg-grid { grid-template-columns: repeat(1, 1fr) !important; } }
      
      .pg-card { background: #fff; border: 1px solid #e4e7f0; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
      .pg-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(67,97,238,0.15); }
      .pg-card__img-wrap { aspect-ratio: 1/1; overflow: hidden; background: #f7f8fc; display: flex; align-items: center; justify-content: center; }
      .pg-card__img { width: 100%; height: 100%; object-fit: cover; }
      .pg-card__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: bold; padding: 16px; color: #4361ee; font-size: 0.85rem; }
      .pg-card__body { padding: 12px; }
      .pg-card__title { font-size: 0.85rem; font-weight: 500; color: #1a1d2e; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .pg-card__price { font-size: 1rem; font-weight: 700; color: #d94a00; margin-bottom: 6px; }
      .pg-card__meta { display: flex; align-items: center; gap: 12px; font-size: 0.7rem; color: #9499b5; margin-bottom: 8px; }
      .pg-stars { color: #f5a623; }
      .pg-card__footer { padding-top: 8px; border-top: 1px solid #e4e7f0; font-size: 0.7rem; color: #9499b5; }
      
      .sk { background: linear-gradient(90deg, #f0f0f5 25%, #e4e7f0 50%, #f0f0f5 75%); background-size: 200% 100%; animation: sk-shimmer 1.4s infinite; border-radius: 6px; }
      .sk--line { height: 12px; margin: 6px 0; border-radius: 4px; }
      .sk--80 { width: 80%; }
      .sk--60 { width: 60%; }
      .sk--40 { width: 40%; }
      @keyframes sk-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      
      .pg-empty, .pg-error { text-align: center; padding: 60px 20px; color: #9499b5; background: #f8f9fc; border-radius: 16px; }
      .pg-empty__icon, .pg-error__icon { font-size: 3rem; display: block; margin-bottom: 16px; }
    `;
    document.head.appendChild(style);
  }
}