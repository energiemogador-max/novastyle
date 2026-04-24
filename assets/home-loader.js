/**
 * home-loader.js
 * Populates the homepage:
 *  1. #dyn-cat-cards  — category tiles (large, image + overlay)
 *  2. #featured-products — 8 mixed products from top categories
 */

const CATEGORY_PAGE = id => `/categorie/${id}/`;
const UNSAFE_SLUG   = /[^\x00-\x7F]/;

function fmtPrice(v) {
  if (v == null) return "";
  return Math.round(v).toLocaleString("fr-FR") + " MAD";
}

function catTileHTML(cat, count, img, eager) {
  const imgAttrs = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  const src = img || "/assets/logo.png";
  return `<a class="cat-tile" href="${CATEGORY_PAGE(cat.id)}">
  <img src="${src}" alt="${cat.name}"${imgAttrs} decoding="async">
  <div class="cat-tile-overlay">
    <div class="cat-tile-name">${cat.name}</div>
    <div class="cat-tile-count">${count} produit${count !== 1 ? "s" : ""}</div>
  </div>
</a>`;
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
  const cardsEl    = document.getElementById("dyn-cat-cards");
  const featuredEl = document.getElementById("featured-products");
  if (!cardsEl && !featuredEl) return;

  let data;
  try {
    const res = await fetch("/products-index.json?_=" + Math.floor(Date.now() / 60000));
    if (!res.ok) throw new Error("HTTP " + res.status);
    data = await res.json();
  } catch (e) {
    console.error("[home-loader]", e);
    if (cardsEl)    cardsEl.innerHTML    = "<p style='text-align:center;padding:20px;color:#888'>Impossible de charger les catégories.</p>";
    if (featuredEl) featuredEl.innerHTML = "";
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

  // 1. Category tiles
  if (cardsEl) {
    cardsEl.innerHTML = categories.map((cat, i) => {
      const items = byCat[cat.id] || [];
      return catTileHTML(cat, items.length, items[0]?.image, i === 0);
    }).join("");
  }

  // 2. Featured products — pick 2 from each of the first 4 categories (8 total)
  if (featuredEl) {
    const featured = [];
    for (const cat of categories) {
      const items = byCat[cat.id] || [];
      featured.push(...items.slice(0, 2));
      if (featured.length >= 8) break;
    }
    if (featured.length) {
      featuredEl.innerHTML = featured.slice(0, 8).map((p, i) => productCardHTML(p, i === 0)).join("");
    } else {
      featuredEl.innerHTML = "";
    }
  }
})();
