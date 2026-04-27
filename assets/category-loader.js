/**
 * category-loader.js
 * Dynamically renders a product grid from products-index.json.
 *
 * Usage on a category page:
 *   <div id="products-grid" data-category-id="sdb-premium"></div>
 *   <!-- OR for curated slug lists (e.g. salon) -->
 *   <div id="products-grid" data-slugs="slug-a,slug-b,slug-c"></div>
 *   <script src="/assets/category-loader.js" defer></script>
 */

(async function () {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const categoryId   = grid.dataset.categoryId || null;
  const slugWhitelist = grid.dataset.slugs
    ? new Set(grid.dataset.slugs.split(',').map(s => s.trim()).filter(Boolean))
    : null;

  if (!categoryId && !slugWhitelist) return;

  const UNSAFE_SLUG = /[^\x00-\x7F]/;

  function fmtPrice(v) { return v == null ? '' : Math.round(v).toLocaleString('fr-FR') + ' MAD'; }
  function priceLabel(p) { const min = p.price?.min; return min == null ? '' : 'À partir de ' + fmtPrice(min); }

  // Shared catalog cache — avoids re-fetching when user navigates across pages
  async function fetchCatalog() {
    if (window.__NOVA_CATALOG__) return window.__NOVA_CATALOG__;
    const KEY = 'nova_cat_v2', TTL = 600000;
    try {
      const c = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (c && c._ts && Date.now() - c._ts < TTL) { window.__NOVA_CATALOG__ = c; return c; }
    } catch {}
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const res = await fetch('/products-index.json?v=' + day);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    data._ts = Date.now();
    try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {}
    window.__NOVA_CATALOG__ = data;
    return data;
  }

  function cardHTML(p, eager) {
    const imgAttrs = eager
      ? ' fetchpriority="high" decoding="sync"'
      : ' loading="lazy" decoding="async"';
    return `<a class="product-card" href="/produits/${p.slug}/">
  <div class="card-img"><img src="${p.image}" alt="${p.name.replace(/"/g, '&quot;')}" width="400" height="400"${imgAttrs}
    onload="this.classList.add('img-ready');this.closest('.card-img').classList.add('img-ready')"
    onerror="this.closest('.card-img').classList.add('img-ready')"></div>
  <div class="card-info">
    <div class="card-name">${p.name}</div>
    <div class="card-price">${priceLabel(p)}</div>
  </div>
</a>`;
  }

  try {
    const index = await fetchCatalog();

    const products = (index.products || []).filter(p => {
      if (!p.active) return false;
      if (UNSAFE_SLUG.test(p.slug)) return false;
      if (slugWhitelist) return slugWhitelist.has(p.slug);
      return p.categoryId === categoryId;
    });

    // Reverse to show newest first (assuming JSON has newest at bottom)
    products.reverse();

    if (!products.length) {
      grid.innerHTML = '<p class="no-products">Aucun produit dans cette catégorie.</p>';
      return;
    }

    // Preload first 4 images before rendering so browser fetches in parallel
    products.slice(0, 4).forEach((p, i) => {
      const link = document.createElement('link');
      link.rel = 'preload'; link.as = 'image'; link.href = p.image;
      if (i === 0) link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    });

    grid.className = 'grid';
    // First row (~4 cards on desktop) gets eager loading; rest lazy
    grid.innerHTML = products.map((p, i) => cardHTML(p, i < 4)).join('\n');

    // Mark already-cached images as ready immediately (no shimmer flash on repeat visits)
    grid.querySelectorAll('.card-img img').forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('img-ready');
        img.closest('.card-img')?.classList.add('img-ready');
      }
    });

    // Sync the visible count heading
    const countEl = document.querySelector('.products-list h2');
    if (countEl) countEl.textContent = `${products.length} produit${products.length !== 1 ? 's' : ''} dans cette catégorie`;

    // Keep Schema.org numberOfItems accurate
    const ldScript = document.querySelector('script[type="application/ld+json"]');
    if (ldScript) {
      try {
        const schema = JSON.parse(ldScript.textContent);
        if ('numberOfItems' in schema) { schema.numberOfItems = products.length; ldScript.textContent = JSON.stringify(schema); }
      } catch {}
    }

  } catch (err) {
    console.error('[category-loader]', err);
    grid.innerHTML = '<p class="error-products">Erreur de chargement des produits. Veuillez recharger la page.</p>';
  }
})();
