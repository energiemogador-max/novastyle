import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Remplacez votre ancienne fonction de validation finale par celle-ci
function finalizeCheckout(customerDetails) {
    const cart = JSON.parse(localStorage.getItem('nova_style_cart') || '[]');
    
    if (cart.length === 0) return alert("Panier vide");

    const orderData = {
        customer: customerDetails,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'En attente',
        timestamp: Date.now(),
        dateString: new Date().toLocaleString('fr-MA')
    };

    // Envoi à Firebase
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);

    set(newOrderRef, orderData).then(() => {
        localStorage.removeItem('nova_style_cart');
        window.location.href = "/success.html"; // Redirection après succès
    }).catch(error => {
        console.error("Erreur Firebase:", error);
        alert("Erreur lors de la commande.");
    });
}