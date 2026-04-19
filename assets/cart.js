// Cart management using localStorage
const CART_KEY = 'nova_style_cart';

function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, product, options = null) {
  const cart = getCart();
  
  // Create unique key including options
  const optionKey = options ? JSON.stringify(options) : '';
  const itemKey = `${productId}|${optionKey}`;
  
  const item = cart.find(i => i.key === itemKey);
  
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({
      key: itemKey,
      id: productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      options: options || null
    });
  }
  
  saveCart(cart);
  showNotification('Produit ajouté au panier');
}

function removeFromCart(itemKey) {
  let cart = getCart();
  cart = cart.filter(i => i.key !== itemKey);
  saveCart(cart);
}

function updateQuantity(itemKey, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.key === itemKey);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(itemKey);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(price);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = getCartCount();
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

// Update badge on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateCartBadge);
} else {
  updateCartBadge();
}
