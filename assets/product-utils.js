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
 * Builds a complete product HTML page with SEO meta, JSON-LD schema, breadcrumb,
 * and a dynamic shell that product-loader.js fills from /products/{slug}.json.
 *
 * @param {object} p - full product object with: slug, name, category, categoryId,
 *   images, seo:{title,description}, variants (used only for JSON-LD prices)
 */
export function buildProductPage(p) {
  const slug   = p.slug;
  const name   = p.name || p.title || '';
  const seo    = p.seo || {};
  const title  = seo.title || name;
  const desc   = (seo.description || '').replace(/"/g, '&quot;');
  const img    = (p.images || [])[0] || `/images/${slug}/1.webp`;
  const cat    = p.category || 'Miroirs';
  const catUrl = String(p.categoryId || '').startsWith('sdb') ? '/miroir-salle-de-bain/' : '/';
  const variants = p.variants || [];
  const prices = variants.map(v => v.price).filter(pr => pr > 0);
  const pmin   = prices.length ? Math.min(...prices) : 0;
  const pmax   = prices.length ? Math.max(...prices) : 0;

  const offers = variants.filter(v => v.price > 0).map(v => ({
    '@type': 'Offer', priceCurrency: 'MAD', price: String(Math.round(v.price)),
    availability: 'https://schema.org/InStock',
    url: `https://novastyle.ma/produits/${slug}/`,
    seller: { '@type': 'Organization', name: 'Nova Style' }
  }));

  const schemaProduct = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name,
    description: (seo.description || '').slice(0, 300),
    image: p.images || [],
    brand: { '@type': 'Brand', name: 'Nova Style' },
    sku: slug,
    offers: {
      '@type': 'AggregateOffer', priceCurrency: 'MAD',
      lowPrice: String(Math.round(pmin)), highPrice: String(Math.round(pmax)),
      offerCount: offers.length, offers
    }
  });

  const schemaBreadcrumb = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://novastyle.ma/' },
      { '@type': 'ListItem', position: 2, name: cat, item: `https://novastyle.ma${catUrl}` },
      { '@type': 'ListItem', position: 3, name }
    ]
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Nova Style</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow">
<meta name="author" content="Nova Style">
<meta name="geo.region" content="MA-06">
<meta name="geo.placename" content="Casablanca">
<meta name="geo.position" content="33.5731;-7.5898">
<link rel="canonical" href="https://novastyle.ma/produits/${slug}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://novastyle.ma/produits/${slug}/">
<meta property="og:locale" content="fr_MA">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">
<link rel="icon" type="image/png" href="/assets/logo.png">
<link rel="stylesheet" href="/assets/style.css">
<link rel="preconnect" href="https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app" crossorigin>
<link rel="preconnect" href="https://www.gstatic.com" crossorigin>
</head>
<body>
<script type="application/ld+json">${schemaProduct}</script>
<script type="application/ld+json">${schemaBreadcrumb}</script>

<script src="/assets/header.js" defer></script>

<nav class="breadcrumb"><a href="/">Accueil</a> › <a href="${catUrl}">${cat}</a> › <span>${name}</span></nav>

<article class="product-page" id="product-root" data-slug="${slug}">
  <div class="product-gallery" id="p-gallery"></div>
  <div class="product-info">
    <h1>${name}</h1>
    <p class="p-subtitle">Miroir sur mesure · Fabrication Casablanca · Livraison Maroc</p>
    <div class="p-price" id="current-price"></div>
    <div class="axes-container" id="axes-container"></div>
    <div id="qty-wrap"></div>
    <div class="p-cta">
      <button class="btn-primary" id="add-to-cart-btn" onclick="addProductToCart()">🛒 Ajouter au panier</button>
      <a class="btn-secondary" href="/cart">Voir panier</a>
    </div>
    <div class="deposit-note">💡 Acompte de 50% requis pour confirmer la commande. Solde à la livraison ou installation.</div>
  </div>
</article>

<section class="product-content" id="p-desc"></section>

<section class="reviews-section">
  <ns-reviews-widget product-id="${slug}"></ns-reviews-widget>
  <script type="module" src="/assets/reviews-widget.js"></script>
</section>

<script type="module" src="/assets/product-loader.js"></script>
<script src="/assets/product-qty.js" defer></script>
<script src="/assets/footer.js" defer></script>
<script type="module" src="/assets/cart.js"></script>
<script type="module" src="/assets/visitor-tracker.js"></script>
</body>
</html>
`;
}
