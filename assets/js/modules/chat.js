/**
 * AVENA — Chat Module (WebSocket + UI)
 * assets/js/modules/chat.js
 */

'use strict';

const ChatManager = (function() {
  let socket = null;
  let currentUser = null;
  let currentOtherUserId = null;
  let currentOtherUserName = '';
  let onMessageCallback = null;

  // Connexion WebSocket
  function connect(userId) {
    if (socket && socket.connected) return;

    const API_URL = window.APP_CONFIG?.API_URL || 'https://avena-backend-os8d.onrender.com';
    socket = io(API_URL);

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      socket.emit('user:join', userId);
      currentUser = userId;
    });

    socket.on('message:received', (data) => {
      const message = data.message || data;
      if (onMessageCallback) {
        onMessageCallback(message);
      }
      // Mettre à jour les conversations si nécessaire
      window.dispatchEvent(new CustomEvent('message-received', { detail: message }));
    });

    socket.on('disconnect', () => console.log('🔌 WebSocket disconnected'));
  }

  // Envoyer un message en temps réel
 // Envoyer un message et l'ajouter instantanément à l'interface
async function sendMessageAndUpdateUI(otherUserId, body, containerId) {
  const user = Session.get();
  if (!user) return false;

  // Ajouter le message dans l'UI tout de suite (optimiste)
  appendMessage(containerId, {
    body: body,
    senderId: user.id,
    createdAt: new Date().toISOString()
  }, 'mine');

  // Envoyer via WebSocket
  if (socket && socket.connected) {
    socket.emit('message:send', {
      to: otherUserId,
      body: body,
      subject: '',
      senderName: `${user.first_name} ${user.last_name}`
    });
    return true;
  }

  // Fallback via API
  const result = await MessagingAPI.sendMessage(otherUserId, body);
  return result.ok;
}

  // Définir le callback pour les nouveaux messages
  function onNewMessage(callback) {
    onMessageCallback = callback;
  }

  // Ouvrir une conversation
  async function openConversation(otherUserId, otherUserName, containerId, onMessageSent = null) {
    currentOtherUserId = otherUserId;
    currentOtherUserName = otherUserName;

    // Marquer comme lu
    await MessagingAPI.markAsRead(otherUserId);

    // Charger les messages existants
    const messages = await MessagingAPI.getConversation(otherUserId);
    renderMessages(containerId, messages);

    // Callback pour les nouveaux messages
    onNewMessage((message) => {
      if (message.senderId === otherUserId || message.receiverId === otherUserId) {
        appendMessage(containerId, message, 'theirs');
      }
    });

    if (onMessageSent) {
      // Lier l'envoi
      const sendBtn = document.querySelector('#sendMessageBtn');
      const input = document.querySelector('#messageInput');
      if (sendBtn && input) {
        const handler = () => {
          const body = input.value.trim();
          if (!body) return;
          sendMessage(otherUserId, body, '');
          input.value = '';
          if (onMessageSent) onMessageSent(body);
        };
        sendBtn.onclick = handler;
        input.onkeypress = (e) => { if (e.key === 'Enter') handler(); };
      }
    }
  }

  function renderMessages(containerId, messages) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!messages.length) {
      container.innerHTML = '<div class="no-messages">💬 Aucun message. Commencez la conversation !</div>';
      return;
    }

    container.innerHTML = messages.map(msg => {
      const isMine = msg.senderId === currentUser;
      return `
        <div class="chat-message ${isMine ? 'mine' : 'theirs'}">
          <div class="message-bubble">
            <div class="message-text">${escapeHtml(msg.body)}</div>
            <div class="message-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
        </div>
      `;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  function appendMessage(containerId, message, sender) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isMine = sender === 'mine' || message.senderId === currentUser;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isMine ? 'mine' : 'theirs'}`;
    msgDiv.innerHTML = `
      <div class="message-bubble">
        <div class="message-text">${escapeHtml(message.body)}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
      </div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
  }

  return {
    connect,
    sendMessage,
    openConversation,
    onNewMessage,
    getAPI: () => MessagingAPI
  };
})();

window.ChatManager = ChatManager;