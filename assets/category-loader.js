/**
 * category-loader.js
 * Dynamically renders a product grid from products-index.json.
 *
 * Usage on a category page:
 *   <div id="products-grid" data-category-id="miroirs-sdb"></div>
 *   <!-- OR for curated slug lists (e.g. salon) -->
 *   <div id="products-grid" data-slugs="slug-a,slug-b,slug-c"></div>
 *   <script src="/assets/category-loader.js" defer></script>
 *
 * Rules enforced per architectural decree:
 *  - Excludes products with non-ASCII slugs (Arabic filesystem breakage).
 *  - Price displayed as computed min from variant list in index (reliable).
 *  - Filters by categoryId only — no separate lookup table.
 */

(async function () {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const categoryId = grid.dataset.categoryId || null;
  const slugWhitelist = grid.dataset.slugs
    ? new Set(grid.dataset.slugs.split(',').map(s => s.trim()).filter(Boolean))
    : null;

  if (!categoryId && !slugWhitelist) return;

  // Non-ASCII slug guard (Arabic IDs cause filesystem/URL breakage).
  const UNSAFE_SLUG = /[^\x00-\x7F]/;

  function fmtPrice(v) {
    return v == null ? '' : Math.round(v).toLocaleString('fr-FR') + ' MAD';
  }

  function priceLabel(p) {
    const min = p.price?.min;
    if (min == null) return '';
    return 'À partir de ' + fmtPrice(min);
  }

  function cardHTML(p, eager) {
    return `<a class="product-card" href="/produits/${p.slug}/">
  <div class="card-img"><img src="${p.image}" alt="${p.name.replace(/"/g, '&quot;')}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''}></div>
  <div class="card-info">
    <div class="card-name">${p.name}</div>
    <div class="card-price">${priceLabel(p)}</div>
  </div>
</a>`;
  }

  try {
    const res = await fetch('/products-index.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const index = await res.json();

    const products = (index.products || []).filter(p => {
      if (!p.active) return false;
      if (UNSAFE_SLUG.test(p.slug)) return false;
      if (slugWhitelist) return slugWhitelist.has(p.slug);
      return p.categoryId === categoryId;
    });

    if (!products.length) {
      grid.innerHTML = '<p class="no-products">Aucun produit dans cette catégorie.</p>';
    } else {
      grid.className = 'grid';
      grid.innerHTML = products.map((p, i) => cardHTML(p, i === 0)).join('\n');
    }

    // Sync the visible count heading.
    const countEl = document.querySelector('.products-list h2');
    if (countEl) {
      countEl.textContent = `${products.length} produit${products.length !== 1 ? 's' : ''} dans cette catégorie`;
    }

    // Keep Schema.org numberOfItems accurate.
    const ldScript = document.querySelector('script[type="application/ld+json"]');
    if (ldScript) {
      try {
        const schema = JSON.parse(ldScript.textContent);
        if ('numberOfItems' in schema) {
          schema.numberOfItems = products.length;
          ldScript.textContent = JSON.stringify(schema);
        }
      } catch (_) {}
    }

  } catch (err) {
    console.error('[category-loader]', err);
    grid.innerHTML = '<p class="error-products">Erreur de chargement des produits. Veuillez recharger la page.</p>';
  }
})();
