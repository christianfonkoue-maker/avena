/**
 * ============================================================
 *  AVENA — Services Module
 *  assets/js/modules/services.js
 * ============================================================
 */
'use strict';

// Helper pour récupérer l'URL de l'API
const getAPIUrl = () => {
  return window.APP_CONFIG?.API_URL || 'https://avena-backend-os8d.onrender.com';
};

const ServicesDB = {
  KEY: 'avena_services_local',
  async getAll() {
    try {
      const response = await fetch(`${getAPIUrl()}/api/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      return data.services;
    } catch (error) {
      console.error('Error loading services from API:', error);
      return this._local();
    }
  },
  async getById(id) {
    try {
      const response = await fetch(`${getAPIUrl()}/api/services/${id}`);
      if (!response.ok) throw new Error('Service not found');
      const data = await response.json();
      return data.service;
    } catch (error) {
      console.error('Error loading service:', error);
      return null;
    }
  },
  save(svc) {
    const list = this._local();
    const i = list.findIndex(s => s.id === svc.id);
    if (i >= 0) list[i] = svc;
    else list.push(svc);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return svc;
  },
  delete(id) {
    localStorage.setItem(this.KEY, JSON.stringify(this._local().filter(s => s.id !== id)));
  },
  _local() {
    try { return JSON.parse(localStorage.getItem(this.KEY) ?? '[]'); } catch { return []; }
  },
};

class Services {
  static CATEGORIES = ['IT', 'Medicine', 'Finance', 'Arts', 'Sport', 'Engineering', 'Law', 'Other'];

  static async create(data, user) {
    if (!user) return { ok: false, error: 'Login required.' };

    const token = localStorage.getItem('avena_token');
    if (!token) {
      return { ok: false, error: 'You are not logged in. Please login again.' };
    }

    const { title, description, category, subcategory, price, priceType, deliveryDays, images } = data;

    if (!title || !description || !category || !price) {
      return { ok: false, error: 'Please fill in all required fields.' };
    }

    try {
      const response = await fetch(`${getAPIUrl()}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          subcategory: subcategory || '',
          price: Number(price),
          priceType: priceType || 'fixed',
          deliveryDays: deliveryDays ? Number(deliveryDays) : null,
          coverImage: images?.[0] || null
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Creation failed');

      return { ok: true, service: result.service, message: 'Service published!' };
    } catch (error) {
      console.error('Create service error:', error);
      return { ok: false, error: error.message };
    }
  }

  static async getAll(filters = {}) {
    try {
      const response = await fetch(`${getAPIUrl()}/api/services`);
      const data = await response.json();
      let list = data.services;
      if (filters.category) list = list.filter(s => s.category === filters.category);
      if (filters.search) {
        const t = filters.search.toLowerCase();
        list = list.filter(s => s.title.toLowerCase().includes(t) || s.description.toLowerCase().includes(t));
      }
      return list;
    } catch (error) {
      console.error('Error loading services:', error);
      return [];
    }
  }

  static async getById(id) { return ServicesDB.getById(id); }
  static delete(id, user) { if (!user) return { ok: false, error: 'Not authenticated.' }; ServicesDB.delete(id); return { ok: true }; }

  static formatPrice(svc) {
    const type = { fixed: '', per_session: ' / session', starting: ' starting', per_hour: ' / hr' };
    return `GHS ${Number(svc.price).toFixed(2)}${type[svc.priceType] || ''}`;
  }
  static formatDelivery(days) { return days ? `${days} day${days > 1 ? 's' : ''} delivery` : 'Flexible'; }
  static buildStars(r) { return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)); }
}

window.Services = Services;
window.ServicesDB = ServicesDB;