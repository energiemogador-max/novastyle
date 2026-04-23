/**
 * product-utils.js
 * Shared utilities for admin.html and nouveau-produit.jsx
 * ES module — import with: import { ghCommit, buildProductPage, ... } from '/assets/product-utils.js';
 */

export function fmtPrice(v) {
  return v == null ? '' : Math.round(v).toLocaleString('fr-FR') + ' MAD';
}

export function generateAllVariants({ axis_order, axes }) {
  if (!axis_order || !axis_order.length) return [{}];
  const [first, ...rest] = axis_order;
  const subCombos = generateAllVariants({ axis_order: rest, axes });
  const combos = [];
  for (const val of (axes[first] || [])) {
    for (const sub of subCombos) {
      combos.push({ [first]: val, ...sub });
    }
  }
  return combos;
}

export async function ghCommit(token, repo, path, content, message) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
  // GET current SHA
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers });
  let sha;
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  } else if (getRes.status !== 404) {
    throw new Error(`ghCommit GET failed: ${getRes.status}`);
  }
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    ...(sha ? { sha } : {}),
  };
  const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!putRes.ok) throw new Error(`ghCommit PUT failed: ${putRes.status}`);
  return putRes.json();
}

/**
 * Generates a product detail page shell that lazy-fetches /products/{slug}.json.
 * Replaces the old approach of baking variant/price data into the HTML.
 *
 * @param {object} info - { name, slug, seoTitle, seoDesc }
 * Legacy parameters (axesConfig, variants, priceMin, priceMax) are accepted
 * but ignored — data is loaded at runtime from the product JSON file.
 */
export function buildProductPage(info) {
  const { name, slug, seoTitle, seoDesc } = info;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle || name}</title>
  <meta name="description" content="${seoDesc || ''}">
  <link rel="canonical" href="https://novastyle.ma/produits/${slug}/">
  <link rel="stylesheet" href="/assets/style.css">
  <script src="/assets/header.js" defer></script>
</head>
<body>
  <main class="product-page" id="product-root" data-slug="${slug}">
    <div class="p-gallery" id="p-gallery"></div>
    <div class="p-info">
      <h1 class="p-title">${name}</h1>
      <div class="p-price" id="current-price"></div>
      <div class="axes-container" id="axes-container"></div>
      <div id="qty-wrap"></div>
      <button id="add-to-cart-btn" onclick="addProductToCart()">🛒 Ajouter au panier</button>
      <div class="p-desc" id="p-desc"></div>
    </div>
  </main>

  <ns-reviews-widget product-id="${slug}"></ns-reviews-widget>

  <script type="module" src="/assets/product-loader.js"></script>
  <script src="/assets/product-qty.js" defer></script>
  <script type="module" src="/assets/reviews-widget.js"></script>
  <script src="/assets/footer.js" defer></script>
  <script type="module" src="/assets/cart.js"></script>
  <script type="module" src="/assets/visitor-tracker.js"></script>
</body>
</html>`;
}
