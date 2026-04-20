<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nova Style — Panier</title>
<meta name="description" content="Votre panier Nova Style - Procédez à la commande">
<link rel="stylesheet" href="/assets/style.css">

<style>
  .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
  .cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .cart-header h1 { font-size: 28px; margin: 0; }
  .continue-btn { background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
  .continue-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }
  .checkout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 30px; }
  @media (max-width: 900px) { .checkout-grid { grid-template-columns: 1fr; } }
  .cart-items { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .cart-items h2 { font-size: 18px; margin-top: 0; margin-bottom: 20px; }
  .empty-cart { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-cart-btn { display: inline-block; background: var(--accent); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; }
  .cart-item { display: grid; grid-template-columns: 1fr auto auto auto; gap: 12px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border); }
  .cart-item:last-child { border-bottom: none; }
  .item-name { font-weight: 500; }
  .item-price { color: var(--accent); font-weight: 600; min-width: 100px; text-align: right; }
  .item-qty { display: flex; align-items: center; gap: 8px; border: 1px solid var(--border); border-radius: 4px; padding: 4px 8px; }
  .qty-btn { background: none; border: none; cursor: pointer; font-weight: bold; color: var(--text); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
  .qty-btn:hover { background: var(--accent-dim); }
  .qty-input { width: 40px; border: none; background: none; text-align: center; font-weight: 600; }
  .remove-btn { background: var(--red); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; transition: opacity 0.2s; }
  .remove-btn:hover { opacity: 0.8; }
  .checkout-sidebar { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; height: fit-content; display: flex; flex-direction: column; }
  .checkout-sidebar h3 { font-size: 16px; margin-top: 0; margin-bottom: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .form-group label { font-size: 13px; font-weight: 600; color: var(--muted); }
  .form-group input, .form-group textarea { padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit; }
  .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
  .summary { display: flex; flex-direction: column; gap: 10px; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 16px; }
  .summary-line { display: flex; justify-content: space-between; font-size: 14px; }
  .summary-line.total { font-size: 18px; font-weight: 700; color: var(--accent); margin-top: 6px; }
  .checkout-actions { display: flex; flex-direction: column; gap: 10px; }
  .btn-checkout { padding: 12px 16px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; text-align: center; }
  .btn-whatsapp { background: var(--green); color: white; }
  .btn-whatsapp:hover { opacity: 0.9; }
  .btn-form { background: var(--accent); color: white; }
  .btn-form:hover { opacity: 0.9; }
  .notification { background: var(--accent-dim); color: var(--text); border: 1px solid var(--accent); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
  
  /* Modal Styles */
  .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); z-index: 1000; align-items: center; justify-content: center; padding: 20px; }
  .modal-overlay.active { display: flex; }
  .modal-content { background: var(--card); border-radius: 12px; padding: 28px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
  .modal-close { float: right; background: none; border: none; font-size: 28px; cursor: pointer; color: var(--muted); margin-top: -8px; }
  .modal-close:hover { color: var(--text); }
  .modal-form h2 { clear: both; font-size: 20px; margin-bottom: 20px; }
  .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
  .modal-actions button { flex: 1; padding: 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
  .btn-submit { background: var(--green); color: white; }
  .btn-submit:hover { opacity: 0.9; }
  .btn-cancel { background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); }
  .btn-cancel:hover { background: var(--border); }
  
  @media (max-width: 600px) {
    .cart-item { grid-template-columns: 1fr; gap: 8px; }
    .item-price, .item-qty, .remove-btn { grid-column: 1 / -1; }
  }
</style>
</head>
<body>

<script src="/assets/header.js"></script>

<div class="container">
  <div class="cart-header">
    <h1>Votre Panier</h1>
    <button class="continue-btn" onclick="continueShopping()">← Continuer vos achats</button>
  </div>
  
  <div class="checkout-grid">
    <div class="cart-items" id="cart-items-container">
      </div>
    
    <div class="checkout-sidebar">
      <h3>Résumé de commande</h3>
      
      <div class="summary">
        <div class="summary-line">
          <span>Sous-total:</span>
          <span id="subtotal">0 MAD</span>
        </div>
        <div class="summary-line">
          <span>Livraison:</span>
          <span id="shipping">À déterminer</span>
        </div>
        <div class="summary-line total">
          <span>Total:</span>
          <span id="total">0 MAD</span>
        </div>
      </div>
      
      <div id="order-note" class="notification" style="display: none;">
        Note: Un acompte de 50% sera demandé lors de notre prise de contact.
      </div>
      
      <div class="checkout-actions" id="checkout-actions">
        </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="form-modal">
  <div class="modal-content">
    <button class="modal-close" onclick="closeOrderModal()">×</button>
    <div class="modal-form">
      <h2>Détails de Livraison</h2>
      
      <div class="form-group">
        <label>Nom complet *</label>
        <input type="text" id="form-name" placeholder="Votre nom">
      </div>
      
      <div class="form-group">
        <label>Numéro de téléphone *</label>
        <input type="tel" id="form-phone" placeholder="Exemple: 0612345678">
      </div>
      
      <div class="form-group">
        <label>Ville *</label>
        <input type="text" id="form-city" placeholder="Casablanca, Rabat, Marrakech...">
      </div>
      
      <div class="form-group">
        <label>Adresse complète *</label>
        <textarea id="form-address" rows="3" placeholder="Rue, quartier, code postal..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Notes supplémentaires (optionnel)</label>
        <textarea id="form-notes" rows="2" placeholder="Indications pour le livreur..."></textarea>
      </div>
      
      <div style="background: var(--bg-soft); padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 14px;">
        <strong>Total à payer:</strong> <span id="modal-total">0 MAD</span>
      </div>
      
      <div class="modal-actions">
        <button class="btn-submit" onclick="submitOrderToFirebase()">Confirmer la commande</button>
        <button class="btn-cancel" onclick="closeOrderModal()">Annuler</button>
      </div>
    </div>
  </div>
</div>

<footer style="text-align: center; padding: 40px 20px; margin-top: 40px; color: var(--muted); font-size: 13px; border-top: 1px solid var(--border);">
  <p>© 2024 Nova Style · Casablanca · <a href="tel:+212707074748" style="color: var(--accent);">+212 70 70 74 748</a></p>
</footer>

<script type="module" src="/assets/cart.js"></script>

<script>
function renderCart() {
  const cart = window.getCart ? window.getCart() : [];
  const container = document.getElementById('cart-items-container');
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Votre panier est vide</p>
        <a href="/categorie/sdb-premium/" class="empty-cart-btn">Parcourir les miroirs</a>
      </div>
    `;
    updateCheckoutButtons(cart);
    return;
  }
  
  const cartHTML = `
    <h2>Articles dans votre panier (${cart.length})</h2>
    ${cart.map(item => `
      <div class="cart-item">
        <div class="item-name">
          <div><strong>${item.name}</strong></div>
          ${item.options ? `
            <div style="font-size: 12px; color: var(--muted); margin-top: 6px;">
              ${Object.entries(item.options).map(([k, v]) => `<div>• ${k}: ${v}</div>`).join('')}
            </div>
          ` : ''}
          <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">${window.formatPrice(item.price)} / unité</div>
        </div>
        <div class="item-qty">
          <button class="qty-btn" onclick="window.updateQuantity('${item.key}', ${item.quantity - 1}); renderCart();">−</button>
          <input type="number" class="qty-input" value="${item.quantity}" readonly>
          <button class="qty-btn" onclick="window.updateQuantity('${item.key}', ${item.quantity + 1}); renderCart();">+</button>
        </div>
        <div class="item-price">${window.formatPrice(item.price * item.quantity)}</div>
        <button class="remove-btn" onclick="removeItem('${item.key}')">Retirer</button>
      </div>
    `).join('')}
  `;
  
  container.innerHTML = cartHTML;
  updateSummary();
  updateCheckoutButtons(cart);
}

function updateSummary() {
  if(!window.getCartTotal) return;
  const total = window.getCartTotal();
  document.getElementById('subtotal').textContent = window.formatPrice(total);
  document.getElementById('total').textContent = window.formatPrice(total);
  document.getElementById('modal-total').textContent = window.formatPrice(total);
}

function removeItem(itemKey) {
  if (confirm('Êtes-vous sûr de vouloir retirer cet article ?')) {
    window.removeFromCart(itemKey);
    renderCart();
  }
}

function updateCheckoutButtons(cart) {
  const actionsDiv = document.getElementById('checkout-actions');
  const noteDiv = document.getElementById('order-note');
  
  if (cart.length === 0) {
    actionsDiv.innerHTML = '';
    noteDiv.style.display = 'none';
    return;
  }
  
  noteDiv.style.display = 'block';
  const total = window.getCartTotal();
  
  // Formatage propre pour WhatsApp
  const cartSummary = encodeURIComponent(cart.map(i => {
    let line = `${i.quantity}x ${i.name}`;
    if (i.options) {
      line += ` (${Object.entries(i.options).map(([k, v]) => `${k}: ${v}`).join(', ')})`;
    }
    return line;
  }).join('\n'));
  
  const whatsappUrl = `https://wa.me/212707074748?text=Bonjour%2C%20je%20souhaite%20commander%20%3A%0A%0A${cartSummary}%0A%0ATotal%20%3A%20${window.formatPrice(total).replace(/\s/g, '%20')}`;
  
  actionsDiv.innerHTML = `
    <button onclick="openOrderModal()" class="btn-checkout btn-form">
      📝 Commander (Paiement à la livraison)
    </button>
    <a href="${whatsappUrl}" target="_blank" class="btn-checkout btn-whatsapp">
      💬 Commander via WhatsApp
    </a>
  `;
}

function openOrderModal() {
  document.getElementById('form-modal').classList.add('active');
}

function closeOrderModal() {
  document.getElementById('form-modal').classList.remove('active');
}

// 🚀 LA CONNEXION AVEC FIREBASE SE FAIT ICI
function submitOrderToFirebase() {
  const customerDetails = {
    name: document.getElementById('form-name').value,
    phone: document.getElementById('form-phone').value,
    city: document.getElementById('form-city').value,
    address: document.getElementById('form-address').value,
    notes: document.getElementById('form-notes').value
  };

  // On appelle la fonction de cart.js qui gère la vérification et l'envoi Firebase
  if (window.finalizeCheckout) {
    window.finalizeCheckout(customerDetails);
  } else {
    alert("Le système de commande n'est pas encore prêt. Veuillez patienter une seconde.");
  }
}

function continueShopping() {
  window.location.href = '/categorie/sdb-premium/';
}

// Sécurité pour fermer le modal en cliquant à l'extérieur
document.getElementById('form-modal').addEventListener('click', function(e) {
  if (e.target === this) closeOrderModal();
});

// Attendre que cart.js (module) soit chargé pour faire le premier rendu
window.addEventListener('load', () => {
  setTimeout(renderCart, 100); 
});
</script>

</body>
</html>