/**
 * AVENA — Product Module
 * assets/js/modules/product.js
 * 
 * Gestion des produits:
 * - CRUD (Create, Read, Update, Delete)
 * - Stockage mock (localStorage + fallback JSON)
 * - Affichage dynamique (single product)
 * - Contact seller via chat
 * - Gestion des catégories/sous-catégories (basé sur mega menu)
 */

'use strict';

const ProductsDB = {
  STORAGE_KEY: 'avena_products_local',
  
  async getAll() {
    const local = this._getLocal();
    try {
      const res = await fetch('/data/mock/products.json');
      const mock = await res.json();
      const map = {};
      mock.forEach(p => map[p.id] = p);
      local.forEach(p => map[p.id] = p);
      return Object.values(map);
    } catch {
      return local;
    }
  },
  
  async getById(id) {
  try {
    const response = await fetch(`https://avena-backend-os8d.onrender.com/api/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error loading product:', error);
    return null;
  }
},
  
  save(product) {
    const local = this._getLocal();
    const idx = local.findIndex(p => p.id === product.id);
    if (idx >= 0) local[idx] = product;
    else local.push(product);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(local));
    return product;
  },
  
  delete(id) {
    const local = this._getLocal().filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(local));
  },
  
  _getLocal() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
};

/* ============================================================
   PRODUCT CLASS
   ============================================================ */
class Products {
  
  // Catégories et sous-catégories (basées sur le mega menu)
  static getCategories() {
    return {
      school: {
        label: 'School Features',
        subcategories: ['Fournitures', 'Sacs & Transport', 'Livres & Docs', 'Impression']
      },
      electronics: {
        label: 'Electronics',
        subcategories: ['Ordinateurs', 'Audio', 'Téléphones', 'Câbles & Adaptateurs']
      },
      furniture: {
        label: 'Furniture',
        subcategories: ['Bureau', 'Chambre', 'Rangement', 'Déco']
      },
      food: {
        label: 'Food & Collation',
        subcategories: ['Snacks', 'Boissons', 'Repas rapides', 'Cuisine dorm']
      },
      dress: {
        label: 'Dress',
        subcategories: ['Femmes', 'Hommes', 'Chaussures', 'Accessoires']
      },
      sport: {
        label: 'Sport Equipment',
        subcategories: ['Sports collectifs', 'Fitness', 'Running', 'Natation']
      },
      beauty: {
        label: 'Beauty',
        subcategories: ['Soin du visage', 'Maquillage', 'Cheveux', 'Corps & Parfums']
      }
    };
  }
  
  /* ── CREATE ── */
  static async create(data, user) {
    if (!user) return { ok: false, error: 'You must be logged in to sell.' };
    
    const { title, category, subcategory, price, moq, stock, description, images, condition } = data;
    
    if (!title || !category || !price || !description) {
      return { ok: false, error: 'Please fill in all required fields.' };
    }
    
    if (price <= 0) return { ok: false, error: 'Price must be greater than 0.' };
    
    const coverImage = images?.[0] || `https://placehold.co/400x400/4361ee/ffffff?text=${encodeURIComponent(title)}`;
    
    const product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      category,
      subcategory: subcategory || '',
      price: Number(price),
      currency: 'GHS',
      moq: moq ? Number(moq) : 1,
      stock: stock ? Number(stock) : 1,
      description: description.trim(),
      condition: condition || 'new',
      seller: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        university: user.universityId,
        avatar: user.avatar || `https://placehold.co/80x80/4361ee/ffffff?text=${user.firstName?.charAt(0) || 'U'}`
      },
      rating: 0,
      reviews: 0,
      images: images?.length ? images : [coverImage],
      coverImage,
      tags: [category, subcategory?.toLowerCase()],
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    ProductsDB.save(product);
    return { ok: true, product, message: 'Product listed successfully!' };
  }
  
  /* ── GET ALL ── */
  static async getAll() {
  return ProductsDB.getAll();
}
  
  static async getById(id) {
    return ProductsDB.getById(id);
  }
  
  static async getBySeller(sellerId) {
    const all = await ProductsDB.getAll();
    return all.filter(p => p.seller?.id === sellerId);
  }
  
  static delete(id, user) {
    if (!user) return { ok: false, error: 'Not authenticated.' };
    const product = ProductsDB.getById(id);
    if (product?.seller?.id !== user.id && user.role !== 'admin') {
      return { ok: false, error: 'You can only delete your own products.' };
    }
    ProductsDB.delete(id);
    return { ok: true, message: 'Product deleted.' };
  }
  
  /* ── HELPERS ── */
  static formatPrice(price) {
    return `GHS ${Number(price).toFixed(2)}`;
  }
  
  static buildStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }
  
  static formatStock(stock) {
    if (stock === 0) return '<span style="color:#e53e3e">Out of stock</span>';
    if (stock < 10) return `<span style="color:#e53e3e">Only ${stock} left</span>`;
    return `${stock} in stock`;
  }
}

/* ============================================================
   RENDER SINGLE PRODUCT (pour product.html)
   ============================================================ */
async function renderSingleProduct(containerId, productId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const product = await Products.getById(productId);
  if (!product) {
    container.innerHTML = `
      <div class="error-state" style="text-align:center;padding:60px">
        <p>❌ Product not found.</p>
        <a href="/pages/marketplace.html" style="color:#4361ee">← Back to marketplace</a>
      </div>`;
    return;
  }
  
  const user = window.Session?.get ? window.Session.get() : null;
  const isOwnProduct = user && product.seller?.id === user.id;
  
  container.innerHTML = `
    <div class="product-page">
      <div class="product-gallery">
        <div class="gallery-main">
          <img id="mainImage" src="${product.coverImage}" alt="${product.title}" onerror="this.src='https://placehold.co/600x600/4361ee/fff?text=Product'">
        </div>
        <div class="gallery-thumbs" id="galleryThumbs">
          ${product.images.map((img, i) => `
            <img src="${img}" alt="thumb ${i+1}" data-src="${img}" class="thumb ${i === 0 ? 'active' : ''}">
          `).join('')}
        </div>
      </div>
      
      <div class="product-info">
        <div class="product-category">${product.category} ${product.subcategory ? `› ${product.subcategory}` : ''}</div>
        <h1 class="product-title">${escapeHtml(product.title)}</h1>
        <div class="product-price">${Products.formatPrice(product.price)}</div>
        
        <div class="product-meta">
          <div class="meta-row">
            <span class="meta-label">Condition:</span>
            <span class="meta-value">${product.condition === 'new' ? 'New' : 'Used - Good'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">MOQ:</span>
            <span class="meta-value">${product.moq} piece(s)</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Stock:</span>
            <span class="meta-value">${Products.formatStock(product.stock)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Rating:</span>
            <span class="meta-value stars">${Products.buildStars(product.rating)} (${product.reviews} reviews)</span>
          </div>
        </div>
        
        <div class="product-description">
          <h3>Description</h3>
          <p>${escapeHtml(product.description)}</p>
        </div>
        
        <div class="product-seller">
          <div class="seller-avatar">
            <img src="${product.seller?.avatar || 'https://placehold.co/60x60/4361ee/fff?text=U'}" alt="${product.seller?.name}">
          </div>
          <div class="seller-info">
            <div class="seller-name">${product.seller?.name}</div>
            <div class="seller-university">${product.seller?.university}</div>
          </div>
        </div>
        
        <div class="product-actions">
          ${!isOwnProduct && user ? `
            <button class="btn-primary" id="contactSellerBtn">💬 Contact Seller</button>
          ` : isOwnProduct ? `
            <button class="btn-secondary" id="editProductBtn">✏️ Edit</button>
            <button class="btn-danger" id="deleteProductBtn">🗑️ Delete</button>
          ` : `
            <a href="/pages/auth/login.html?redirect=${encodeURIComponent(window.location.href)}" class="btn-primary">🔐 Login to contact</a>
          `}
        </div>
      </div>
    </div>
  `;
  
  // Gallery thumbnails
  const thumbs = container.querySelectorAll('.thumb');
  const mainImage = container.querySelector('#mainImage');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImage.src = thumb.dataset.src;
    });
  });
  
  // Contact seller
  const contactBtn = container.querySelector('#contactSellerBtn');
  if (contactBtn && user) {
    contactBtn.addEventListener('click', async () => {
      const modal = document.createElement('avenna-modal');
      modal.setAttribute('title', `Contact ${product.seller?.name}`);
      modal.innerHTML = `
        <textarea id="messageText" rows="4" style="width:100%;padding:10px;border:1px solid #e2e6f3;border-radius:8px" placeholder="Hi ${product.seller?.name}, I'm interested in ${product.title}. Is it still available?"></textarea>
        <div style="margin-top:16px;display:flex;gap:12px;justify-content:flex-end">
          <button class="btn-secondary" id="cancelMsg">Cancel</button>
          <button class="btn-primary" id="sendMsg">Send Message</button>
        </div>
      `;
      document.body.appendChild(modal);
      modal.show();
      
      modal.querySelector('#cancelMsg').addEventListener('click', () => modal.hide());
      modal.querySelector('#sendMsg').addEventListener('click', async () => {
        const msg = modal.querySelector('#messageText').value.trim();
        if (!msg) return;
        
        const result = await Messaging.send({
          from: user.id,
          fromName: `${user.firstName} ${user.lastName}`,
          to: product.seller.id,
          toName: product.seller.name,
          subject: `Inquiry: ${product.title}`,
          body: msg
        });
        
        modal.hide();
        modal.remove();
        
        if (result.ok) {
          alert('Message sent! The seller will contact you soon.');
        } else {
          alert('Error sending message. Please try again.');
        }
      });
    });
  }
  
  // Edit product
  const editBtn = container.querySelector('#editProductBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      window.location.href = `/pages/sell.html?edit=${product.id}`;
    });
  }
  
  // Delete product
  const deleteBtn = container.querySelector('#deleteProductBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Delete "${product.title}"? This cannot be undone.`)) {
        const res = Products.delete(product.id, user);
        if (res.ok) {
          alert('Product deleted.');
          window.location.href = '/pages/dashboard.html';
        } else {
          alert(res.error);
        }
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Exports
window.Products = Products;
window.ProductsDB = ProductsDB;
window.renderSingleProduct = renderSingleProduct;

// Auto-init si on est sur product.html
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-details') && window.location.pathname.includes('product.html')) {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (productId) {
      renderSingleProduct('product-details', productId);
    }
  }
});