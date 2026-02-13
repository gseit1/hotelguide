// API Configuration
// Automatically detects if we're running locally or in production
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api'; // Netlify will proxy this to Render backend

// Export for use in other scripts
window.API_CONFIG = {
  API_URL
};
