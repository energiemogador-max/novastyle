// Cart display widget - shows on all pages
document.addEventListener('DOMContentLoaded', function() {
  // Create cart icon in header if not already there
  const header = document.querySelector('.site-header');
  if (!header) return;
  
  // Check if cart icon already exists
  if (document.getElementById('cart-icon-badge')) return;
  
  // Create cart container
  const cartContainer = document.createElement('div');
  cartContainer.className = 'cart-icon-container';
  cartContainer.innerHTML = `
    <a href="/cart.html" class="cart-icon-link" title="Voir le panier">
      <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span id="cart-icon-badge" class="cart-badge">0</span>
    </a>
  `;
  
  // Add to header (before closing header or in a cart section)
  header.appendChild(cartContainer);
  
  // Update cart count
  updateCartCount();
  
  // Listen for cart updates (custom event fired when cart changes)
  document.addEventListener('cartUpdated', updateCartCount);
});

function updateCartCount() {
  const cartKey = 'cart';
  let cartData = localStorage.getItem(cartKey);
  let cartItems = [];
  
  if (cartData) {
    try {
      const parsed = JSON.parse(cartData);
      if (Array.isArray(parsed)) {
        cartItems = parsed;
      } else if (typeof parsed === 'object') {
        // Handle old format (object) by converting to array
        cartItems = Object.values(parsed).filter(v => v && typeof v === 'object' && v.name);
      }
    } catch (e) {
      // Corrupted data, start fresh
      cartItems = [];
    }
  }
  
  // Calculate total items (sum of quantities)
  const totalItems = cartItems.reduce((sum, item) => {
    return sum + (item.quantity || 1);
  }, 0);
  
  // Update badge
  const badge = document.getElementById('cart-icon-badge');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
  }
}

// Expose function for cart.html to call when it updates cart
window.refreshCartDisplay = function() {
  updateCartCount();
  document.dispatchEvent(new Event('cartUpdated'));
};
