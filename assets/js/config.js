// assets/js/config.js
const ENV = {
  // Détection automatique de l'environnement
  isLocal: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // URL de l'API
  get API_URL() {
    return this.isLocal 
      ? 'http://localhost:5000'
      : 'https://avena-backend-os8d.onrender.com';
  }
};

// Exporter (accessible partout)
window.APP_CONFIG = ENV;