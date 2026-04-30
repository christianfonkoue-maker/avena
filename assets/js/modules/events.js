/**
 * ============================================================
 *  AVENA — Events Module
 *  assets/js/modules/events.js
 *
 *  MOCK MODE  → data/mock/events.json + localStorage
 *  API MODE   → POST/GET/PUT/DELETE /api/events via Express
 *
 *  PostgreSQL schema (future):
 *  ─────────────────────────────────────────────────────────
 *  CREATE TABLE events (
 *    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    title       VARCHAR(200) NOT NULL,
 *    description TEXT,
 *    category    VARCHAR(50),
 *    organizer_id UUID REFERENCES users(id),
 *    date        DATE NOT NULL,
 *    time        TIME,
 *    end_time    TIME,
 *    location    VARCHAR(300),
 *    is_paid     BOOLEAN DEFAULT false,
 *    price       NUMERIC(10,2) DEFAULT 0,
 *    currency    VARCHAR(10) DEFAULT 'GHS',
 *    capacity    INT,
 *    cover_image TEXT,
 *    status      VARCHAR(20) DEFAULT 'upcoming',
 *    created_at  TIMESTAMPTZ DEFAULT NOW()
 *  );
 *  CREATE TABLE event_images (
 *    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
 *    url      TEXT NOT NULL,
 *    is_cover BOOLEAN DEFAULT false,
 *    sort_order INT DEFAULT 0
 *  );
 *  CREATE TABLE event_registrations (
 *    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    event_id   UUID REFERENCES events(id),
 *    user_id    UUID REFERENCES users(id),
 *    registered_at TIMESTAMPTZ DEFAULT NOW(),
 *    UNIQUE(event_id, user_id)
 *  );
 * ============================================================
 */

'use strict';

const EventsDB = {
  STORAGE_KEY: 'avena_events_local',
  REG_KEY:     'avena_registrations',

  /* Load all events: mock JSON + locally created ones merged */
  async getAll() {
    const local = this._getLocal();
    try {
      /* PRODUCTION: replace with fetch('/api/events') */
   const res = await fetch('/data/mock/events.json')
      const mock = await res.json();
      // Merge: local overrides mock by id
      const map  = {};
      mock.forEach(e => map[e.id] = e);
      local.forEach(e => map[e.id] = e);
      return Object.values(map).sort((a,b) => new Date(a.date)-new Date(b.date));
    } catch {
      return local;
    }
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find(e => e.id === id) ?? null;
  },

  /* Save a new event (local mock; prod: POST /api/events) */
  save(event) {
    const local = this._getLocal();
    const idx   = local.findIndex(e => e.id === event.id);
    if (idx >= 0) local[idx] = event;
    else local.push(event);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(local));
    return event;
  },

  delete(id) {
    const local = this._getLocal().filter(e => e.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(local));
  },

  _getLocal() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]'); }
    catch { return []; }
  },

  /* Registrations */
  getRegistrations() {
    try { return JSON.parse(localStorage.getItem(this.REG_KEY) ?? '[]'); }
    catch { return []; }
  },
  saveRegistration(reg) {
    const regs = this.getRegistrations();
    regs.push(reg);
    localStorage.setItem(this.REG_KEY, JSON.stringify(regs));
  },
  isRegistered(eventId, userId) {
    return this.getRegistrations().some(r => r.eventId===eventId && r.userId===userId);
  },
};

/* ============================================================
   EVENTS CLASS
   ============================================================ */
class Events {

  /* ── CREATE ── */
  static async create(data, user) {
    if (!user) return { ok:false, error:'You must be logged in to create an event.' };

    const { title, description, category, date, time, endTime,
            location, isPaid, price, capacity, images } = data;

    if (!title||!description||!date||!location||!category)
      return { ok:false, error:'Please fill in all required fields.' };
    if (new Date(date) < new Date())
      return { ok:false, error:'Event date must be in the future.' };
    if (isPaid && (!price || Number(price) <= 0))
      return { ok:false, error:'Paid events must have a valid price.' };

    // NOTE: right-to-create check — in prod, verify via JWT role/permissions
    // For now any verified student can create. Role check will be added later.

    const coverImage = images?.[0] || `https://placehold.co/800x450/4361ee/ffffff?text=${encodeURIComponent(title)}`;

    const event = {
      id:          `evt_${Date.now()}`,
      title:       title.trim(),
      description: description.trim(),
      category,
      organizer:   { id: user.id, name: `${user.firstName} ${user.lastName}`, university: user.universityId },
      date, time, endTime,
      location:    location.trim(),
      isPaid:      !!isPaid,
      price:       isPaid ? Number(price) : 0,
      currency:    'GHS',
      capacity:    capacity ? Number(capacity) : null,
      registered:  0,
      images:      images && images.length ? images : [coverImage],
      coverImage,
      tags:        [category.toLowerCase()],
      status:      'upcoming',
      createdAt:   new Date().toISOString(),
    };

    EventsDB.save(event);
    return { ok:true, event, message:'Event created successfully!' };
  }

  /* ── REGISTER FOR EVENT ── */
  static async register(eventId, user) {
    if (!user) return { ok:false, error:'Please log in to register for events.' };

    const event = await EventsDB.getById(eventId);
    if (!event) return { ok:false, error:'Event not found.' };

    if (EventsDB.isRegistered(eventId, user.id))
      return { ok:false, error:'You are already registered for this event.' };

    if (event.capacity && event.registered >= event.capacity)
      return { ok:false, error:'This event is fully booked.' };

    if (event.isPaid) {
      // Paid event → open chat with organizer (chat module will handle this)
      return {
        ok:       true,
        isPaid:   true,
        message:  'This is a paid event. A chat has been opened with the organizer.',
        chatWith: event.organizer,
        event,
      };
    }

    // Free event → register + send confirmation email
    const reg = {
      id:           `reg_${Date.now()}`,
      eventId,
      userId:       user.id,
      registeredAt: new Date().toISOString(),
    };
    EventsDB.saveRegistration(reg);

    // Update registered count in local storage
    event.registered = (event.registered || 0) + 1;
    EventsDB.save(event);

    // Send confirmation email
    await EmailService.send(
      user.email,
      `Registration confirmed: ${event.title}`,
      EmailService.tplConfirm(user.firstName, event.title)
    );

    return { ok:true, isPaid:false, message:`You're registered! A confirmation was sent to ${user.email}.` };
  }

  /* ── GET ALL (with optional filters) ── */
  static async getAll(filters = {}) {
    let events = await EventsDB.getAll();
    if (filters.category) events = events.filter(e => e.category===filters.category);
    if (filters.isPaid !== undefined) events = events.filter(e => e.isPaid===filters.isPaid);
    if (filters.search) {
      const t = filters.search.toLowerCase();
      events = events.filter(e => e.title.toLowerCase().includes(t) || e.description.toLowerCase().includes(t));
    }
    return events;
  }

  static async getById(id) { return EventsDB.getById(id); }

  /* ── DELETE ── */
  static delete(eventId, user) {
    if (!user) return { ok:false, error:'Not authenticated.' };
    // In prod: also check user.id === event.organizer_id OR user.role === 'admin'
    EventsDB.delete(eventId);
    return { ok:true, message:'Event deleted.' };
  }

  /* ── HELPERS ── */
  static formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
  static formatPrice(price, currency='GHS') {
    return price === 0 ? 'Free' : `${currency} ${Number(price).toFixed(2)}`;
  }
  static spotsLeft(event) {
    if (!event.capacity) return null;
    return event.capacity - (event.registered || 0);
  }
  static isUserOrganizer(event, user) {
    return user && event.organizer?.id === user.id;
  }
}

window.Events  = Events;
window.EventsDB = EventsDB;