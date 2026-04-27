/**
 * ============================================================
 *  AVENA — Messaging Module
 *  assets/js/modules/messaging.js
 *
 *  Features: inbox, send, conversations, unread count
 *  MOCK: localStorage  |  PROD: POST/GET /api/messages + WebSocket
 * ============================================================
 */
'use strict';

const MessagingDB = {
  KEY: 'avena_messages',
  getAll()   { try{return JSON.parse(localStorage.getItem(this.KEY)??'[]');}catch{return[];} },
  save(msgs) { localStorage.setItem(this.KEY,JSON.stringify(msgs)); },

  getConversations(userId) {
    const msgs = this.getAll();
    const map  = {};
    msgs.forEach(m => {
      const otherId = m.from===userId ? m.to : m.to===userId ? m.from : null;
      if (!otherId) return;
      if (!map[otherId] || new Date(m.sentAt)>new Date(map[otherId].lastMsg.sentAt))
        map[otherId] = { otherId, otherName:m.from===userId?m.toName:m.fromName, lastMsg:m, unread:0 };
      if (m.to===userId && !m.read) map[otherId].unread++;
    });
    return Object.values(map).sort((a,b)=>new Date(b.lastMsg.sentAt)-new Date(a.lastMsg.sentAt));
  },

  getThread(userId, otherId) {
    return this.getAll()
      .filter(m=>(m.from===userId&&m.to===otherId)||(m.from===otherId&&m.to===userId))
      .sort((a,b)=>new Date(a.sentAt)-new Date(b.sentAt));
  },

  markRead(userId, otherId) {
    const msgs = this.getAll().map(m=>{
      if(m.to===userId&&m.from===otherId) m.read=true;
      return m;
    });
    this.save(msgs);
  },

  totalUnread(userId) {
    return this.getAll().filter(m=>m.to===userId&&!m.read).length;
  },
};

class Messaging {
  static async send({ from, fromName, to, toName, subject, body }) {
    if (!from||!to||!body?.trim()) return { ok:false, error:'Message body is required.' };
    const msg = {
      id:`msg_${Date.now()}`, from, fromName, to, toName,
      subject:subject||'(no subject)', body:body.trim(),
      read:false, sentAt:new Date().toISOString(),
    };
    const msgs = MessagingDB.getAll();
    msgs.push(msg);
    MessagingDB.save(msgs);
    /* PRODUCTION: POST /api/messages + emit via socket.io */
    return { ok:true, message:'Message sent.', msg };
  }

  static getConversations(userId) { return MessagingDB.getConversations(userId); }
  static getThread(userId,otherId) { return MessagingDB.getThread(userId,otherId); }
  static markRead(userId,otherId)  { MessagingDB.markRead(userId,otherId); }
  static totalUnread(userId)       { return MessagingDB.totalUnread(userId); }

  static formatTime(iso) {
    const d=new Date(iso), now=new Date();
    if(d.toDateString()===now.toDateString()) return d.toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'});
    return d.toLocaleDateString('en-GH',{month:'short',day:'numeric'});
  }

  /* Seed a system message (e.g. from paid event registration) */
  static seedEventChat({ fromUser, toUser, eventTitle }) {
    Messaging.send({
      from:     toUser.id,
      fromName: toUser.name,
      to:       fromUser.id,
      toName:   `${fromUser.firstName} ${fromUser.lastName}`,
      subject:  `Re: ${eventTitle}`,
      body:     `Hi ${fromUser.firstName}! Thanks for your interest in "${eventTitle}". Please reply with your payment details or any questions.`,
    });
  }
}

window.Messaging   = Messaging;
window.MessagingDB = MessagingDB;