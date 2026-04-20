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
const db  = getDatabase(app);

// ─── CART STORAGE HELPERS ──────────────────────────────────────────────────

function getCart() {
  try {
    const data = localStorage.getItem("nova_style_cart");
    const cart = data ? JSON.parse(data) : [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("nova_style_cart", JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent("cartUpdated"));
  if (window.refreshCartDisplay) window.refreshCartDisplay();
}

function getCartTotal() {
  return getCart().reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD",
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(price);
}

// ─── CART OPERATIONS ───────────────────────────────────────────────────────

/**
 * Add a product to the cart.
 * @param {string} productId
 * @param {{ name: string, price: number }} product
 * @param {object|null} options   — variant axes selected by user
 * @param {number} [qty=1]        — quantity (NEW: used by product-qty.js)
 */
function addToCart(productId, product, options, qty) {
  const quantity = Math.max(1, Math.min(99, parseInt(qty) || 1));
  const cart     = getCart();
  const key      = productId + "_" + JSON.stringify(options || {});
  const existing = cart.find(i => i.key === key);

  if (existing) {
    existing.quantity = Math.min(99, (existing.quantity || 1) + quantity);
  } else {
    cart.push({
      key,
      id:        productId,
      name:      product.name,
      price:     product.price,
      options:   options || null,
      quantity,
      timestamp: Date.now()
    });
  }

  saveCart(cart);
  console.log(`✅ Produit ajouté (×${quantity}) :`, product.name);
}

function removeFromCart(itemKey) {
  saveCart(getCart().filter(i => i.key !== itemKey));
}

function updateQuantity(itemKey, qty) {
  const cart = getCart();
  const item = cart.find(i => i.key === itemKey);
  if (item) {
    item.quantity = Math.max(1, Math.min(99, qty));
    saveCart(cart);
  }
}

function clearCart() {
  saveCart([]);
}

// ─── ANTISPAM — client-side rate limiting ──────────────────────────────────
// Max 3 orders per rolling 15-minute window per browser

const SPAM_KEY    = "nova_order_times";
const MAX_ORDERS  = 3;
const WINDOW_MS   = 15 * 60 * 1000; // 15 min

function isRateLimited() {
  try {
    const now    = Date.now();
    const stored = JSON.parse(localStorage.getItem(SPAM_KEY) || "[]");
    const recent = stored.filter(t => now - t < WINDOW_MS);
    if (recent.length >= MAX_ORDERS) return true;
    // Update the list (write happens after successful order, see finalizeCheckout)
    return false;
  } catch {
    return false;
  }
}

function recordOrderTime() {
  try {
    const now    = Date.now();
    const stored = JSON.parse(localStorage.getItem(SPAM_KEY) || "[]");
    const recent = stored.filter(t => now - t < WINDOW_MS);
    recent.push(now);
    localStorage.setItem(SPAM_KEY, JSON.stringify(recent));
  } catch { /* ignore */ }
}

// ─── INPUT SANITISATION ────────────────────────────────────────────────────

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\\/g, "")
    .slice(0, 500);           // hard cap per field
}

function sanitizeCustomer(c) {
  return {
    name:    sanitize(c.name    || ""),
    phone:   sanitize(c.phone   || "").replace(/[^0-9+\s\-()]/g, ""),
    city:    sanitize(c.city    || ""),
    address: sanitize(c.address || ""),
    notes:   sanitize(c.notes   || "").slice(0, 300)
  };
}

// ─── FIREBASE CHECKOUT ─────────────────────────────────────────────────────

function finalizeCheckout(customerDetails) {
  const cart = getCart();
  if (cart.length === 0) { alert("Votre panier est vide"); return; }

  // Antispam check
  if (isRateLimited()) {
    alert("Trop de commandes en peu de temps. Veuillez réessayer dans quelques minutes.");
    return;
  }

  // Validate required fields
  const c = sanitizeCustomer(customerDetails);
  if (!c.name || !c.phone || !c.city || !c.address) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  // Validate phone (Moroccan: starts with 0 or +212, 9-13 digits)
  const phoneDigits = c.phone.replace(/\D/g, "");
  if (phoneDigits.length < 9 || phoneDigits.length > 13) {
    alert("Numéro de téléphone invalide.");
    return;
  }

  const orderData = {
    customer:   c,
    items:      cart.map(i => ({
      name:     sanitize(i.name || ""),
      price:    Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      options:  i.options || null
    })),
    total:      getCartTotal(),
    status:     "En attente",
    timestamp:  Date.now(),
    dateString: new Date().toLocaleString("fr-MA"),
    // Honeypot checked on server (Firebase rules): presence of __hp means spam
  };

  const newOrderRef = push(ref(db, "orders"));
  set(newOrderRef, orderData)
    .then(() => {
      recordOrderTime();
      clearCart();
      window.location.href = "/confirmation.html";
    })
    .catch(err => alert("Erreur de connexion : " + err.message));
}

// ─── EXPOSE TO GLOBAL SCOPE ────────────────────────────────────────────────
window.getCart          = getCart;
window.saveCart         = saveCart;
window.addToCart        = addToCart;
window.removeFromCart   = removeFromCart;
window.updateQuantity   = updateQuantity;
window.clearCart        = clearCart;
window.getCartTotal     = getCartTotal;
window.formatPrice      = formatPrice;
window.finalizeCheckout = finalizeCheckout;

document.dispatchEvent(new CustomEvent("cartUpdated"));
