/**
 * AVENA — Category Page Controller
 * assets/js/pages/category.js
 */

import { CategoryProductGrid } from '../modules/category-product-grid.js';

export class CategoryPage {
    constructor(options) {
        this.categoryKey = options.categoryKey;
        this.subcategory = options.subcategory || null;
        this.productGridContainerId = options.productGridContainerId;
        this.paginationContainerId = options.paginationContainerId;
        
        this.currentFilters = {
            priceRange: null,
            popular: [],
            dynamic: {}
        };
        this.currentPage = 1;
        this.sortBy = 'newest';
        this.productGrid = null;
        this.filterSchema = null;
        
        const API_URL = window.APP_CONFIG?.API_URL || 'https://avena-backend-os8d.onrender.com';
        this.apiUrl = API_URL;
    }

    async init() {
        await this.loadCategoryInfo();
        await this.loadFilterSchema();
        this.attachEventListeners();
        this.initProductGrid();
        await this.loadProducts();
    }

    async fetchJSON(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    }

    async loadCategoryInfo() {
        try {
            const url = `${this.apiUrl}/api/categories/${this.categoryKey}/details?sub=${this.subcategory || ''}`;
            const data = await this.fetchJSON(url);
            
            if (data.ok) {
                const category = data.category;
                document.getElementById('categoryTitle').textContent = category.label;
                document.getElementById('categoryIcon').textContent = category.emoji || '💻';
                document.getElementById('productCount').textContent = category.productCount || 0;
            }
        } catch (error) {
            console.error('Error loading category info:', error);
            document.getElementById('categoryTitle').textContent = this.categoryKey;
        }
    }

    async loadFilterSchema() {
        try {
            const url = `${this.apiUrl}/api/categories/${this.categoryKey}/filters/schema?sub=${this.subcategory || ''}`;
            const data = await this.fetchJSON(url);
            
            if (data.ok) {
                this.filterSchema = data.schema;
                this.renderFilters();
            }
        } catch (error) {
            console.error('Error loading filter schema:', error);
        }
    }

    renderFilters() {
        if (!this.filterSchema) return;
        
        if (this.filterSchema.priceRanges) {
            this.renderPriceRanges(this.filterSchema.priceRanges);
        }
        
        if (this.filterSchema.popularFilters && this.filterSchema.popularFilters.length > 0) {
            this.renderPopularFilters(this.filterSchema.popularFilters);
        } else {
            const popularContainer = document.getElementById('popularFiltersContainer');
            if (popularContainer) {
                popularContainer.innerHTML = '<div class="no-options">No popular filters available</div>';
            }
        }
        
        if (this.filterSchema.dynamicFilters && this.filterSchema.dynamicFilters.length > 0) {
            this.renderDynamicFilters(this.filterSchema.dynamicFilters);
        }
    }

    renderPriceRanges(ranges) {
        const container = document.getElementById('priceRangesContainer');
        if (!container) return;
        
        container.innerHTML = ranges.map(range => `
            <label class="price-range">
                <input type="radio" name="price" value="${range.min}-${range.max === null ? 'plus' : range.max}">
                <span>${range.label}</span>
                <span class="count">(0)</span>
            </label>
        `).join('');
        
        container.querySelectorAll('input[name="price"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentFilters.priceRange = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        });
    }

    renderPopularFilters(filters) {
        const container = document.getElementById('popularFiltersContainer');
        if (!container) return;
        
        container.innerHTML = filters.map(filter => `
            <label class="popular-filter">
                <input type="checkbox" data-filter-key="${filter.filter_key}" value="${filter.filter_key}">
                <span>${filter.filter_label}</span>
                <span class="count">(0)</span>
            </label>
        `).join('');
        
        container.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                if (e.target.checked) {
                    if (!this.currentFilters.popular.includes(value)) {
                        this.currentFilters.popular.push(value);
                    }
                } else {
                    this.currentFilters.popular = this.currentFilters.popular.filter(v => v !== value);
                }
                this.currentPage = 1;
                this.loadProducts();
            });
        });
    }

    renderDynamicFilters(filters) {
        const container = document.getElementById('dynamicFiltersContainer');
        if (!container) return;
        
        container.innerHTML = filters.map(filter => `
            <div class="filter-section" data-filter="${filter.key}">
                <div class="filter-header">
                    <h4>${filter.label}</h4>
                    <button class="filter-toggle" data-toggle="${filter.key}">−</button>
                </div>
                <div class="filter-content" id="filter-${filter.key}">
                    <div class="loading">Loading options...</div>
                </div>
            </div>
        `).join('');
        
        filters.forEach(filter => {
            this.loadFilterOptions(filter.key);
            
            const toggleBtn = document.querySelector(`.filter-toggle[data-toggle="${filter.key}"]`);
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const content = document.getElementById(`filter-${filter.key}`);
                    content.classList.toggle('collapsed');
                    toggleBtn.textContent = content.classList.contains('collapsed') ? '+' : '−';
                });
            }
        });
    }

    async loadFilterOptions(filterKey) {
        try {
            const url = `${this.apiUrl}/api/categories/${this.categoryKey}/filters/options/${filterKey}?sub=${this.subcategory || ''}`;
            const data = await this.fetchJSON(url);
            
            const container = document.getElementById(`filter-${filterKey}`);
            if (!container) return;
            
            if (!data.ok || data.options.length === 0) {
                container.innerHTML = '<div class="no-options">No options available</div>';
                return;
            }
            
            container.innerHTML = data.options.map(opt => `
                <label class="filter-option">
                    <input type="checkbox" data-dynamic-filter="${filterKey}" value="${opt.value}">
                    <span>${opt.label}</span>
                    <span class="count">(${opt.count})</span>
                </label>
            `).join('');
            
            container.querySelectorAll('input[data-dynamic-filter]').forEach(input => {
                input.addEventListener('change', (e) => {
                    const filterKey = e.target.getAttribute('data-dynamic-filter');
                    const value = e.target.value;
                    
                    if (!this.currentFilters.dynamic[filterKey]) {
                        this.currentFilters.dynamic[filterKey] = [];
                    }
                    
                    if (e.target.checked) {
                        if (!this.currentFilters.dynamic[filterKey].includes(value)) {
                            this.currentFilters.dynamic[filterKey].push(value);
                        }
                    } else {
                        this.currentFilters.dynamic[filterKey] = this.currentFilters.dynamic[filterKey].filter(v => v !== value);
                    }
                    
                    this.currentPage = 1;
                    this.loadProducts();
                });
            });
            
        } catch (error) {
            console.error(`Error loading options for ${filterKey}:`, error);
            const container = document.getElementById(`filter-${filterKey}`);
            if (container) {
                container.innerHTML = '<div class="no-options">Failed to load options</div>';
            }
        }
    }

    initProductGrid() {
        const container = document.getElementById(this.productGridContainerId);
        if (!container) return;
        
        // Créer le conteneur temporaire
        let tempContainer = document.getElementById('temp-product-grid');
        if (!tempContainer) {
            tempContainer = document.createElement('div');
            tempContainer.id = 'temp-product-grid';
            container.appendChild(tempContainer);
        }
        
        // Créer la grille avec autoLoad désactivé
        this.productGrid = new CategoryProductGrid('temp-product-grid', {
            limit: 12,
            filters: { category: this.categoryKey },
            autoLoad: false
        });
        
        // Configurer l'API personnalisée
        this.productGrid.setApiUrl(`${this.apiUrl}/api/products/category/${this.categoryKey}/filtered`);
        
        // Configurer le callback de clic
        this.productGrid.onProductClick = (id) => {
            window.location.href = `/pages/product.html?id=${id}`;
        };
        
        // Surcharger loadProducts avec notre méthode
        const self = this;
        this.productGrid.loadProducts = async function() {
            await self.loadProducts();
        };
    }

    async loadProducts() {
        if (!this.productGrid) return;
        
        this.productGrid.isLoading = true;
        this.productGrid._renderSkeleton();
        
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 12,
                sort: this.sortBy
            });
            
            if (this.subcategory) {
                params.append('sub', this.subcategory);
            }
            
            if (this.currentFilters.priceRange) {
                params.append('priceRange', this.currentFilters.priceRange);
            }
            
            if (this.currentFilters.popular.length > 0) {
                params.append('popularFilters', JSON.stringify(this.currentFilters.popular));
            }
            
            if (Object.keys(this.currentFilters.dynamic).length > 0) {
                params.append('dynamicFilters', JSON.stringify(this.currentFilters.dynamic));
            }
            
            const url = `${this.apiUrl}/api/products/category/${this.categoryKey}/filtered?${params.toString()}`;
            console.log('Fetching:', url);
            
            const data = await this.fetchJSON(url);
            console.log('Response:', data);
            
            if (data.ok) {
                if (data.products && data.products.length > 0) {
                    this.productGrid.updateProducts(data.products, {
                        currentPage: data.currentPage,
                        totalPages: data.totalPages,
                        totalItems: data.total
                    });
                    this.renderCustomPagination(data);
                    document.getElementById('productCount').textContent = data.total || 0;
                } else {
                    // Aucun produit trouvé
                    const tempContainer = document.getElementById('temp-product-grid');
                    if (tempContainer) {
                        tempContainer.innerHTML = `
                            <div class="pg-empty">
                                <span class="pg-empty__icon">📦</span>
                                <p>Aucun produit disponible pour "${this.subcategory || this.categoryKey}".</p>
                                <p class="pg-empty__sub">Essayez de modifier vos filtres.</p>
                            </div>`;
                    }
                    this.renderCustomPagination({ totalPages: 1, currentPage: 1 });
                    document.getElementById('productCount').textContent = '0';
                }
            } else {
                throw new Error(data.error || 'Unknown error');
            }
            
        } catch (error) {
            console.error('Error loading products:', error);
            const tempContainer = document.getElementById('temp-product-grid');
            if (tempContainer) {
                tempContainer.innerHTML = `
                    <div class="pg-error">
                        <span class="pg-error__icon">⚠️</span>
                        <p>Failed to load products: ${error.message}</p>
                        <button class="pg-retry-btn" onclick="location.reload()">Réessayer</button>
                    </div>`;
            }
        } finally {
            this.productGrid.isLoading = false;
        }
    }

    renderCustomPagination(data) {
        const container = document.getElementById(this.paginationContainerId);
        if (!container) return;
        
        if (data.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination-controls">';
        
        if (data.currentPage > 1) {
            html += `<button class="page-btn" data-page="${data.currentPage - 1}">← Précédent</button>`;
        }
        
        const startPage = Math.max(1, data.currentPage - 2);
        const endPage = Math.min(data.totalPages, data.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === data.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (data.currentPage < data.totalPages) {
            html += `<button class="page-btn" data-page="${data.currentPage + 1}">Suivant →</button>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPage = parseInt(btn.dataset.page);
                this.loadProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    attachEventListeners() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }
        
        const clearBtn = document.getElementById('clearAllFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.currentFilters = {
                    priceRange: null,
                    popular: [],
                    dynamic: {}
                };
                
                document.querySelectorAll('.filter-section input[type="checkbox"], .filter-section input[type="radio"]').forEach(input => {
                    input.checked = false;
                });
                
                this.currentPage = 1;
                this.loadProducts();
            });
        }
        
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = btn.dataset.view;
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const gridContainer = document.getElementById('temp-product-grid');
                if (gridContainer) {
                    if (view === 'list') {
                        gridContainer.classList.add('list-view');
                    } else {
                        gridContainer.classList.remove('list-view');
                    }
                }
            });
        });
        
        document.querySelectorAll('.filter-section .filter-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-toggle')) return;
                const toggle = header.querySelector('.filter-toggle');
                const content = header.parentElement.querySelector('.filter-content');
                if (content) {
                    content.classList.toggle('collapsed');
                    if (toggle) {
                        toggle.textContent = content.classList.contains('collapsed') ? '+' : '−';
                    }
                }
            });
        });
    }
}