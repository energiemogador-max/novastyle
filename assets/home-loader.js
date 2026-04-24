/**
 * home-loader.js
 * Renders dynamic home page sections from /products-index.json:
 *   1. The category cards strip (#dyn-cat-cards)        — auto counts per category
 *   2. One "preview" section per category (#dyn-cat-sections) — 6 products each + "Voir tous" link
 *
 * No data is hardcoded — adding/removing products on the site auto-updates the
 * home page on next reload. Categories are read from products-index.json's
 * `categories` array, in declared order.
 */

const HOME_CONFIG = {
  // categoryId → tagline shown above the product grid
  taglines: {
    "miroirs-sdb":     "Miroirs de salle de bain LED, anti-buée, AGC Belgique. Fabriqués sur mesure à Casablanca.",
    "sdb-premium":     "Notre gamme premium : LED intégrée, anti-buée, anti-corrosion. Verre AGC Belgique 6mm.",
    "entree-de-gamme": "Qualité Nova Style à prix accessible : verre AGC Belgique, designs essentiels.",
    "salon":           "Pièces signatures pour salon, dressing, et chambre. Bois noyer, rotin, formes organiques.",
    "consoles":        "Ensembles console + miroir d'entrée. Solutions complètes pour votre vestibule.",
    "tables":          "Tables de séjour artisanales : bois de hêtre, MDF, plateau en verre trempé.",
    "douches":         "Douches italiennes en verre trempé sur mesure : forme droite ou en L.",
  },
  productsPerSection: 6,
};

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
    <div class="card-img"><img src="${p.image}" alt="${(p.name || "").replace(/"/g, "&quot;")}"${imgAttrs} decoding="async"
      onload="this.classList.add('img-ready');this.closest('.card-img').classList.add('img-ready')"></div>
    <div class="card-info">
      <div class="card-name">${p.name || ""}</div>
      <div class="card-price">${priceLabel}</div>
    </div>
  </a>`;
}

function catCardHTML(cat, count, firstProductImage, eager) {
  const imgAttrs = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<a class="cat-card" href="${CATEGORY_PAGE(cat.id)}">
    <div class="cat-card-img"><img src="${firstProductImage || '/assets/logo.png'}" alt="${cat.name}"${imgAttrs}></div>
    <div class="cat-card-info">
      <div class="cat-card-name">${cat.name}</div>
      <div class="cat-card-count">${count} produit${count !== 1 ? "s" : ""}</div>
    </div>
  </a>`;
}

(async function () {
  const cardsEl    = document.getElementById("dyn-cat-cards");
  const sectionsEl = document.getElementById("dyn-cat-sections");
  if (!cardsEl && !sectionsEl) return;

  let data;
  try {
    const res = await fetch("/products-index.json?_=" + Math.floor(Date.now() / 60000));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.error("[home-loader]", e);
    if (cardsEl)    cardsEl.innerHTML    = "<p class='error-products'>Impossible de charger les catégories.</p>";
    if (sectionsEl) sectionsEl.innerHTML = "";
    return;
  }

  const allProducts = (data.products || []).filter(p =>
    p && p.active !== false && !UNSAFE_SLUG.test(p.slug || "")
  );
  const categories = data.categories || [];

  // Group products by categoryId for fast lookup
  const byCat = {};
  allProducts.forEach(p => {
    const k = p.categoryId || "other";
    (byCat[k] = byCat[k] || []).push(p);
  });

  // ── 1. Category cards strip ─────────────────────────────────────────────
  if (cardsEl) {
    cardsEl.innerHTML = categories.map((cat, i) => {
      const items = byCat[cat.id] || [];
      const firstImg = items[0]?.image;
      return catCardHTML(cat, items.length, firstImg, i === 0);
    }).join("");
  }

  // ── 2. Preview sections — one per category ──────────────────────────────
  if (sectionsEl) {
    sectionsEl.innerHTML = categories.map((cat, ci) => {
      const items = (byCat[cat.id] || []).slice(0, HOME_CONFIG.productsPerSection);
      if (!items.length) return "";
      const tagline = HOME_CONFIG.taglines[cat.id] || "";
      const cards = items.map((p, pi) => productCardHTML(p, ci === 0 && pi === 0)).join("\n");
      return `<section class="cat-section">
        <div class="cat-section-head">
          <h2><a href="${CATEGORY_PAGE(cat.id)}">${cat.name}</a></h2>
          <a class="see-more-inline" href="${CATEGORY_PAGE(cat.id)}">Voir tous (${(byCat[cat.id] || []).length}) →</a>
        </div>
        ${tagline ? `<p class="cat-section-lead">${tagline}</p>` : ""}
        <div class="grid">${cards}</div>
      </section>`;
    }).join("\n");
  }
})();
