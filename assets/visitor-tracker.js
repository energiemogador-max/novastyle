// Visitor Tracking System for Nova Style
// Tracks page visits and user activity with session history

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
    
    // Keep last 5000 visits
    if (visits.length > 5000) {
      visits = visits.slice(-5000);
    }
    
    localStorage.setItem('nova_visitor_tracking', JSON.stringify(visits));
  } catch (e) {
    console.error('Visitor tracking error:', e);
  }
  
  // Update visitor session
  updateVisitorSession(visitorId, currentPage);
}

function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('nova_visitor_id');
  
  if (!visitorId) {
    visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('nova_visitor_id', visitorId);
  }
  
  return visitorId;
}

function updateVisitorSession(visitorId, page) {
  try {
    let sessions = JSON.parse(localStorage.getItem('nova_visitor_sessions') || '{}');
    
    if (!sessions[visitorId]) {
      sessions[visitorId] = {
        visitorId: visitorId,
        firstVisit: Date.now(),
        sessionStart: Date.now(),
        lastSeen: Date.now(),
        lastPage: page,
        pages: [page],
        pageCount: 1,
        visitCount: 1,
        isActive: true
      };
    } else {
      const session = sessions[visitorId];
      session.lastSeen = Date.now();
      session.lastPage = page;
      session.visitCount = (session.visitCount || 0) + 1;
      session.isActive = true;
      
      if (!session.pages) session.pages = [];
      if (!session.pages.includes(page)) {
        session.pages.push(page);
        session.pageCount = session.pages.length;
      }
    }
    
    localStorage.setItem('nova_visitor_sessions', JSON.stringify(sessions));
  } catch (e) {
    console.error('Session update error:', e);
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
      return 'Produit: ' + parts[parts.length - 1].replace(/-/g, ' ').substring(0, 20);
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

// Update activity every 5 seconds to mark as active
setInterval(() => {
  const visitorId = localStorage.getItem('nova_visitor_id');
  if (visitorId) {
    updateVisitorSession(visitorId, window.location.pathname || '/');
  }
}, 5000);

// Mark as inactive after 15 minutes of no activity
setInterval(() => {
  try {
    let sessions = JSON.parse(localStorage.getItem('nova_visitor_sessions') || '{}');
    const now = Date.now();
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    
    for (let visitorId in sessions) {
      if ((now - sessions[visitorId].lastSeen) > INACTIVITY_TIMEOUT) {
        sessions[visitorId].isActive = false;
      }
    }
    
    localStorage.setItem('nova_visitor_sessions', JSON.stringify(sessions));
  } catch (e) {
    console.error('Inactivity check error:', e);
  }
}, 60000); // Check every minute

