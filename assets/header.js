/**
 * header.js — Nova Style shared header
 * ─────────────────────────────────────
 * HOW TO USE IN EVERY PAGE:
 * 1. Delete the <div class="announce">…</div> and <header>…</header> blocks.
 * 2. Replace them with ONE line:
 * <script src="/assets/header.js"></script>
 * 3. Also delete any <script src="/assets/cart-display.js"> — this file handles it.
 *
 * TO UPDATE THE MENU: edit ONLY this file. All pages update automatically.
 */

(function () {
  // ─── Navigation links (edit here to update all pages) ────────────────────
  const NAV_LINKS = [
    { href: "/",                          label: "Accueil" },
    { href: "/categorie/sdb-premium/",    label: "Miroirs SDB Premium" },
    { href: "/categorie/sdb-essentiel/",  label: "Entrée de gamme" },
    { href: "/categorie/salon/",          label: "Salon &amp; dressing" },
    { href: "/categorie/consoles/",       label: "Consoles &amp; entrée" },
    { href: "/categorie/tables/",         label: "Tables de séjour" },
    { href: "/categorie/douches/",        label: "Douches italiennes" },
  ];

  // ─── Announce bar text ───────────────────────────────────────────────────
  const ANNOUNCE = "Acompte de 50% requis pour confirmer votre commande · Livraison partout au Maroc";

  // ─── Build HTML ──────────────────────────────────────────────────────────
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

  // ─── LOGIC ───────────────────────────────────────────────────────────────
  function init() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
        const isOpen = nav.classList.contains("open");
        toggle.setAttribute("aria-expanded", isOpen);
      });

      // Close when clicking outside
      document.addEventListener("click", function (e) {
        if (!nav.contains(e.target) && e.target !== toggle) {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Highlight active nav link
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    document.querySelectorAll("#main-nav a").forEach(a => {
      const href = a.getAttribute("href").replace(/\/$/, "") || "/";
      if (href === path || (href !== "/" && path.startsWith(href))) {
        a.style.color = "var(--accent, #e8194b)";
        a.style.fontWeight = "700";
      }
    });

    updateCartBadge();
    document.addEventListener("cartUpdated", updateCartBadge);
    
    // --- L'injection propre pour Google Business ---
    injectLocalBusinessSchema();
  }

  function updateCartBadge() {
    const badge = document.getElementById("cart-icon-badge");
    if (!badge) return;
    try {
      const items = JSON.parse(localStorage.getItem("nova_style_cart") || "[]");
      const count = Array.isArray(items)
        ? items.reduce((s, i) => s + (i.quantity || 1), 0)
        : 0;
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    } catch {
      badge.style.display = "none";
    }
  }

  function injectLocalBusinessSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FurnitureStore",
      "name": "Nova Style",
      "image": "https://novastyle.ma/assets/logo.png",
      "url": "https://novastyle.ma",
      "telephone": "+212707074748",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Votre Adresse", 
        "addressLocality": "Casablanca",
        "addressCountry": "MA"
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();