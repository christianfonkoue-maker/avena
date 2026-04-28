/**
 * ============================================================
 *  AVENA — Auth Module
 *  assets/js/modules/auth.js
 * ============================================================
 */
'use strict';

const MOCK_UNIVERSITIES = [
  { id:'uni_001', name:'Ashesi University',                 domain:'acity.edu.gh',          short:'ACity' },
  { id:'uni_002', name:'University of Ghana',               domain:'ug.edu.gh',              short:'UG' },
  { id:'uni_003', name:'KNUST',                             domain:'knust.edu.gh',           short:'KNUST' },
  { id:'uni_004', name:'Central University',                domain:'central.edu.gh',         short:'CU' },
  { id:'uni_005', name:'Accra Technical University',        domain:'atu.edu.gh',             short:'ATU' },
  { id:'uni_006', name:'Ghana Communication Tech Uni',      domain:'gctu.edu.gh',            short:'GCTU' },
  { id:'uni_007', name:'University of Professional Studies',domain:'upsa.edu.gh',            short:'UPSA' },
  { id:'uni_008', name:'Methodist University Ghana',        domain:'methodistugha.edu.gh',   short:'MUG' },
];

const MOCK_USERS = [
{
    id:'usr_001', firstName:'Christian', lastName:'Fonkoue',
    email:'Christian.fonkoue@acity.edu.gh', studentId:'AC2024001',
    universityId:'uni_001', password:'hashed_test123',
    verified:true, twoFAEnabled:false, role:'student', avatar:null,
    createdAt:'2024-09-01T00:00:00Z',
  },

];

/* ── Session ── */
const Session = {
  KEY: 'avena_session',
  set(u) {
    localStorage.setItem(this.KEY, JSON.stringify({
      ...u, password:undefined,
      expiresAt: Date.now() + 7*24*60*60*1000,
    }));
  },
  get() {
    try {
      const s = JSON.parse(localStorage.getItem(this.KEY));
      if (!s) return null;
      if (Date.now() > s.expiresAt) { this.clear(); return null; }
      return s;
    } catch { return null; }
  },
  clear() { localStorage.removeItem(this.KEY); },
  isLoggedIn() { return !!this.get(); },
};

/* ── Email service (mock → prod: Express + Nodemailer) ── */
const EmailService = {
  async send(to, subject, html) {
    console.info(`[Email] → ${to} | ${subject}`);
    /* PRODUCTION:
       await fetch('/api/email/send', {
         method:'POST', headers:{'Content-Type':'application/json'},
         body: JSON.stringify({to, subject, html})
       }); */
    return true;
  },
  tplVerify:  (name, code) => `<p>Hi ${name}, your verification code is: <strong style="font-size:1.5rem;letter-spacing:.2em">${code}</strong>. Expires in 15 min.</p>`,
  tplReset:   (name, link) => `<p>Hi ${name}, <a href="${link}">click here</a> to reset your password. Expires in 1 hour.</p>`,
  tplConfirm: (name, title) => `<p>Hi ${name}, you are registered for <strong>${title}</strong>. See you there! 🎉</p>`,
};

/* ── Auth ── */
class Auth {
  static getUniversities() { return MOCK_UNIVERSITIES; }

  static getUniversityByEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return MOCK_UNIVERSITIES.find(u => u.domain === domain) ?? null;
  }

  static isUniversityEmail(email) { return !!Auth.getUniversityByEmail(email); }

  /* REGISTER */
  static async register({ firstName, lastName, email, studentId, password, confirmPassword }) {
    if (!firstName||!lastName||!email||!studentId||!password)
      return { ok:false, error:'All fields are required.' };
    if (password !== confirmPassword)
      return { ok:false, error:'Passwords do not match.' };
    if (password.length < 8)
      return { ok:false, error:'Password must be at least 8 characters.' };
    if (!Auth.isUniversityEmail(email))
      return { ok:false, error:'Only registered university emails are accepted.' };
    if (MOCK_USERS.find(u => u.email.toLowerCase()===email.toLowerCase()))
      return { ok:false, error:'An account with this email already exists.' };
    if (studentId.trim().length < 4)
      return { ok:false, error:'Invalid student ID.' };

    const uni = Auth.getUniversityByEmail(email);
    const user = {
      id:`usr_${Date.now()}`, firstName, lastName, email, studentId,
      universityId: uni.id, password:`hashed_${password}`,
      verified:false, twoFAEnabled:false, role:'student', avatar:null,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.push(user);

    const code = Auth._code();
    Auth._store('avena_verify_'+email, { code, expiresAt: Date.now()+15*60_000 });
    await EmailService.send(email, 'Verify your Avena account', EmailService.tplVerify(firstName, code));
    return { ok:true, message:'Account created! Check your email to verify.' };
  }

  /* LOGIN */
  static async login(email, password) {
    if (!email||!password) return { ok:false, error:'All fields are required.' };
    if (!Auth.isUniversityEmail(email)) return { ok:false, error:'Only university emails are accepted.' };
    const user = MOCK_USERS.find(u => u.email.toLowerCase()===email.toLowerCase());
    if (!user) return { ok:false, error:'No account found with this email.' };
    if (user.password !== `hashed_${password}`) return { ok:false, error:'Incorrect password.' };
    if (!user.verified) return { ok:false, error:'Please verify your email first.', needsVerify:true };
    if (user.twoFAEnabled) {
      const code = Auth._code();
      Auth._store('avena_2fa_'+email, { code, expiresAt: Date.now()+10*60_000 });
      await EmailService.send(email, 'Your Avena 2FA code', `<p>Code: <strong>${code}</strong></p>`);
      return { ok:false, needs2FA:true };
    }
    Session.set(user);
    return { ok:true, user };
  }

  /* VERIFY EMAIL */
  static verifyEmail(email, code) {
    const p = Auth._get('avena_verify_'+email);
    if (!p) return { ok:false, error:'No pending verification.' };
    if (Date.now()>p.expiresAt) return { ok:false, error:'Code expired.' };
    if (p.code !== code) return { ok:false, error:'Invalid code.' };
    const user = MOCK_USERS.find(u => u.email.toLowerCase()===email.toLowerCase());
    if (user) user.verified = true;
    Auth._del('avena_verify_'+email);
    return { ok:true, message:'Email verified! You can now log in.' };
  }

  /* 2FA */
  static verify2FA(email, code) {
    const p = Auth._get('avena_2fa_'+email);
    if (!p) return { ok:false, error:'No 2FA session.' };
    if (Date.now()>p.expiresAt) return { ok:false, error:'Code expired.' };
    if (p.code !== code) return { ok:false, error:'Invalid code.' };
    const user = MOCK_USERS.find(u => u.email.toLowerCase()===email.toLowerCase());
    Auth._del('avena_2fa_'+email);
    Session.set(user);
    return { ok:true, user };
  }

  /* FORGOT PASSWORD */
  static async forgotPassword(email) {
    if (!Auth.isUniversityEmail(email)) return { ok:false, error:'Only university emails accepted.' };
    const user = MOCK_USERS.find(u => u.email.toLowerCase()===email.toLowerCase());
    if (user) {
      const token = Auth._token();
      const link  = `${location.origin}/pages/auth/reset-password.html?token=${token}&email=${encodeURIComponent(email)}`;
      Auth._store('avena_reset_'+email, { token, expiresAt: Date.now()+3600_000 });
      await EmailService.send(email, 'Reset your Avena password', EmailService.tplReset(user.firstName, link));
    }
    return { ok:true, message:'If this email exists, a reset link was sent.' };
  }

  /* RESET PASSWORD */
  static resetPassword(email, token, newPassword) {
    const p = Auth._get('avena_reset_'+email);
    if (!p||p.token!==token) return { ok:false, error:'Invalid or expired link.' };
    if (Date.now()>p.expiresAt) return { ok:false, error:'Link expired.' };
    if (newPassword.length<8) return { ok:false, error:'Password too short.' };
    const user = MOCK_USERS.find(u => u.email.toLowerCase()===email.toLowerCase());
    if (user) user.password = `hashed_${newPassword}`;
    Auth._del('avena_reset_'+email);
    return { ok:true, message:'Password updated. You can now log in.' };
  }

  /* LOGOUT */
  static logout() { 
  Session.clear(); 
  window.location.href = '/pages/auth/login.html'; 
}

  static guard(role=null) {
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
    const user = MOCK_USERS.find(u => u.email.toLowerCase()===email.toLowerCase());
    if (!user||user.verified) return { ok:false, error:'Cannot resend.' };
    const code = Auth._code();
    Auth._store('avena_verify_'+email, { code, expiresAt: Date.now()+15*60_000 });
    await EmailService.send(email, 'Your new Avena verification code', EmailService.tplVerify(user.firstName, code));
    return { ok:true, message:'New code sent.' };
  }

  /* Helpers */
  static _code()  { return String(Math.floor(100000+Math.random()*900000)); }
  static _token() { return Math.random().toString(36).slice(2)+Date.now().toString(36); }
  static _store(k,v) { localStorage.setItem(k,JSON.stringify(v)); }
  static _get(k)   { try{ return JSON.parse(localStorage.getItem(k)); }catch{ return null; } }
  static _del(k)   { localStorage.removeItem(k); }
}

window.Auth    = Auth;
window.Session = Session;
window.EmailService = EmailService;