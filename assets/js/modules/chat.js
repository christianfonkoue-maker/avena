/**
 * AVENA — Chat Module
 * assets/js/modules/chat.js
 * 
 * Gère l'ouverture d'une conversation avec contexte (produit, service, etc.)
 */

'use strict';

const ChatModule = (function() {
  
  function openChatWithContext(userId, userName, context = null) {
    const currentUser = Session.get();
    if (!currentUser) {
      window.location.href = '/pages/auth/login.html';
      return;
    }
    
    // Créer la modale
    const modal = document.createElement('avenna-modal');
    modal.setAttribute('title', `Contacter ${userName}`);
    
    let contextHtml = '';
    if (context && context.type === 'product') {
      contextHtml = `
        <div style="display: flex; gap: 12px; margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 12px;">
          <img src="${context.image || 'https://placehold.co/50x50/4361ee/fff?text=Product'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
          <div>
            <div style="font-weight: 700;">${escapeHtml(context.title)}</div>
            <div style="font-size: 0.75rem; color: #7a7f9a;">À propos de ce produit</div>
          </div>
        </div>
      `;
    }
    
    modal.innerHTML = `
      ${contextHtml}
      <textarea id="chatMessage" rows="4" style="width: 100%; padding: 12px; border: 1px solid #e2e6f3; border-radius: 12px; font-family: inherit;" placeholder="Votre message..."></textarea>
      <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end;">
        <button class="btn-secondary" id="cancelChatBtn">Annuler</button>
        <button class="btn-primary" id="sendChatBtn">Envoyer</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.show();
    
    // Message par défaut
    const defaultMessage = context?.type === 'product' 
      ? `Bonjour ${userName},\n\nJe suis intéressé par votre produit "${context.title}". Est-il toujours disponible ?\n\nMerci.`
      : `Bonjour ${userName},\n\nJe suis intéressé par votre offre. Pourrions-nous discuter ?\n\nMerci.`;
    
    const textarea = modal.querySelector('#chatMessage');
    textarea.value = defaultMessage;
    
    modal.querySelector('#cancelChatBtn').addEventListener('click', () => modal.hide());
    modal.querySelector('#sendChatBtn').addEventListener('click', async () => {
      const message = textarea.value.trim();
      if (!message) return;
      
      const result = await Messaging.send({
        from: currentUser.id,
        fromName: `${currentUser.first_name} ${currentUser.last_name}`,
        to: userId,
        toName: userName,
        subject: context?.type === 'product' ? `Intérêt pour : ${context.title}` : 'Nouveau message',
        body: message + (context?.type === 'product' ? `\n\n---\nProduit : ${context.title}\nID: ${context.id}` : '')
      });
      
      modal.hide();
      modal.remove();
      
      if (result.ok) {
        alert('Message envoyé ! Le vendeur vous répondra dans la messagerie.');
        window.location.href = '/pages/messaging/inbox.html';
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    });
  }
  
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
  }
  
  return { openChatWithContext };
})();

window.ChatModule = ChatModule;