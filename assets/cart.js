// Scripts Firebase (Version compatible pour script classique)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2RjmI_KcLc5j9mcmcyAjdCQjrBNlQjlc",
  authDomain: "nova-9ac76.firebaseapp.com",
  projectId: "nova-9ac76",
  databaseURL: "https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app", // Vérifie cette URL dans ton onglet Realtime Database
  storageBucket: "nova-9ac76.firebasestorage.app",
  messagingSenderId: "645613145752",
  appId: "1:645613145752:web:775e6f8ffce64ae12c4aed"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ta fonction qui valide la commande (ajoute ce code dedans)
function saveOrderToCloud(orderDetails) {
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    
    set(newOrderRef, {
        ...orderDetails,
        date: new Date().toISOString(),
        status: 'new'
    }).then(() => {
        console.log("Commande synchronisée sur le Cloud !");
    });
}
