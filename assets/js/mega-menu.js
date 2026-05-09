/**
 * ============================================================
 *  AVENA — MEGA MENU CONTROLLER (English version)
 * ============================================================
 */
 
'use strict';
 
async function loadCategories() {
  return MOCK_CATEGORIES;
}
 
const MOCK_CATEGORIES = {
  school: {
    id: 'school',
    label: 'School Features',
    emoji: '🎓',
    featured: { tag: '🔥 Back to School 2025', text: 'Complete kits from', price: '15 GHS' },
    groups: [
      { title: 'Supplies', links: [
        { label: 'Notebooks & Binders',   href: null, image: null },
        { label: 'Pens & Pencils',        href: null, image: null },
        { label: 'Calculators',           href: null, image: null },
        { label: 'Rulers & Geometry',     href: null, image: null },
        { label: 'Sticky Notes & Highlighters', href: null, image: null },
      ]},
      { title: 'Bags & Transport', links: [
        { label: 'Backpacks',        href: null, image: null },
        { label: 'School Bags',      href: null, image: null },
        { label: 'Pencil Cases',     href: null, image: null },
        { label: 'Document Holders', href: null, image: null },
      ]},
      { title: 'Books & Docs', links: [
        { label: 'Textbooks',    href: null, image: null },
        { label: 'Dictionaries', href: null, image: null },
        { label: 'Planners & Agendas', href: null, image: null },
        { label: 'Flashcards',   href: null, image: null },
      ]},
      { title: 'Printing', links: [
        { label: 'Course Printing', href: null, image: null },
        { label: 'Thesis Binding',  href: null, image: null },
        { label: 'A4 Paper',        href: null, image: null },
      ]},
    ]
  },
  electronics: {
    id: 'electronics',
    label: 'Electronics',
    emoji: '💻',
    featured: { tag: '⚡ Best Seller', text: 'Student Laptops from', price: '800 GHS' },
    groups: [
      { title: 'Computers', links: [
        { label: 'Computers',         href: null, image: null },
        { label: 'Laptops',           href: null, image: null },
        { label: 'Tablets',           href: null, image: null },
        { label: 'Chromebooks',       href: null, image: null },
        { label: 'PC Accessories',    href: null, image: null },
      ]},
      { title: 'Audio', links: [
        { label: 'Audio',                  href: null, image: null },
        { label: 'Headphones',             href: null, image: null },
        { label: 'Headsets',               href: null, image: null },
        { label: 'Bluetooth Speakers',     href: null, image: null },
        { label: 'Microphones',            href: null, image: null },
      ]},
      { title: 'Phones', links: [
        { label: 'Smartphones',           href: null, image: null },
        { label: 'Cases & Protection',    href: null, image: null },
        { label: 'Chargers',              href: null, image: null },
        { label: 'Power Banks',           href: null, image: null },
      ]},
      { title: 'Cables & Adapters', links: [
        { label: 'USB-C / USB-A', href: null, image: null },
        { label: 'HDMI',          href: null, image: null },
        { label: 'USB Hubs',      href: null, image: null },
      ]},
    ]
  },
  furniture: {
    id: 'furniture',
    label: 'Furniture',
    emoji: '🪑',
    featured: { tag: '🏠 Popular', text: 'Compact desk from', price: '120 GHS' },
    groups: [
      { title: 'Desk', links: [
        { label: 'Desks',               href: null, image: null },
        { label: 'Office Chairs',       href: null, image: null },
        { label: 'Desk Lamps',          href: null, image: null },
        { label: 'Organizers',          href: null, image: null },
      ]},
      { title: 'Bedroom', links: [
        { label: 'Beds & Mattresses', href: null, image: null },
        { label: 'Bookcases',         href: null, image: null },
        { label: 'Shelves',           href: null, image: null },
        { label: 'Mirrors',           href: null, image: null },
      ]},
      { title: 'Storage', links: [
        { label: 'Wardrobes',             href: null, image: null },
        { label: 'Storage Boxes',         href: null, image: null },
        { label: 'Hangers',               href: null, image: null },
      ]},
      { title: 'Decor', links: [
        { label: 'Cushions & Throws',   href: null, image: null },
        { label: 'Wall Art & Posters',  href: null, image: null },
        { label: 'Rugs',                href: null, image: null },
      ]},
    ]
  },
  food: {
    id: 'food',
    label: 'Food & Snacks',
    emoji: '🍱',
    featured: { tag: '🍫 New', text: 'Weekly snack pack from', price: '25 GHS' },
    groups: [
      { title: 'Snacks', links: [
        { label: 'Cookies & Cakes',     href: null, image: null },
        { label: 'Chips & Crackers',    href: null, image: null },
        { label: 'Dried Fruits & Nuts', href: null, image: null },
        { label: 'Cereal Bars',         href: null, image: null },
      ]},
      { title: 'Drinks', links: [
        { label: 'Water & Juice',       href: null, image: null },
        { label: 'Coffee & Tea',        href: null, image: null },
        { label: 'Energy Drinks',       href: null, image: null },
        { label: 'Smoothies',           href: null, image: null },
      ]},
      { title: 'Fast Food', links: [
        { label: 'Ready Meals',         href: null, image: null },
        { label: 'Instant Soups',       href: null, image: null },
        { label: 'Sandwiches',          href: null, image: null },
      ]},
      { title: 'Dorm Kitchen', links: [
        { label: 'Spices & Sauces',     href: null, image: null },
        { label: 'Rice & Pasta',        href: null, image: null },
        { label: 'Canned Food',         href: null, image: null },
      ]},
    ]
  },
  dress: {
    id: 'dress',
    label: 'Fashion',
    emoji: '👗',
    featured: { tag: '✨ Trending', text: 'Campus collection from', price: '35 GHS' },
    groups: [
      { title: 'Women', links: [
        { label: 'Dresses & Skirts',    href: null, image: null },
        { label: 'T-Shirts & Tops',     href: null, image: null },
        { label: 'Jeans & Pants',       href: null, image: null },
        { label: 'Jackets & Hoodies',   href: null, image: null },
      ]},
      { title: 'Men', links: [
        { label: 'T-Shirts & Polos',    href: null, image: null },
        { label: 'Jeans & Shorts',      href: null, image: null },
        { label: 'Shirts',              href: null, image: null },
        { label: 'Hoodies & Sweats',    href: null, image: null },
      ]},
      { title: 'Shoes', links: [
        { label: 'Sneakers',   href: null, image: null },
        { label: 'Sandals',    href: null, image: null },
        { label: 'Loafers',    href: null, image: null },
      ]},
      { title: 'Accessories', links: [
        { label: 'Caps & Beanies',  href: null, image: null },
        { label: 'Belts',           href: null, image: null },
        { label: 'Watches',         href: null, image: null },
      ]},
    ]
  },
  sport: {
    id: 'sport',
    label: 'Sports',
    emoji: '⚽',
    featured: { tag: '🏃 Active', text: 'Fitness kit from', price: '80 GHS' },
    groups: [
      { title: 'Team Sports', links: [
        { label: 'Football',     href: null, image: null },
        { label: 'Basketball',   href: null, image: null },
        { label: 'Volleyball',   href: null, image: null },
        { label: 'Rugby',        href: null, image: null },
      ]},
      { title: 'Fitness', links: [
        { label: 'Yoga Mats',          href: null, image: null },
        { label: 'Dumbbells',          href: null, image: null },
        { label: 'Resistance Bands',   href: null, image: null },
        { label: 'Jump Ropes',         href: null, image: null },
      ]},
      { title: 'Running', links: [
        { label: 'Running Shoes',      href: null, image: null },
        { label: 'Armbands & GPS',     href: null, image: null },
        { label: 'Running Gear',       href: null, image: null },
      ]},
      { title: 'Swimming', links: [
        { label: 'Swimsuits',          href: null, image: null },
        { label: 'Swim Goggles',       href: null, image: null },
        { label: 'Swim Caps',          href: null, image: null },
      ]},
    ]
  },
  beauty: {
    id: 'beauty',
    label: 'Beauty',
    emoji: '💄',
    featured: { tag: '🌸 Best Seller', text: 'Skincare routines from', price: '20 GHS' },
    groups: [
      { title: 'Face Care', links: [
        { label: 'Moisturizers',       href: null, image: null },
        { label: 'Cleansers',          href: null, image: null },
        { label: 'Masks & Serums',     href: null, image: null },
        { label: 'SPF & Protection',   href: null, image: null },
      ]},
      { title: 'Makeup', links: [
        { label: 'Foundation',         href: null, image: null },
        { label: 'Lipsticks',          href: null, image: null },
        { label: 'Mascara & Eyeliner', href: null, image: null },
        { label: 'Eyeshadow Palettes', href: null, image: null },
      ]},
      { title: 'Hair', links: [
        { label: 'Shampoos',           href: null, image: null },
        { label: 'Hair Oils',          href: null, image: null },
        { label: 'Hair Accessories',   href: null, image: null },
      ]},
      { title: 'Body & Fragrance', links: [
        { label: 'Deodorants',         href: null, image: null },
        { label: 'Perfumes',           href: null, image: null },
        { label: 'Body Lotions',       href: null, image: null },
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
 
  async _init() {
    await this._renderFromData();
    this._bindEvents();
    this._updateAria();
    setTimeout(() => this._bindLinkClicks(), 100);
  }
 
  async _renderFromData() {
    const categories = await loadCategories();
    const sidebar = $('.sidebar__list', this.menu);
    const content = $('.mega-menu__content', this.menu);
 
    if (!sidebar || !content) return;
 
    sidebar.innerHTML = '';
    content.innerHTML = '';
 
    let first = true;
    for (const [key, cat] of Object.entries(categories)) {
      const li = this._buildSidebarItem(key, cat, first);
      sidebar.appendChild(li);
      const panel = this._buildPanel(key, cat, first);
      content.appendChild(panel);
      first = false;
    }
 
    this.sideItems = $$('.sidebar__item', this.menu);
    this.panels    = $$('.content-panel', this.menu);
    this._bindSidebarHover();
    this._bindLinkClicks();
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
 
  _thumb(link) {
    if (link.image) {
      return `<img
        class="group__link-img"
        src="${link.image}"
        alt="${link.label}"
        loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      /><span class="group__link-placeholder" style="display:none" aria-hidden="true">${link.label.charAt(0).toUpperCase()}</span>`;
    }
    return `<span class="group__link-placeholder" aria-hidden="true">${link.label.charAt(0).toUpperCase()}</span>`;
  }
 
  _generateCategoryUrl(categoryKey, subcategoryLabel) {
    return `/pages/category.html?cat=${encodeURIComponent(categoryKey)}&sub=${encodeURIComponent(subcategoryLabel)}`;
  }
 
  _buildPanel(key, cat, isActive) {
    const div = document.createElement('div');
    div.className = 'content-panel' + (isActive ? ' active' : '');
    div.dataset.panel = key;
 
    const groupsHTML = cat.groups.map(g => `
      <div class="subcategory-group">
        <h3 class="group__title">${g.title}</h3>
        <ul class="group__list">
          ${g.links.map(l => {
            const url = this._generateCategoryUrl(key, l.label);
            return `
              <li>
                <a href="${url}" class="group__link" data-category="${key}" data-sub="${l.label}">
                  <span class="group__link-thumb">${this._thumb(l)}</span>
                  <span class="group__link-label">${l.label}</span>
                </a>
              </li>`;
          }).join('')}
        </ul>
      </div>`).join('');
 
    div.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title">${cat.emoji} ${cat.label}</h2>
        <p class="panel__desc">${cat.featured?.text ?? ''}</p>
      </div>
      <div class="panel__grid">${groupsHTML}</div>
      <div class="panel__featured">
        <div class="featured-tag">${cat.featured?.tag ?? ''}</div>
        <p>${cat.featured?.text ?? ''} <strong>${cat.featured?.price ?? ''}</strong></p>
      </div>`;
    return div;
  }
 
  _bindLinkClicks() {
    const allLinks = this.menu.querySelectorAll('.group__link');
    allLinks.forEach(link => {
      link.removeEventListener('click', this._linkClickHandler);
      link._clickHandler = (e) => {
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      };
      link.addEventListener('click', link._clickHandler);
    });
  }
 
  _bindEvents() {
    this.trigger.addEventListener('mouseenter', () => this._scheduleOpen());
    this.trigger.addEventListener('mouseleave', (e) => this._handleMouseLeave(e));
    this.menu.addEventListener('mouseenter', () => clearTimeout(this.hoverTimer));
    this.menu.addEventListener('mouseleave', (e) => this._handleMouseLeave(e));
    this.btn.addEventListener('click', () => this.toggle());
    this.backdrop.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.btn.focus();
      }
    });
    this._bindSidebarHover();
  }
 
  _bindSidebarHover() {
    this.sideItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this._switchPanel(item.dataset.category);
      });
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
 
  _scheduleOpen() {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => this.open(), 80);
  }
 
  _handleMouseLeave(e) {
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
    this.menu.removeAttribute('inert');
    this.menu.removeAttribute('aria-hidden');
  }
 
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.trigger.classList.remove('is-open');
    this.backdrop.classList.remove('is-visible');
    this._updateAria();
    if (this.menu.contains(document.activeElement)) {
      this.btn.focus();
    }
    this.menu.setAttribute('inert', '');
  }
 
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
 
  _switchPanel(categoryKey) {
    if (categoryKey === this.activeCategory) return;
    this.activeCategory = categoryKey;
 
    this.sideItems.forEach(item => {
      const isActive = item.dataset.category === categoryKey;
      item.classList.toggle('active', isActive);
      const btn = item.querySelector('.sidebar__btn');
      if (btn) btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
 
    this.panels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === categoryKey);
    });
  }
 
  _updateAria() {
    this.btn.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
    if (!this.isOpen) {
      this.menu.setAttribute('inert', '');
    } else {
      this.menu.removeAttribute('inert');
    }
  }
}
 
window.MegaMenu = MegaMenu;