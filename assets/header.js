/**
 * header.js — Nova Style shared header
 * Layout: [Logo] [Nav — left-aligned] [→ auto] [WhatsApp] [Cart] [Hamburger]
 * Mobile: left-slide drawer
 */
(function () {
  const NAV_LINKS = [
    { href: "/categorie/sdb-premium/",   label: "Miroir salle de bain premium" },
    { href: "/categorie/sdb-essentiel/", label: "Miroir entrée de gamme" },
    { href: "/categorie/salon/",         label: "Miroir de salon &amp; dressing" },
    { href: "/categorie/tables/",        label: "Table &amp; chaise" },
    { href: "/categorie/douches/",       label: "Douches italiennes" },
    { href: "/blog/",                    label: "Blog" },
  ];

  const ANNOUNCE = "Fabrication sur mesure · Verre AGC Belgique · Livraison partout au Maroc";
  const navItems = NAV_LINKS.map(l => '<a href="' + l.href + '">' + l.label + '</a>').join("\n    ");

  const html =
'<div class="announce">' + ANNOUNCE + '</div>\n' +
'<header class="site-header" id="nova-site-header">\n' +
'  <a href="/" class="brand">\n' +
'    <img src="/assets/logo.png" alt="Nova Style" class="logo" width="44" height="44" fetchpriority="high">\n' +
'    <span class="brand-name">Nova Style</span>\n' +
'  </a>\n' +
'  <nav class="main-nav" id="main-nav">\n' +
'    ' + navItems + '\n' +
'  </nav>\n' +
'  <div class="header-right">\n' +
'    <a href="https://wa.me/212707074748" class="header-wa" target="_blank" rel="noopener">💬 WhatsApp</a>\n' +
'    <a href="/cart.html" class="cart-icon-link" id="header-cart-link" title="Panier">\n' +
'      <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">\n' +
'        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>\n' +
'        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>\n' +
'      </svg>\n' +
'      <span id="cart-icon-badge" class="cart-badge">0</span>\n' +
'    </a>\n' +
'    <button class="menu-toggle" id="menu-toggle" aria-label="Menu" aria-expanded="false" type="button">\n' +
'      <span></span><span></span><span></span>\n' +
'    </button>\n' +
'  </div>\n' +
'</header>\n' +
'<div class="nav-overlay" id="nav-overlay"></div>\n' +
'<style>\n' +
'.site-header{display:flex;align-items:center;gap:28px;padding:12px 24px;border-bottom:1px solid var(--border);position:sticky;top:0;background:#fff;z-index:200;}\n' +
'.brand{display:flex;align-items:center;gap:10px;flex-shrink:0;text-decoration:none;}\n' +
'.logo{width:44px;height:44px;border-radius:6px;}\n' +
'.brand-name{font-size:17px;font-weight:700;letter-spacing:1.5px;color:var(--text);}\n' +
'.main-nav{display:flex;gap:2px;}\n' +
'.main-nav a{font-size:13.5px;font-weight:500;color:var(--text-soft,#555);padding:7px 11px;border-radius:7px;transition:background .15s,color .15s;white-space:nowrap;}\n' +
'.main-nav a:hover{background:var(--accent-dim);color:var(--accent);}\n' +
'.main-nav a.nav-active{color:var(--accent);font-weight:700;}\n' +
'.header-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0;}\n' +
'.header-wa{display:inline-flex;align-items:center;gap:5px;background:#25d366;color:#fff;font-size:13px;font-weight:600;padding:8px 14px;border-radius:999px;white-space:nowrap;transition:opacity .15s;}\n' +
'.header-wa:hover{opacity:.9;}\n' +
'.menu-toggle{display:none;flex-direction:column;justify-content:space-between;width:32px;height:32px;padding:6px 4px;background:none;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;position:relative;z-index:400;}\n' +
'.menu-toggle span{display:block;height:2px;width:100%;background:var(--text,#333);border-radius:2px;transition:transform .22s,opacity .22s;pointer-events:none;}\n' +
'.menu-toggle[aria-expanded="true"] span:nth-child(1){transform:translateY(8px) rotate(45deg);}\n' +
'.menu-toggle[aria-expanded="true"] span:nth-child(2){opacity:0;transform:scaleX(0);}\n' +
'.menu-toggle[aria-expanded="true"] span:nth-child(3){transform:translateY(-8px) rotate(-45deg);}\n' +
'.nav-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:299;}\n' +
'.nav-overlay.open{display:block;}\n' +
'@media(max-width:860px){\n' +
'  .header-wa{display:none;}\n' +
'  .menu-toggle{display:flex;}\n' +
'  #main-nav{display:flex;flex-direction:column;gap:0;position:fixed;top:0;left:-280px;width:280px;height:100dvh;background:#fff;z-index:300;box-shadow:4px 0 24px rgba(0,0,0,.13);transition:left .25s ease;padding-top:56px;overflow-y:auto;-webkit-overflow-scrolling:touch;}\n' +
'  #main-nav.open{left:0;}\n' +
'  #main-nav a{padding:16px 24px;border-bottom:1px solid var(--border);font-size:15px;border-radius:0;color:var(--text);}\n' +
'  #main-nav a:last-child{border-bottom:none;}\n' +
'  #main-nav a:hover{background:var(--bg-soft);color:var(--accent);}\n' +
'  .site-header{gap:12px;padding:12px 16px;}\n' +
'}\n' +
'</style>';

  function inject() {
    var frag = document.createRange().createContextualFragment(html);
    document.body.insertBefore(frag, document.body.firstChild);
    init();
  }

  function init() {
    var toggle  = document.getElementById("menu-toggle");
    var nav     = document.getElementById("main-nav");
    var overlay = document.getElementById("nav-overlay");
    if (!toggle || !nav) return;

    function openNav() {
      nav.classList.add("open");
      if (overlay) overlay.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
    function closeNav() {
      nav.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      nav.classList.contains("open") ? closeNav() : openNav();
    });
    if (overlay) overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeNav();
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });

    // Mark active link
    var path = window.location.pathname.replace(/\/$/, "") || "/";
    nav.querySelectorAll("a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").replace(/\/$/, "") || "/";
      if (href === path || (href !== "/" && path.startsWith(href))) {
        a.classList.add("nav-active");
      }
    });

    updateCartBadge();
    document.addEventListener("cartUpdated", updateCartBadge);
  }

  function updateCartBadge() {
    var badge = document.getElementById("cart-icon-badge");
    if (!badge) return;
    try {
      var items = JSON.parse(localStorage.getItem("nova_style_cart") || "[]");
      var count = Array.isArray(items) ? items.reduce(function(s,i){ return s+(i.quantity||1); }, 0) : 0;
      badge.textContent   = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    } catch (e) { badge.style.display = "none"; }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  window.refreshCartDisplay = function () { updateCartBadge(); };
})();
