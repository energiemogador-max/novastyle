/**
 * header.js — Nova Style shared header
 * Layout: [Logo + Store Name] [Nav centered] [Search] [Cart] [Hamburger]
 * TO UPDATE: edit ONLY this file. All pages update automatically.
 */
(function () {
  var NAV_LINKS = [
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
  }).join('\n      ');

  var html =
    '<header class="site-header" id="site-header">\n' +
    '  <div class="header-inner">\n' +
    '    <!-- Brand -->\n' +
    '    <a href="/" class="brand" aria-label="Nova Style — Accueil">\n' +
    '      <img src="/assets/logo.png" alt="Nova Style" class="header-logo" width="40" height="40">\n' +
    '      <div class="brand-text">\n' +
    '        <span class="brand-name">Nova Style</span>\n' +
    '        <span class="brand-tagline">Fabricant de miroirs — Casablanca</span>\n' +
    '      </div>\n' +
    '    </a>\n' +
    '    <!-- Nav -->\n' +
    '    <nav id="main-nav" class="main-nav" role="navigation" aria-label="Navigation principale">\n' +
    '      ' + navItems + '\n' +
    '    </nav>\n' +
    '    <!-- Actions -->\n' +
    '    <div class="header-actions">\n' +
    '      <a href="/cart.html" class="cart-icon-wrap" id="cart-icon-wrap" aria-label="Panier">\n' +
    '        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>\n' +
    '        <span class="cart-badge" id="cart-icon-badge" style="display:none">0</span>\n' +
    '      </a>\n' +
    '      <button class="hamburger" id="menu-toggle" aria-label="Ouvrir le menu" aria-expanded="false">\n' +
    '        <span></span><span></span><span></span>\n' +
    '      </button>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="nav-overlay" id="nav-overlay"></div>\n' +
    '</header>\n';

  var css =
    /* ── Header shell ── */
    '.site-header{position:sticky;top:0;z-index:500;background:#fff;border-bottom:1px solid rgba(0,0,0,.08);box-shadow:0 2px 12px rgba(0,0,0,.06);}' +
    '.header-inner{max-width:1280px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:0;}' +

    /* ── Brand ── */
    '.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex-shrink:0;margin-right:32px;}' +
    '.header-logo{height:38px;width:38px;object-fit:contain;border-radius:6px;}' +
    '.brand-text{display:flex;flex-direction:column;line-height:1.2;}' +
    '.brand-name{font-size:16px;font-weight:800;letter-spacing:.3px;color:#1a1a1a;}' +
    '.brand-tagline{font-size:10px;font-weight:400;color:#9ca3af;letter-spacing:.2px;white-space:nowrap;}' +

    /* ── Nav ── */
    '.main-nav{display:flex;align-items:center;gap:2px;flex:1;}' +
    '.nav-link{padding:7px 11px;font-size:13px;font-weight:500;color:#4b5563;text-decoration:none;border-radius:7px;white-space:nowrap;transition:background .15s,color .15s;}' +
    '.nav-link:hover{background:#f9fafb;color:#1a1a1a;}' +
    '.nav-link.active{background:#fef2f4;color:#e8194b;font-weight:600;}' +

    /* ── Actions ── */
    '.header-actions{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0;}' +
    '.cart-icon-wrap{position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;color:#374151;text-decoration:none;transition:background .15s;}' +
    '.cart-icon-wrap:hover{background:#f3f4f6;color:#1a1a1a;}' +
    '.cart-badge{position:absolute;top:2px;right:2px;background:#e8194b;color:#fff;font-size:9px;font-weight:800;border-radius:99px;min-width:15px;height:15px;display:flex;align-items:center;justify-content:center;padding:0 3px;line-height:1;}' +
    '.hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;width:38px;height:38px;background:none;border:none;cursor:pointer;padding:8px;border-radius:8px;transition:background .15s;}' +
    '.hamburger:hover{background:#f3f4f6;}' +
    '.hamburger span{display:block;width:20px;height:2px;background:#374151;border-radius:2px;transition:all .25s;}' +
    '.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}' +
    '.hamburger.open span:nth-child(2){opacity:0;}' +
    '.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}' +

    /* ── Mobile drawer ── */
    '.nav-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:498;backdrop-filter:blur(2px);}' +
    '.nav-overlay.open{display:block;}' +

    /* ── Responsive ── */
    '@media(max-width:900px){' +
    '.brand-tagline{display:none;}' +
    '.brand{margin-right:16px;}' +
    '.nav-link{padding:6px 8px;font-size:12px;}' +
    '}' +
    '@media(max-width:768px){' +
    '.hamburger{display:flex;}' +
    '.main-nav{' +
      'position:fixed;top:0;left:-290px;height:100vh;width:270px;' +
      'background:#fff;flex-direction:column;align-items:stretch;gap:0;' +
      'padding:72px 0 32px;z-index:499;' +
      'box-shadow:6px 0 24px rgba(0,0,0,.12);transition:left .28s cubic-bezier(.4,0,.2,1);' +
      'overflow-y:auto;' +
    '}' +
    '.main-nav.open{left:0;}' +
    '.nav-link{padding:13px 24px;border-radius:0;font-size:15px;border-bottom:1px solid #f9fafb;}' +
    '.nav-link:hover{background:#fef2f4;}' +
    '.brand-tagline{display:none;}' +
    '}';

  function inject() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    var frag = document.createRange().createContextualFragment(html);
    document.body.insertBefore(frag, document.body.firstChild);

    var toggle  = document.getElementById('menu-toggle');
    var nav     = document.getElementById('main-nav');
    var overlay = document.getElementById('nav-overlay');
    var badge   = document.getElementById('cart-icon-badge');
    var path    = window.location.pathname.replace(/\/$/, '') || '/';

    /* Active nav link */
    document.querySelectorAll('.nav-link').forEach(function(a) {
      var href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (path === href || (href !== '/' && path.startsWith(href))) {
        a.classList.add('active');
      }
    });

    /* Mobile menu */
    function openMenu() {
      nav.classList.add('open');
      overlay.classList.add('open');
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      nav.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    if (toggle) toggle.addEventListener('click', function() {
      nav.classList.contains('open') ? closeMenu() : openMenu();
    });
    if (overlay) overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeMenu();
    });

    /* Cart badge */
    function updateBadge() {
      try {
        var cart = JSON.parse(localStorage.getItem('nova_cart') || '[]');
        var total = cart.reduce(function(s, i) { return s + (i.qty || 1); }, 0);
        if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'flex' : 'none'; }
      } catch(e) {}
    }
    updateBadge();
    window.addEventListener('storage', updateBadge);
    window.addEventListener('nova-cart-updated', updateBadge);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
