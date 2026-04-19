import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2RjmI_KcLc5j9mcmcyAjdCQjrBNlQjlc",
  authDomain: "nova-9ac76.firebaseapp.com",
  projectId: "nova-9ac76",
  databaseURL: "https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "nova-9ac76.firebasestorage.app",
  messagingSenderId: "645613145752",
  appId: "1:645613145752:web:775e6f8ffce64ae12c4aed"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── CART STORAGE HELPERS ────────────────────────────────────────────────────

function getCart() {
  try {
    const data = localStorage.getItem('nova_style_cart');
    const cart = data ? JSON.parse(data) : [];
    return Array.isArray(cart) ? cart : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('nova_style_cart', JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent('cartUpdated'));
  if (window.refreshCartDisplay) window.refreshCartDisplay();
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// ─── CART OPERATIONS ─────────────────────────────────────────────────────────

/**
 * Add a product to the cart (called by product pages).
 * If the same product+options combo is already in the cart, increments quantity.
 */
function addToCart(productId, product, options) {
  const cart = getCart();
  // Build a stable unique key per product/option combination
  const key = productId + '_' + JSON.stringify(options || {});
  const existing = cart.find(i => i.key === key);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      key:       key,
      id:        productId,
      name:      product.name,
      price:     product.price,
      options:   options || null,
      quantity:  1,
      timestamp: Date.now()
    });
  }

  saveCart(cart);
  console.log("✅ Produit ajouté :", product.name);
}

function removeFromCart(itemKey) {
  saveCart(getCart().filter(i => i.key !== itemKey));
}

function updateQuantity(itemKey, qty) {
  const cart = getCart();
  const item = cart.find(i => i.key === itemKey);
  if (item) {
    item.quantity = Math.max(1, qty);
    saveCart(cart);
  }
}

function clearCart() {
  saveCart([]);
}

// ─── FIREBASE CHECKOUT ───────────────────────────────────────────────────────

function finalizeCheckout(customerDetails) {
  const cart = getCart();
  if (cart.length === 0) return alert("Votre panier est vide");

  const orderData = {
    customer:   customerDetails,
    items:      cart,
    total:      getCartTotal(),
    status:     'En attente',
    timestamp:  Date.now(),
    dateString: new Date().toLocaleString('fr-MA')
  };

  const newOrderRef = push(ref(db, 'orders'));
  set(newOrderRef, orderData)
    .then(() => {
      clearCart();
      window.location.href = "/confirmation.html";
    })
    .catch(err => alert("Erreur de connexion : " + err.message));
}

// ─── EXPOSE TO GLOBAL SCOPE (used by inline scripts) ─────────────────────────
window.getCart         = getCart;
window.saveCart        = saveCart;
window.addToCart       = addToCart;
window.removeFromCart  = removeFromCart;
window.updateQuantity  = updateQuantity;
window.clearCart       = clearCart;
window.getCartTotal    = getCartTotal;
window.formatPrice     = formatPrice;
window.finalizeCheckout = finalizeCheckout;

// Trigger badge refresh on initial load
document.dispatchEvent(new CustomEvent('cartUpdated'));
