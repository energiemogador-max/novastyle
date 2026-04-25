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

// Shared catalog cache — sessionStorage + in-memory to avoid repeated fetches across pages
async function fetchCatalog() {
  if (window.__NOVA_CATALOG__) return window.__NOVA_CATALOG__;
  const KEY = "nova_cat_v2", TTL = 600000; // 10 min
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (c && c._ts && Date.now() - c._ts < TTL) { window.__NOVA_CATALOG__ = c; return c; }
  } catch {}
  // Daily cache buster — same URL all day so browser HTTP cache works
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const res = await fetch("/products-index.json?v=" + day);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  data._ts = Date.now();
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  window.__NOVA_CATALOG__ = data;
  return data;
}

function productCardHTML(p, eager) {
  // First row (eager): fetchpriority high + no lazy. Rest: lazy + async decode.
  const imgAttrs = eager
    ? ' fetchpriority="high" decoding="sync"'
    : ' loading="lazy" decoding="async"';
  const priceMin = p.price?.min;
  const priceLabel = priceMin != null ? "À partir de " + fmtPrice(priceMin) : "";
  return `<a class="product-card" href="/produits/${p.slug}/">
  <div class="card-img"><img src="${p.image || ''}" alt="${(p.name || "").replace(/"/g, "&quot;")}" width="400" height="400"${imgAttrs}
    onload="this.classList.add('img-ready');this.closest('.card-img').classList.add('img-ready')"
    onerror="this.closest('.card-img').classList.add('img-ready')"></div>
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
    data = await fetchCatalog();
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

  // Preload first 4 images immediately so browser fetches them in parallel with rendering
  const firstItems = categories.flatMap(cat => (byCat[cat.id] || []).slice(0, 1)).slice(0, 4);
  firstItems.forEach((p, i) => {
    const link = document.createElement("link");
    link.rel = "preload"; link.as = "image"; link.href = p.image || "";
    if (i === 0) link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
  });

  let eagerLeft = 5; // first row across all sections

  sectionsEl.innerHTML = categories.map(cat => {
    const items = (byCat[cat.id] || []).slice(0, 10);
    if (!items.length) return "";

    const total = (byCat[cat.id] || []).length;
    const cards = items.map(p => {
      const eager = eagerLeft-- > 0;
      return productCardHTML(p, eager);
    }).join("");

    return `<div class="home-collection">
  <div class="home-collection-head">
    <div class="home-collection-title">${cat.name}</div>
    <a class="home-collection-link" href="${CATEGORY_PAGE(cat.id)}">Voir les ${total} produits →</a>
  </div>
  <div class="home-collection-grid">${cards}</div>
</div>`;
  }).join("\n");

  // Mark already-cached images as ready (avoids shimmer flash on repeat visits)
  sectionsEl.querySelectorAll(".card-img img").forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("img-ready");
      img.closest(".card-img")?.classList.add("img-ready");
    }
  });
})();
