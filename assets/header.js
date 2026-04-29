/**
 * header.js — Nova Style shared header
 * Layout: [Logo] [Nav — left-aligned] [→ auto] [WhatsApp] [Cart] [Hamburger]
 * TO UPDATE: edit ONLY this file. All pages update automatically.
 */
(function () {
  var NAV_LINKS = [
    { href: "/",                         label: "Accueil" },
    { href: "/categorie/sdb-premium/",   label: "Miroirs SDB" },
    { href: "/categorie/salon/",         label: "Salon &amp; Dressing" },
    { href: "/categorie/douches/",       label: "Douches" },
    { href: "/categorie/consoles/",      label: "Consoles" },
    { href: "/categorie/tables/",        label: "Tables" },
    { href: "/miroir-sur-mesure/",       label: "Sur Mesure" },
    { href: "/blog/",                    label: "Blog" },
  ];

  var navItems = NAV_LINKS.map(function(l) {
    return '<a href="' + l.href + '" class="nav-link">' + l.label + '</a>';
  }).join('\n    ');

  var html =
    '<header class="site-header" id="site-header">\n' +
    '  <div class="header-inner">\n' +
    '    <a href="/" class="brand">\n' +
    '      <img src="/assets/logo.png" alt="Nova Style" class="header-logo" width="120" height="40">\n' +
    '      <span class="brand-name">Nova Style</span>\n' +
    '    </a>\n' +
    '    <nav id="main-nav" class="main-nav">\n' +
    '      ' + navItems + '\n' +
    '    </nav>\n' +
    '    <div class="header-actions">\n' +
    '      <a href="https://wa.me/212635228074" class="header-wa" target="_blank" rel="noopener">💬 WhatsApp</a>\n' +
    '      <a href="/cart.html" class="cart-icon-wrap" id="cart-icon-wrap">\n' +
    '        🛒<span class="cart-badge" id="cart-icon-badge" style="display:none">0</span>\n' +
    '      </a>\n' +
    '      <button class="hamburger" id="menu-toggle" aria-label="Menu">\n' +
    '        <span></span><span></span><span></span>\n' +
    '      </button>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="nav-overlay" id="nav-overlay"></div>\n' +
    '</header>\n';

  var css =
    '.site-header{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid rgba(0,0,0,.07);box-shadow:0 1px 8px rgba(0,0,0,.06);}' +
    '.header-inner{max-width:1200px;margin:0 auto;padding:0 20px;height:60px;display:flex;align-items:center;gap:24px;}' +
    '.brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit;flex-shrink:0;}' +
    '.header-logo{height:36px;width:auto;object-fit:contain;}' +
    '.brand-name{font-size:17px;font-weight:700;letter-spacing:1.5px;color:var(--text);}' +
    '.main-nav{display:flex;gap:4px;align-items:center;flex:1;}' +
    '.nav-link{padding:6px 10px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;border-radius:6px;white-space:nowrap;transition:background .15s,color .15s;}' +
    '.nav-link:hover,.nav-link.active{background:#fef2f4;color:#e8194b;}' +
    '.header-actions{display:flex;align-items:center;gap:12px;margin-left:auto;flex-shrink:0;}' +
    '.header-wa{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;background:#25d366;color:#fff;border-radius:7px;font-size:13px;font-weight:600;text-decoration:none;white-space:nowrap;}' +
    '.header-wa:hover{background:#20bb5a;}' +
    '.cart-icon-wrap{position:relative;font-size:22px;text-decoration:none;cursor:pointer;}' +
    '.cart-badge{position:absolute;top:-6px;right:-8px;background:#e8194b;color:#fff;font-size:10px;font-weight:700;border-radius:99px;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 3px;}' +
    '.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;}' +
    '.hamburger span{display:block;width:22px;height:2px;background:#374151;border-radius:2px;transition:all .3s;}' +
    '.nav-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:98;}' +
    '@media(max-width:768px){' +
    '.hamburger{display:flex;}' +
    '.main-nav{position:fixed;top:0;left:-280px;height:100vh;width:260px;background:#fff;flex-direction:column;align-items:flex-start;gap:0;padding:70px 0 20px;z-index:99;box-shadow:4px 0 20px rgba(0,0,0,.15);transition:left .3s;overflow-y:auto;}' +
    '.main-nav.open{left:0;}' +
    '.nav-overlay.open{display:block;}' +
    '.nav-link{padding:12px 24px;width:100%;border-radius:0;font-size:15px;}' +
    '.brand-name{display:none;}' +
    '}';

  function inject() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    var frag = document.createRange().createContextualFragment(html);
    document.body.insertBefore(frag, document.body.firstChild);

    var toggle  = document.getElementById("menu-toggle");
    var nav     = document.getElementById("main-nav");
    var overlay = document.getElementById("nav-overlay");
    var path = window.location.pathname.replace(/\/$/, "") || "/";
    var badge = document.getElementById("cart-icon-badge");

    document.querySelectorAll(".nav-link").forEach(function(a) {
      var href = a.getAttribute("href").replace(/\/$/, "") || "/";
      if (path === href || (href !== "/" && path.startsWith(href))) a.classList.add("active");
    });

    function openMenu() { nav.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeMenu() { nav.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; }
    if (toggle) toggle.addEventListener("click", openMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    function updateBadge() {
      try {
        var cart = JSON.parse(localStorage.getItem("nova_cart") || "[]");
        var total = cart.reduce(function(s, i) { return s + (i.qty || 1); }, 0);
        if (badge) { badge.textContent = total; badge.style.display = total > 0 ? "flex" : "none"; }
      } catch(e) {}
    }
    updateBadge();
    window.addEventListener("storage", updateBadge);
    window.addEventListener("nova-cart-updated", updateBadge);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
