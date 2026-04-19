import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Votre configuration Firebase
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

/**
 * 1. AJOUT AU PANIER (Appelé par vos 90 pages)
 */
function addToCart(productId, product, options) {
    let cart = JSON.parse(localStorage.getItem('nova_style_cart') || '[]');
    
    // On ajoute l'article au stockage local
    cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        options: options,
        timestamp: Date.now()
    });
    
    localStorage.setItem('nova_style_cart', JSON.stringify(cart));
    console.log("Produit ajouté :", product.name);
}

/**
 * 2. VALIDATION FINALE (Envoi vers Firebase)
 */
function finalizeCheckout(customerDetails) {
    const cart = JSON.parse(localStorage.getItem('nova_style_cart') || '[]');
    
    if (cart.length === 0) return alert("Votre panier est vide");

    const orderData = {
        customer: customerDetails,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price || 0), 0),
        status: 'En attente',
        timestamp: Date.now(),
        dateString: new Date().toLocaleString('fr-MA')
    };

    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);

    set(newOrderRef, orderData).then(() => {
        localStorage.removeItem('nova_style_cart');
        window.location.href = "/success.html";
    }).catch(err => alert("Erreur de connexion : " + err.message));
}

// À mettre à la toute fin de cart.js
// --- RENDRE LES FONCTIONS ACCESSIBLES ---
window.getCart = getCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.finalizeCheckout = finalizeCheckout;

// Forcer la mise à jour du badge quand un produit est ajouté
document.dispatchEvent(new CustomEvent('cartUpdated'));