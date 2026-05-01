/**
 * ============================================================
 *  AVENA — ProductGrid Component (API + Pagination)
 *  assets/js/modules/product-grid.js
 * ============================================================
 */

'use strict';

const GRID_DEFAULTS = {
  limit: 100,
  columns: 6,
  currentPage: 1,
  filters: {},
  personalization: true,
  currency: 'GHS',
};

class ProductGrid {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' 
      ? document.getElementById(containerId) 
      : containerId;
      
    if (!this.container) {
      console.warn(`[ProductGrid] Conteneur "${containerId}" introuvable.`);
      return;
    }
    
    this.options = { ...GRID_DEFAULTS, ...options };
    
    // Définir apiUrl dynamiquement à partir de la config
    const API_URL = window.APP_CONFIG?.API_URL || 'https://avena-backend-os8d.onrender.com';
    this.apiUrl = `${API_URL}/api/products/paginated`;
    
    this.products = [];
    this.totalPages = 1;
    this.currentPage = this.options.currentPage;
    this.isLoading = false;
    this.paginationContainer = document.getElementById('pagination-controls');
    
    this.init();
  }

  async init() {
    await this.loadProducts();
  }

  async loadProducts() {
    if (this.isLoading) return;
    this.isLoading = true;
    this._renderSkeleton();
    
    try {
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.options.limit,
        sort: 'created_at',
        order: 'DESC'
      });
      
      if (this.options.filters.category) {
        params.append('category', this.options.filters.category);
      }
      
      const url = `${this.apiUrl}?${params.toString()}`;
      const token = localStorage.getItem('avena_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Failed to load products');
      
      const data = await response.json();
      this.products = data.products;
      this.totalPages = data.totalPages || 1;
      this.currentPage = data.page || 1;
      
      this._render();
      this._renderPagination();
      
    } catch (error) {
      console.error('Error loading products:', error);
      this._renderError('Impossible de charger les produits');
    } finally {
      this.isLoading = false;
    }
  }

  _render() {
    if (!this.products.length) {
      this.container.innerHTML = `
        <div class="pg-empty">
          <span class="pg-empty__icon">📦</span>
          <p>Aucun produit disponible pour le moment.</p>
        </div>`;
      return;
    }
    
    const cards = this.products.map(product => this._buildCard(product)).join('');
    
    this.container.innerHTML = `
      <div class="pg-header">
        <h2 class="pg-title">Produits recommandés pour vous</h2>
        <div class="pg-controls">
          <select class="pg-sort" id="pg-sort">
            <option value="created_at">Nouveautés</option>
            <option value="price">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="views">Les plus vus</option>
            <option value="likes">Les plus aimés</option>
          </select>
        </div>
      </div>
      <div class="pg-grid" role="list">${cards}</div>
    `;
    
    // Gestion du tri
    const sortSelect = document.getElementById('pg-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const [sort, order] = e.target.value.split('_');
        this.currentPage = 1;
        this.loadProducts();
      });
    }
    
    this._bindEvents();
  }

  _buildCard(product) {
    const price = Number(product.price).toLocaleString('en-GH', { minimumFractionDigits: 2 });
    const stars = this._buildStars(product.rating || 0);
    const hasImage = product.cover_image && product.cover_image.startsWith('http');
    const views = product.views || 0;
    const likes = product.likes || 0;
    
    return `
      <article class="pg-card" data-id="${product.id}" data-category="${product.category}">
        <div class="pg-card__img-wrap">
          ${hasImage 
            ? `<img class="pg-card__img" src="${product.cover_image}" alt="${this._escapeHtml(product.title)}" loading="lazy"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="pg-card__placeholder" style="display:none">${this._escapeHtml(product.title)}</div>`
            : `<div class="pg-card__placeholder" style="display:flex;align-items:center;justify-content:center;height:100%;background:#f7f8fc;font-weight:bold;font-size:0.9rem;text-align:center;padding:10px;">${this._escapeHtml(product.title)}</div>`
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
            <span class="pg-seller">${product.first_name || 'Vendeur'} ${product.last_name || ''}</span>
          </div>
        </div>
      </article>`;
  }

  _renderPagination() {
    if (!this.paginationContainer) return;
    
    if (this.totalPages <= 1) {
      this.paginationContainer.innerHTML = '';
      return;
    }
    
    let html = '<button class="pg-page-btn" data-page="prev" ' + (this.currentPage === 1 ? 'disabled' : '') + '>«</button>';
    
    const maxVisible = 7;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
      html += `<button class="pg-page-btn" data-page="1">1</button>`;
      if (startPage > 2) html += `<span class="pg-dots">...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pg-page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) html += `<span class="pg-dots">...</span>`;
      html += `<button class="pg-page-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
    }
    
    html += '<button class="pg-page-btn" data-page="next" ' + (this.currentPage === this.totalPages ? 'disabled' : '') + '>»</button>';
    
    this.paginationContainer.innerHTML = html;
    
    this.paginationContainer.querySelectorAll('.pg-page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const page = btn.dataset.page;
        if (page === 'prev') this.goToPage(this.currentPage - 1);
        else if (page === 'next') this.goToPage(this.currentPage + 1);
        else this.goToPage(parseInt(page));
      });
    });
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _bindEvents() {
    this.container.querySelectorAll('.pg-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.dataset.id;
        const category = card.dataset.category;
        ProductGrid.trackInterest(category);
        window.location.href = `/pages/product.html?id=${id}`;
      });
    });
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
    
    this.container.innerHTML = `<div class="pg-grid">${skeletons}</div>`;
  }

  _renderError(msg) {
    this.container.innerHTML = `
      <div class="pg-error">
        <span class="pg-error__icon">⚠️</span>
        <p>${msg}</p>
      </div>`;
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

  static trackInterest(category) {
    let interests = JSON.parse(localStorage.getItem('avena_interests') || '[]');
    if (!interests.includes(category)) {
      interests.unshift(category);
      localStorage.setItem('avena_interests', JSON.stringify(interests.slice(0, 10)));
    }
  }

  filter(newFilters) {
    this.options.filters = { ...this.options.filters, ...newFilters };
    this.currentPage = 1;
    this.loadProducts();
  }

  search(term) {
    this.options.filters.search = term;
    this.currentPage = 1;
    this.loadProducts();
  }
}

// Styles injectés
(function injectStyles() {
  if (document.getElementById('avena-pg-styles')) return;
  const style = document.createElement('style');
  style.id = 'avena-pg-styles';
  style.textContent = `
    .pg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; margin: 20px 50px; flex-wrap: wrap; }
    .pg-title { font-size: 1.2rem; font-weight: 700; color: #1a1d2e; }
    .pg-sort { padding: 8px 16px; border: 1px solid #e4e7f0; border-radius: 8px; background: #fff; cursor: pointer; }
    .pg-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin: 20px 50px; }
    @media (max-width: 1200px) { .pg-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 860px) { .pg-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 560px) { .pg-grid { grid-template-columns: repeat(2, 1fr); } }
    
    .pg-card { background: #fff; border: 1px solid #e4e7f0; border-radius: 10px; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
    .pg-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(67,97,238,0.15); border-color: #c7d0fa; }
    .pg-card__img-wrap { position: relative; aspect-ratio: 1 / 1; overflow: hidden; background: #f7f8fc; display: flex; align-items: center; justify-content: center; }
    .pg-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .pg-card:hover .pg-card__img { transform: scale(1.05); }
    .pg-card__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: bold; padding: 16px; color: #4361ee; }
    .pg-card__body { padding: 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .pg-card__title { font-size: 0.85rem; font-weight: 500; color: #1a1d2e; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .pg-card__price { font-size: 1rem; font-weight: 700; color: #d94a00; }
    .pg-card__meta { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; color: #9499b5; }
    .pg-stars { color: #f5a623; letter-spacing: 1px; }
    .pg-card__footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e4e7f0; font-size: 0.7rem; color: #9499b5; }
    
    .pagination-container { display: flex; justify-content: center; gap: 8px; margin: 40px 0; flex-wrap: wrap; }
    .pg-page-btn { padding: 8px 14px; border: 1px solid #e4e7f0; background: #fff; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: 500; }
    .pg-page-btn:hover:not(:disabled) { background: #4361ee; color: #fff; border-color: #4361ee; }
    .pg-page-btn.active { background: #4361ee; color: #fff; border-color: #4361ee; }
    .pg-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pg-dots { padding: 0 4px; color: #9499b5; }
    
    .sk { background: linear-gradient(90deg, #f0f0f5 25%, #e4e7f0 50%, #f0f0f5 75%); background-size: 200% 100%; animation: sk-shimmer 1.4s infinite; border-radius: 6px; }
    .pg-card__img-wrap.sk { aspect-ratio: 1/1; }
    .sk--line { height: 12px; margin: 4px 0; }
    .sk--80 { width: 80%; }
    .sk--60 { width: 60%; }
    .sk--40 { width: 40%; }
    @keyframes sk-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    
    .pg-empty, .pg-error { text-align: center; padding: 60px; color: #9499b5; grid-column: 1/-1; }
    .pg-empty__icon, .pg-error__icon { font-size: 2.5rem; display: block; margin-bottom: 8px; }
  `;
  document.head.appendChild(style);
})();

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-grid-home');
  if (container) {
    const limit = parseInt(container.dataset.pgLimit) || 100;
    new ProductGrid('product-grid-home', { limit });
  }
});