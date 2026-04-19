// Visitor Tracking System for Nova Style
// Tracks page visits and user activity

function trackVisitor() {
  const visitorId = getOrCreateVisitorId();
  const currentPage = window.location.pathname || '/';
  const timestamp = Date.now();
  
  const visit = {
    visitorId: visitorId,
    page: currentPage,
    timestamp: timestamp,
    userAgent: navigator.userAgent,
    referrer: document.referrer || 'direct'
  };
  
  // Save visit to localStorage
  try {
    let visits = JSON.parse(localStorage.getItem('nova_visitor_tracking') || '[]');
    visits.push(visit);
    
    // Keep only last 1000 visits to avoid storage issues
    if (visits.length > 1000) {
      visits = visits.slice(-1000);
    }
    
    localStorage.setItem('nova_visitor_tracking', JSON.stringify(visits));
  } catch (e) {
    console.error('Visitor tracking error:', e);
  }
  
  // Update visitor last seen
  updateVisitorActivity(visitorId, currentPage);
}

function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('nova_visitor_id');
  
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('nova_visitor_id', visitorId);
  }
  
  return visitorId;
}

function updateVisitorActivity(visitorId, page) {
  try {
    let visitors = JSON.parse(localStorage.getItem('nova_active_visitors') || '{}');
    
    visitors[visitorId] = {
      visitorId: visitorId,
      lastPage: page,
      lastSeen: Date.now(),
      firstVisit: visitors[visitorId]?.firstVisit || Date.now(),
      visitCount: (visitors[visitorId]?.visitCount || 0) + 1
    };
    
    localStorage.setItem('nova_active_visitors', JSON.stringify(visitors));
  } catch (e) {
    console.error('Activity update error:', e);
  }
}

function getPageName(path) {
  const pathMap = {
    '/': 'Accueil',
    '/index.html': 'Accueil',
    '/shop.html': 'Boutique',
    '/shop': 'Boutique',
    '/cart.html': 'Panier',
    '/cart': 'Panier',
    '/admin.html': 'Admin',
    '/admin': 'Admin'
  };
  
  if (pathMap[path]) return pathMap[path];
  
  // Extract product name from path
  if (path.includes('/produits/')) {
    const parts = path.split('/').filter(p => p && p !== 'produits' && p !== 'index.html');
    if (parts.length > 0) {
      return 'Produit: ' + parts[parts.length - 1].replace(/-/g, ' ');
    }
  }
  
  if (path.includes('/categorie/')) {
    const category = path.split('/categorie/')[1].replace(/\/$/, '');
    return 'Catégorie: ' + category;
  }
  
  return path;
}

// Track on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', trackVisitor);
} else {
  trackVisitor();
}

// Update activity every 10 seconds to mark as active
setInterval(() => {
  const visitorId = localStorage.getItem('nova_visitor_id');
  if (visitorId) {
    updateVisitorActivity(visitorId, window.location.pathname || '/');
  }
}, 10000);
