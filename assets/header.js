/**
 * header.js — Nova Style shared header & Local SEO Injection
 * ──────────────────────────────────────────────────────────
 * Ce fichier gère l'affichage du menu sur toutes les pages
 * et indique à Google que Nova Style est un magasin physique.
 */

(function () {
  // 1. LIENS DE NAVIGATION (Modifie ici pour mettre à jour tout le site)
  const NAV_LINKS = [
    { href: "/",                          label: "Accueil" },
    { href: "/categorie/sdb-premium/",    label: "Miroirs SDB Premium" },
    { href: "/categorie/sdb-essentiel/",  label: "Entrée de gamme" },
    { href: "/categorie/salon/",          label: "Salon & dressing" },
    { href: "/categorie/consoles/",       label: "Consoles & entrée" },
    { href: "/categorie/tables/",         label: "Tables de séjour" },
    { href: "/categorie/douches/",        label: "Douches italiennes" },
  ];

  // 2. BARRE D'ANNONCE
  const ANNOUNCE = "Acompte de 50% requis pour confirmer votre commande · Livraison partout au Maroc";

  // 3. GÉNÉRATION DU HTML
  const navItems = NAV_LINKS.map(l =>
    `<a href="${l.href}">${l.label}</a>`
  ).join("");

  const headerHTML = `
    <div class="announce-bar">${ANNOUNCE}</div>
    <header class="site-header">
      <div class="header-container">
        <button class="menu-toggle" id="menu-toggle" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        
        <a href="/" class="logo">
          <img src="/assets/logo.png" alt="Nova Style Logo">
        </a>

        <nav class="main-nav" id="main-nav">
          ${navItems}
        </nav>

        <div class="header-actions">
          <a href="/cart.html" class="cart-link">
            <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span id="cart-icon-badge" class="cart-badge">0</span>
          </a>
        </div>
      </div>
    </header>
  `;

  document.write(headerHTML);

  // 4. LOGIQUE DU MENU MOBILE & BADGE PANIER
  function init() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
        const isOpen = nav.classList.contains("open");
        toggle.setAttribute("aria-expanded", isOpen);
      });

      // Fermer le menu si on clique ailleurs
      document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && e.target !== toggle) {
          nav.classList.remove("open");
        }
      });
    }

    // Highlight du lien actif
    const path = window.location.pathname;
    document.querySelectorAll("#main-nav a").forEach(a => {
      if (a.getAttribute("href") === path) {
        a.classList.add("active");
        a.style.color = "var(--accent, #e8194b)";
      }
    });

    updateCartBadge();
    document.addEventListener("cartUpdated", updateCartBadge);
    
    // Injection du SEO Google Business
    injectLocalBusinessSchema();
  }

  function updateCartBadge() {
    const badge = document.getElementById("cart-icon-badge");
    if (!badge) return;
    try {
      const items = JSON.parse(localStorage.getItem("nova_style_cart") || "[]");
      const count = Array.isArray(items) ? items.reduce((s, i) => s + (i.quantity || 1), 0) : 0;
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    } catch {
      badge.style.display = "none";
    }
  }

  // 5. INJECTION GOOGLE BUSINESS (LOCAL SEO)
  function injectLocalBusinessSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FurnitureStore",
      "name": "Nova Style",
      "image": "https://novastyle.ma/assets/logo.png",
      "@id": "https://novastyle.ma",
      "url": "https://novastyle.ma",
      "telephone": "+212707074748",
      "priceRange": "MAD",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "terminus 35 oulfa CASABLANCA", // <-- REMPLACE PAR TON ADRESSE RÉELLE
        "addressLocality": "Casablanca",
        "postalCode": "20000",
        "addressCountry": "MA"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 33.5731, // <-- OPTIONNEL: TES COORDONNÉES EXACTES
        "longitude": -7.5898
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:00",
          "closes": "19:00"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/novastyle.ma"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  // Lancement
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();