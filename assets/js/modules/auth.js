/**
 * ============================================================
 *  AVENA — Auth Module
 *  assets/js/modules/auth.js
 * ============================================================
 */
'use strict';

/* ── Helper pour l'URL de l'API ── */
const getApiUrl = () => {
  return window.APP_CONFIG?.API_URL || 'https://avena-backend-os8d.onrender.com';
};

/* ── Session (stockée en sessionStorage pour isolation par onglet) ── */
const Session = {
  KEY: 'avena_session',
  set(u) {
    sessionStorage.setItem(this.KEY, JSON.stringify({
      ...u, password: undefined,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }));
  },
  get() {
    try {
      const s = JSON.parse(sessionStorage.getItem(this.KEY));
      if (!s) return null;
      if (Date.now() > s.expiresAt) { this.clear(); return null; }
      return s;
    } catch { return null; }
  },
  clear() { sessionStorage.removeItem(this.KEY); },
  isLoggedIn() { return !!this.get(); },
};

/* ── Email service (mock → prod: Express + Nodemailer) ── */
const EmailService = {
  async send(to, subject, html) {
    console.info(`[Email] → ${to} | ${subject}`);
    return true;
  },
  tplVerify: (name, code) => `<p>Hi ${name}, your verification code is: <strong style="font-size:1.5rem;letter-spacing:.2em">${code}</strong>. Expires in 15 min.</p>`,
  tplReset: (name, link) => `<p>Hi ${name}, <a href="${link}">click here</a> to reset your password. Expires in 1 hour.</p>`,
  tplConfirm: (name, title) => `<p>Hi ${name}, you are registered for <strong>${title}</strong>. See you there! 🎉</p>`,
};

/* ── Auth ── */
class Auth {
  
  static async getUniversityByEmail(email) {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/categories/universities`);
      const universities = await response.json();
      const domain = email.split('@')[1]?.toLowerCase();
      return universities.find(u => u.domain === domain) || null;
    } catch {
      return null;
    }
  }

  static isUniversityEmail(email) {
    return !!Auth.getUniversityByEmail(email);
  }

  /* REGISTER */
  static async register({ firstName, lastName, email, studentId, password, confirmPassword, program, year }) {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, studentId, password, confirmPassword, program, year }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      sessionStorage.setItem('avena_verify_email', email);
      
      return { ok: true, message: data.message };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  /* LOGIN */
  static async login(email, password) {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        if (data.needsVerify) return { ok: false, needsVerify: true, error: data.error };
        if (data.needs2FA) return { ok: false, needs2FA: true, error: data.error };
        throw new Error(data.error);
      }
      
      if (data.token) {
        sessionStorage.setItem('avena_token', data.token);
        console.log('✅ Token stocké :', data.token.substring(0, 50) + '...');
      } else {
        console.warn('⚠️ Aucun token reçu du backend');
      }
      
      Session.set(data.user);
      return { ok: true, user: data.user };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  /* VERIFY EMAIL */
  static async verifyEmail(email, code) {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      return { ok: true, message: data.message };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  /* FORGOT PASSWORD */
  static async forgotPassword(email) {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      return { ok: true, message: data.message };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  /* RESET PASSWORD */
  static async resetPassword(email, token, newPassword) {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      return { ok: true, message: data.message };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  /* LOGOUT */
  static logout() {
    sessionStorage.removeItem('avena_token');
    Session.clear();
    window.location.href = '/pages/auth/login.html';
  }

  static guard(role = null) {
    const s = Session.get();
    if (!s) {
      window.location.href = `/pages/auth/login.html?redirect=${encodeURIComponent(location.pathname)}`;
      return null;
    }
    if (role && s.role !== role) {
      window.location.href = '/index.html';
      return null;
    }
    return s;
  }

  /* RESEND CODE */
  static async resendVerification(email) {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      return { ok: true, message: data.message };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  /* Helpers (gardés pour compatibilité) */
  static _code() { return String(Math.floor(100000 + Math.random() * 900000)); }
  static _token() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  static _store(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  static _get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
  static _del(k) { localStorage.removeItem(k); }
}

window.Auth = Auth;
window.Session = Session;
window.EmailService = EmailService;