/**
 * AVENA — Promo Grid Component
 * assets/js/components/avenna-promo-grid.js
 */

'use strict';

const DEFAULT_IMAGE = 'https://placehold.co/800x1000/f0f2f5/4361ee?text=Image';
const DEFAULT_SIDE_IMAGE = 'https://placehold.co/600x800/f0f2f5/4361ee?text=Promo';
const DEFAULT_CIRCLE_IMAGE = 'https://placehold.co/200/f0f2f5/4361ee?text=Category';

class AvennaPromoGrid extends HTMLElement {
  static get observedAttributes() {
    return ['data-config'];
  }

  constructor() {
    super();
    this._carouselInterval = null;
    this._currentIndex = 0;
    this._config = {
      leftFrames: [],
      rightFrames: [],
      carouselImages: [],
      circles: [],
      interval: 3000
    };
  }

  connectedCallback() {
    this._loadConfig();
    this._render();
    this._initCarousel();
    this._bindEvents();
  }

  disconnectedCallback() {
    this._stopCarousel();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-config' && newValue) {
      try {
        const userConfig = JSON.parse(newValue);
        this._config = { ...this._config, ...userConfig };
        this._render();
        this._initCarousel();
        this._bindEvents();
      } catch (e) {
        console.error('[PromoGrid] Invalid config JSON', e);
      }
    }
  }

  _loadConfig() {
    const configAttr = this.getAttribute('data-config');
    if (configAttr) {
      try {
        const userConfig = JSON.parse(configAttr);
        this._config = { ...this._config, ...userConfig };
      } catch (e) {
        console.error('[PromoGrid] Invalid config JSON', e);
      }
    }
  }

  _render() {
    this.innerHTML = `
      <div class="avenna-promo-grid">
        <div class="promo-grid-main">
          <div class="promo-col promo-col-left">
            ${(this._config.leftFrames || []).map(frame => this._renderSideCard(frame)).join('')}
          </div>
          
          <div class="promo-center-card" data-carousel>
            <div class="carousel-container">
              ${(this._config.carouselImages || []).map((img, idx) => `
                <div class="carousel-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}" data-link="${img.link || ''}">
                  <img src="${img.image || DEFAULT_IMAGE}" alt="${img.title || ''}" loading="lazy">
                  <div class="carousel-content">
                    <div class="carousel-tag">${img.tag || ''}</div>
                    <div class="carousel-title">${img.title || ''}</div>
                    <div class="carousel-price">${img.price || ''}</div>
                    <span class="carousel-btn">Shop Now →</span>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="carousel-dots">
              ${(this._config.carouselImages || []).map((_, idx) => `
                <span class="carousel-dot ${idx === 0 ? 'active' : ''}" data-dot="${idx}"></span>
              `).join('')}
            </div>
          </div>
          
          <div class="promo-col promo-col-right">
            ${(this._config.rightFrames || []).map(frame => this._renderSideCard(frame)).join('')}
          </div>
        </div>
        
        <div class="promo-circles">
          <h3 class="promo-circles-title">Shop by Category</h3>
          <div class="promo-circles-grid">
            ${(this._config.circles || []).map(circle => `
              <div class="promo-circle-card" data-circle-category="${circle.category || ''}">
                <div class="circle">
                  <img src="${circle.image || DEFAULT_CIRCLE_IMAGE}" alt="${circle.title || ''}" loading="lazy">
                </div>
                <div class="circle-title">${circle.title || ''}</div>
                <div class="circle-subtitle">${circle.subtitle || ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  _renderSideCard(frame) {
    return `
      <div class="promo-side-card" data-category="${frame.category || ''}">
        <img src="${frame.image || DEFAULT_SIDE_IMAGE}" alt="${frame.title || ''}" loading="lazy">
        <div class="overlay">
          <div class="tag">${frame.tag || ''}</div>
          <div class="title">${frame.title || ''}</div>
          ${frame.price ? `<div class="price">${frame.price}</div>` : ''}
        </div>
      </div>
    `;
  }

  _initCarousel() {
    this._stopCarousel();
    
    const slides = this.querySelectorAll('.carousel-slide');
    const dots = this.querySelectorAll('.carousel-dot');
    
    if (slides.length === 0) return;
    
    this._carouselInterval = setInterval(() => {
      this._currentIndex = (this._currentIndex + 1) % slides.length;
      this._showSlide(this._currentIndex, slides, dots);
    }, this._config.interval || 3000);
  }

  _showSlide(index, slides, dots) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  _stopCarousel() {
    if (this._carouselInterval) {
      clearInterval(this._carouselInterval);
      this._carouselInterval = null;
    }
  }

  _bindEvents() {
    // Frames latérales
    this.querySelectorAll('.promo-side-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = card.dataset.category;
        if (category) {
          window.location.href = `/pages/category.html?cat=${category}`;
        }
      });
    });
    
    // Carousel central
    const carousel = this.querySelector('[data-carousel]');
    if (carousel) {
      carousel.addEventListener('click', (e) => {
        if (e.target.closest('.carousel-dot')) return;
        const activeSlide = this.querySelector('.carousel-slide.active');
        const link = activeSlide?.dataset?.link;
        if (link) {
          window.location.href = `/pages/category.html?cat=${link}`;
        }
      });
    }
    
    // Dots
    this.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(dot.dataset.dot);
        if (!isNaN(index)) {
          this._currentIndex = index;
          const slides = this.querySelectorAll('.carousel-slide');
          const dots = this.querySelectorAll('.carousel-dot');
          this._showSlide(index, slides, dots);
          this._stopCarousel();
          this._initCarousel();
        }
      });
    });
    
    // Cercles
    this.querySelectorAll('.promo-circle-card').forEach(circle => {
      circle.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = circle.dataset.circleCategory;
        if (category) {
          window.location.href = `/pages/category.html?cat=${category}`;
        }
      });
    });
  }
}

customElements.define('avenna-promo-grid', AvennaPromoGrid);
export default AvennaPromoGrid;