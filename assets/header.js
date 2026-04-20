/**
 * header.js — Nova Style shared header
 * TO UPDATE THE MENU: edit ONLY this file. All pages update automatically.
 */
(function () {
  const NAV_LINKS = [
    { href: "/",                          label: "Accueil" },
    { href: "/categorie/sdb-premium/",    label: "Miroirs SDB Premium" },
    { href: "/categorie/sdb-essentiel/",  label: "Entrée de gamme" },
    { href: "/categorie/salon/",          label: "Salon &amp; dressing" },
    { href: "/categorie/consoles/",       label: "Consoles &amp; entrée" },
    { href: "/categorie/tables/",         label: "Tables de séjour" },
    { href: "/categorie/douches/",        label: "Douches italiennes" },
  ];

  const ANNOUNCE = "Acompte de 50% requis pour confirmer votre commande · Livraison partout au Maroc";
  const navItems = NAV_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join("\n    ");

  document.write(`<div class="announce">${ANNOUNCE}</div>
<header class="site-header" id="nova-site-header">
  <a href="/" class="brand">
    <img src="/assets/logo.png" alt="Nova Style" class="logo">
    <div>
      <div class="brand-name">Nova Style</div>
      <div class="tagline">La beauté dans le miroir</div>
    </div>
  </a>
  <button class="menu-toggle" id="menu-toggle" aria-label="Ouvrir le menu" aria-expanded="false" type="button">
    <span></span><span></span><span></span>
  </button>
  <nav class="main-nav" id="main-nav">
    ${navItems}
  </nav>
  <a href="/cart.html" class="cart-icon-link" id="header-cart-link" title="Voir le panier">
    <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span id="cart-icon-badge" class="cart-badge">0</span>
  </a>
</header>
<style>
  .menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 36px; height: 36px;
    padding: 8px 4px;
    background: none; border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .menu-toggle span {
    display: block; height: 2px; width: 100%;
    background: var(--text, #333);
    border-radius: 2px;
    transition: transform 0.25s, opacity 0.25s;
    pointer-events: none;
  }
  .menu-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(9px) rotate(45deg); }
  .menu-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .menu-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }

  #header-cart-link {
    position: relative; display: flex; align-items: center;
    color: inherit; text-decoration: none; margin-left: 10px;
    flex-shrink: 0;
  }
  .cart-icon { width: 24px; height: 24px; }
  .cart-badge {
    position: absolute; top: -8px; right: -8px;
    background: var(--accent, #e8194b); color: #fff;
    font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;
    border-radius: 9px; display: none; align-items: center;
    justify-content: center; padding: 0 4px;
  }

  @media (max-width: 768px) {
    .menu-toggle { display: flex; }
    #nova-site-header { position: relative; flex-wrap: nowrap; }
    #main-nav {
      display: none;
      flex-direction: column;
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--card, #fff);
      border-top: 2px solid var(--accent, #e8194b);
      z-index: 9999;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
    }
    #main-nav.open { display: flex; }
    #main-nav a {
      padding: 15px 20px;
      border-bottom: 1px solid var(--border, #eee);
      font-size: 15px;
    }
    #main-nav a:last-child { border-bottom: none; }
  }
</style>`);

  function init() {
    const toggle = document.getElementById("menu-toggle");
    const nav    = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    // ── Toggle click — stopPropagation so the document handler never sees it ──
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // ── Close when clicking a nav link ──────────────────────────────────────
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // ── Close on outside click (toggle click never reaches document) ────────
    document.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });

    // ── Highlight active link ────────────────────────────────────────────────
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    nav.querySelectorAll("a").forEach(function (a) {
      const href = (a.getAttribute("href") || "").replace(/\/$/, "") || "/";
      if (href === path || (href !== "/" && path.startsWith(href))) {
        a.style.color      = "var(--accent, #e8194b)";
        a.style.fontWeight = "700";
      }
    });

    updateCartBadge();
    document.addEventListener("cartUpdated", updateCartBadge);
  }

  function updateCartBadge() {
    const badge = document.getElementById("cart-icon-badge");
    if (!badge) return;
    try {
      const items = JSON.parse(localStorage.getItem("nova_style_cart") || "[]");
      const count = Array.isArray(items) ? items.reduce(function(s,i){ return s+(i.quantity||1); }, 0) : 0;
      badge.textContent    = count;
      badge.style.display  = count > 0 ? "inline-flex" : "none";
    } catch (e) {
      badge.style.display = "none";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.refreshCartDisplay = function () {
    updateCartBadge();
    document.dispatchEvent(new Event("cartUpdated"));
  };
})();
