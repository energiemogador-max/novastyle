import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function trackVisitorRealtime() {
    let visitorId = localStorage.getItem('nova_visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('nova_visitor_id', visitorId);
    }

    const visitorRef = ref(db, 'online_visitors/' + visitorId);
    
    const sessionData = {
        id: visitorId,
        lastPage: window.location.pathname,
        lastActive: Date.now(),
        device: navigator.userAgent.includes('Mobi') ? 'Mobile' : 'PC'
    };

    // Met à jour la position du visiteur
    set(visitorRef, sessionData);

    // Supprime automatiquement le visiteur de la liste quand il ferme l'onglet
    onDisconnect(visitorRef).remove();
}

trackVisitorRealtime();