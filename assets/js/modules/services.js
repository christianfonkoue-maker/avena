/**
 * ============================================================
 *  AVENA — Services Module
 *  assets/js/modules/services.js
 * ============================================================
 */
'use strict';

const ServicesDB = {
  KEY: 'avena_services_local',
  async getAll() {
    const local = this._local();
    try {
      const res  = await fetch('../../data/mock/services.json');
      const mock = await res.json();
      const map  = {};
      mock.forEach(s=>map[s.id]=s);
      local.forEach(s=>map[s.id]=s);
      return Object.values(map);
    } catch { return local; }
  },
  async getById(id) { return (await this.getAll()).find(s=>s.id===id)??null; },
  save(svc) {
    const list=this._local();
    const i=list.findIndex(s=>s.id===svc.id);
    if(i>=0) list[i]=svc; else list.push(svc);
    localStorage.setItem(this.KEY,JSON.stringify(list));
    return svc;
  },
  delete(id){ localStorage.setItem(this.KEY,JSON.stringify(this._local().filter(s=>s.id!==id))); },
  _local(){ try{return JSON.parse(localStorage.getItem(this.KEY)??'[]');}catch{return[];} },
};

class Services {
  static CATEGORIES = ['IT','Medicine','Finance','Arts','Sport','Engineering','Law','Other'];

  static async create(data, user) {
    if (!user) return { ok:false, error:'Login required.' };
    const { title, description, category, price, priceType, deliveryDays, images } = data;
    if (!title||!description||!category||!price)
      return { ok:false, error:'Please fill in all required fields.' };

    const svc = {
      id:           `svc_${Date.now()}`,
      title:        title.trim(),
      description:  description.trim(),
      category,
      subcategory:  data.subcategory||'',
      provider:     { id:user.id, name:`${user.firstName} ${user.lastName}`, university:user.universityId, avatar:user.avatar||null },
      price:        Number(price),
      priceType:    priceType||'fixed',
      currency:     'GHS',
      deliveryDays: deliveryDays ? Number(deliveryDays) : null,
      rating:       0,
      reviews:      0,
      images:       images?.length ? images : [`https://placehold.co/600x400/4361ee/fff?text=${encodeURIComponent(title)}`],
      coverImage:   images?.[0] || `https://placehold.co/600x400/4361ee/fff?text=${encodeURIComponent(title)}`,
      tags:         [category.toLowerCase()],
      status:       'active',
      createdAt:    new Date().toISOString(),
    };
    ServicesDB.save(svc);
    return { ok:true, service:svc, message:'Service published!' };
  }

  static async getAll(filters={}) {
    let list = await ServicesDB.getAll();
    if (filters.category) list=list.filter(s=>s.category===filters.category);
    if (filters.search){ const t=filters.search.toLowerCase(); list=list.filter(s=>s.title.toLowerCase().includes(t)||s.description.toLowerCase().includes(t)); }
    return list;
  }

  static async getById(id) { return ServicesDB.getById(id); }
  static delete(id,user){ if(!user) return{ok:false,error:'Not authenticated.'}; ServicesDB.delete(id); return{ok:true}; }

  static formatPrice(svc) {
    const type = { fixed:'', per_session:' / session', starting:' starting', per_hour:' / hr' };
    return `GHS ${Number(svc.price).toFixed(2)}${type[svc.priceType]||''}`;
  }
  static formatDelivery(days) { return days ? `${days} day${days>1?'s':''} delivery` : 'Flexible'; }
  static buildStars(r) { return '★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r)); }
}

window.Services   = Services;
window.ServicesDB = ServicesDB;