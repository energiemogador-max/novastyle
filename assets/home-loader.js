/**
 * home-loader.js
 * Renders homepage collection sections from products-index.json.
 * Each category → beautiful title + 2 rows × 5 products (10 total) + "Voir tous" link.
 */

const CATEGORY_PAGE = id => `/categorie/${id}/`;
const UNSAFE_SLUG   = /[^\x00-\x7F]/;

function fmtPrice(v) {
  if (v == null) return "";
  return Math.round(v).toLocaleString("fr-FR") + " MAD";
}

function productCardHTML(p, eager) {
  const imgAttrs = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  const priceMin = p.price?.min;
  const priceLabel = priceMin != null ? "À partir de " + fmtPrice(priceMin) : "";
  return `<a class="product-card" href="/produits/${p.slug}/">
  <div class="card-img"><img src="${p.image || ''}" alt="${(p.name || "").replace(/"/g, "&quot;")}"${imgAttrs} decoding="async"
    onload="this.classList.add('img-ready');this.closest('.card-img').classList.add('img-ready')"></div>
  <div class="card-info">
    <div class="card-name">${p.name || ""}</div>
    <div class="card-price">${priceLabel}</div>
  </div>
</a>`;
}

(async function () {
  const sectionsEl = document.getElementById("dyn-cat-sections");
  if (!sectionsEl) return;

  let data;
  try {
    const res = await fetch("/products-index.json?_=" + Math.floor(Date.now() / 60000));
    if (!res.ok) throw new Error("HTTP " + res.status);
    data = await res.json();
  } catch (e) {
    console.error("[home-loader]", e);
    sectionsEl.innerHTML = "<p style='text-align:center;padding:20px;color:#888'>Impossible de charger les produits.</p>";
    return;
  }

  const allProducts = (data.products || []).filter(p =>
    p && p.active !== false && !UNSAFE_SLUG.test(p.slug || "")
  );
  const categories = data.categories || [];

  const byCat = {};
  allProducts.forEach(p => {
    const k = p.categoryId || "other";
    (byCat[k] = byCat[k] || []).push(p);
  });

  let firstProduct = true;

  sectionsEl.innerHTML = categories.map(cat => {
    const items = (byCat[cat.id] || []).slice(0, 10);
    if (!items.length) return "";

    const total = (byCat[cat.id] || []).length;
    const cards = items.map(p => {
      const html = productCardHTML(p, firstProduct);
      firstProduct = false;
      return html;
    }).join("");

    return `<div class="home-collection">
  <div class="home-collection-head">
    <div class="home-collection-title">${cat.name}</div>
    <a class="home-collection-link" href="${CATEGORY_PAGE(cat.id)}">Voir les ${total} produits →</a>
  </div>
  <div class="home-collection-grid">${cards}</div>
</div>`;
  }).join("\n");
})();
