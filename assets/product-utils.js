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

export function buildProductPage(info, axesConfig, variants, priceMin, priceMax) {
  const { name, slug, category, seoTitle, seoDesc, desc, imageCount = 2 } = info;
  const { axis_order = [], axes = {} } = axesConfig;

  const pillsHTML = axis_order.map(axis => {
    const vals = (axes[axis] || []).map(v =>
      `<button type="button" class="opt-pill" data-axis="${axis}" data-value="${v}" onclick="selectOption('${axis}', '${v}')">${v}</button>`
    ).join('');
    return `<div class="axis-row">
          <div class="axis-label">${axis} <span class="selected-val" data-axis-label="${axis}"></span></div>
          <div class="opt-values" data-axis="${axis}">${vals}</div>
        </div>`;
  }).join('\n');

  const variantsJSON = JSON.stringify(variants, null, 2);
  const axisOrderJSON = JSON.stringify(axis_order);
  const axesJSON = JSON.stringify(axes, null, 2);

  const images = Array.from({ length: imageCount }, (_, i) =>
    `/assets/images/${slug}/${i + 1}.webp`
  );

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
  <main class="product-page">
    <div class="p-gallery">
      ${images.map((src, i) => `<img src="${src}" alt="${name}" loading="${i === 0 ? 'eager' : 'lazy'}"${i === 0 ? ' fetchpriority="high"' : ''}>`).join('\n      ')}
    </div>
    <div class="p-info">
      <h1 class="p-title">${name}</h1>
      <div class="p-price" id="current-price"></div>
      <div class="axes-container">
        ${pillsHTML}
      </div>
      <div id="qty-wrap"></div>
      <button id="add-to-cart-btn" onclick="addProductToCart()">🛒 Ajouter au panier</button>
      <div class="p-desc"><p>${desc || ''}</p></div>
    </div>
  </main>

  <ns-reviews-widget product-id="${slug}"></ns-reviews-widget>

  <script>
    const PRODUCT = {
      "title": "${name}",
      "variants": ${variantsJSON},
      "axis_order": ${axisOrderJSON},
      "axes": ${axesJSON},
      "price_min": ${priceMin},
      "price_max": ${priceMax}
    };
    const WHATSAPP = "212707074748";
    let SELECTION = {};

    function fmtPrice(v) { return v == null ? "" : Math.round(v).toLocaleString('fr-FR') + " MAD"; }
    function priceRange() {
      var prices = (PRODUCT.variants||[]).map(v=>v.price).filter(p=>p!=null&&p>0);
      if (!prices.length) return "";
      var mn = Math.min(...prices), mx = Math.max(...prices);
      return mn === mx ? fmtPrice(mn) : fmtPrice(mn) + " – " + fmtPrice(mx);
    }
    function findMatchingVariant() {
      return PRODUCT.variants.find(v => Object.keys(SELECTION).every(a => v.axes[a] === SELECTION[a]));
    }
    window.findMatchingVariant = findMatchingVariant;
    function isValueAvailable(axis, value) {
      var test = Object.assign({}, SELECTION, {[axis]: value});
      return PRODUCT.variants.some(v => Object.keys(test).every(a => v.axes[a] === test[a]));
    }
    function selectOption(axis, value) { SELECTION[axis] = value; updateUI(); }
    window.selectOption = selectOption;
    function updateUI() {
      document.querySelectorAll('.opt-pill').forEach(btn => {
        var axis = btn.dataset.axis, val = btn.dataset.value;
        btn.classList.toggle('selected', SELECTION[axis] === val);
        var avail = isValueAvailable(axis, val);
        btn.classList.toggle('unavailable', !avail);
        btn.disabled = !avail;
      });
      document.querySelectorAll('[data-axis-label]').forEach(el => {
        el.textContent = SELECTION[el.dataset.axisLabel] || '';
      });
      var matching = findMatchingVariant();
      var priceEl = document.getElementById('current-price');
      if (priceEl) priceEl.textContent = (matching && matching.price != null) ? fmtPrice(matching.price) : priceRange();
    }
    window.updateUI = updateUI;
    window.PRODUCT = PRODUCT;
    window.SELECTION = SELECTION;
    PRODUCT.axis_order.forEach(axis => {
      if (PRODUCT.axes[axis]?.length) SELECTION[axis] = PRODUCT.axes[axis][0];
    });
    updateUI();
    function addProductToCart() {
      var matching = findMatchingVariant();
      if (PRODUCT.axis_order.length && !matching) { alert("Veuillez sélectionner toutes les options."); return; }
      var prices = (PRODUCT.variants||[]).map(v=>v.price).filter(p=>p>0);
      var fallback = PRODUCT.price_min || (prices.length ? Math.min(...prices) : 0);
      var qtyInput = document.getElementById("qty-input");
      var qty = qtyInput ? Math.max(1, Math.min(99, parseInt(qtyInput.value)||1)) : 1;
      var item = { id: "${slug}", name: PRODUCT.title, price: matching ? matching.price : fallback,
        axes: Object.assign({}, SELECTION), image: "${images[0]}", quantity: qty };
      var cart = JSON.parse(localStorage.getItem("nova_style_cart")||"[]");
      var key = JSON.stringify({id:item.id, axes:item.axes});
      var idx = cart.findIndex(c => JSON.stringify({id:c.id,axes:c.axes})===key);
      if (idx >= 0) cart[idx].quantity = (cart[idx].quantity||1) + qty;
      else cart.push(item);
      localStorage.setItem("nova_style_cart", JSON.stringify(cart));
      document.dispatchEvent(new CustomEvent("cartUpdated"));
      var btn = document.getElementById("add-to-cart-btn");
      if (btn) { btn.textContent = "✓ Ajouté !"; setTimeout(()=>{ btn.textContent = "🛒 Ajouter au panier"; }, 1800); }
    }
    window.addProductToCart = addProductToCart;
  </script>
  <script src="/assets/product-qty.js" defer></script>
  <script type="module" src="/assets/reviews-widget.js"></script>
  <script src="/assets/footer.js" defer></script>
  <script type="module" src="/assets/cart.js"></script>
</body>
</html>`;
}
