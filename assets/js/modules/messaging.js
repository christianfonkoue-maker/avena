/**
 * AVENA — Messaging Module (API + WebSocket)
 * assets/js/modules/messaging.js
 */

'use strict';

const API_BASE = window.APP_CONFIG?.API_URL || 'https://avena-backend-os8d.onrender.com';

const MessagingAPI = {
  async getConversations() {
    const token = sessionStorage.getItem('avena_token');
    if (!token) return [];

    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    } catch {
      return [];
    }
  },

  async getConversation(otherUserId) {
    const token = sessionStorage.getItem('avena_token');
    if (!token) return [];

    try {
      const res = await fetch(`${API_BASE}/api/messages/conversation/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  },

  async sendMessage(to, body, subject = '') {
    const token = sessionStorage.getItem('avena_token');
    if (!token) return { ok: false };

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ to, body, subject })
      });
      if (!res.ok) return { ok: false };
      return await res.json();
    } catch {
      return { ok: false };
    }
  },

  async markAsRead(otherUserId) {
    const token = sessionStorage.getItem('avena_token');
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/messages/conversation/${otherUserId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {}
  },

  async getUnreadCount() {
    const token = sessionStorage.getItem('avena_token');
    if (!token) return 0;

    try {
      const res = await fetch(`${API_BASE}/api/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.count || 0;
    } catch {
      return 0;
    }
  }
};

window.MessagingAPI = MessagingAPI;