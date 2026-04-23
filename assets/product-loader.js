/**
 * product-loader.js
 * Lazy-fetches /products/{slug}.json and hydrates the product detail page.
 *
 * Designed to replace the baked-in PRODUCT object in statically generated pages.
 * The host page must have:
 *   <main id="product-root" data-slug="{slug}">
 *     <div id="p-gallery"></div>
 *     <div id="axes-container"></div>
 *     <div id="current-price"></div>
 *     <div id="p-desc"></div>
 *   </main>
 *
 * Pricing rule (per architectural decree): compute price range from actual
 * variant prices — never from raw price.min/max index fields.
 */

const root = document.getElementById('product-root');
if (!root) throw new Error('[product-loader] #product-root not found');

const slug = root.dataset.slug;
if (!slug) throw new Error('[product-loader] data-slug missing on #product-root');

let PRODUCT = null;
const SELECTION = {};

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtPrice(v) {
  return v == null ? '' : Math.round(v).toLocaleString('fr-FR') + ' MAD';
}

/** Compute price range directly from variant list (authoritative source). */
function priceRange() {
  const prices = (PRODUCT.variants || []).map(v => v.price).filter(p => p != null && p > 0);
  if (!prices.length) return '';
  const mn = Math.min(...prices), mx = Math.max(...prices);
  return mn === mx ? fmtPrice(mn) : fmtPrice(mn) + ' – ' + fmtPrice(mx);
}

/** O(n) variant lookup over ~40 variants max — instant for this dataset size. */
export function findMatchingVariant() {
  if (!PRODUCT) return null;
  return (PRODUCT.variants || []).find(v =>
    Object.keys(SELECTION).every(a => v.axes[a] === SELECTION[a])
  );
}

function isValueAvailable(axis, value) {
  const test = { ...SELECTION, [axis]: value };
  return (PRODUCT.variants || []).some(v =>
    Object.keys(test).every(a => v.axes[a] === test[a])
  );
}

export function selectOption(axis, value) {
  SELECTION[axis] = value;
  updateUI();
}

export function updateUI() {
  document.querySelectorAll('.opt-pill').forEach(btn => {
    const { axis, value } = btn.dataset;
    btn.classList.toggle('selected', SELECTION[axis] === value);
    const avail = isValueAvailable(axis, value);
    btn.classList.toggle('unavailable', !avail);
    btn.disabled = !avail;
  });
  document.querySelectorAll('[data-axis-label]').forEach(el => {
    el.textContent = SELECTION[el.dataset.axisLabel] || '';
  });
  const matching = findMatchingVariant();
  const priceEl = document.getElementById('current-price');
  if (priceEl) {
    priceEl.textContent = (matching && matching.price != null) ? fmtPrice(matching.price) : priceRange();
  }
}

export function addProductToCart() {
  const matching = findMatchingVariant();
  const axisOrder = PRODUCT.axes?.order || [];
  if (axisOrder.length && !matching) {
    alert('Veuillez sélectionner toutes les options.');
    return;
  }

  // Price from matched variant; fallback computed from variants (never from index price.min).
  const prices = (PRODUCT.variants || []).map(v => v.price).filter(p => p > 0);
  const fallback = prices.length ? Math.min(...prices) : 0;
  const price = matching ? matching.price : fallback;

  const qtyInput = document.getElementById('qty-input');
  const qty = qtyInput ? Math.max(1, Math.min(99, parseInt(qtyInput.value) || 1)) : 1;

  const item = {
    id: slug,
    name: PRODUCT.name,
    price,
    axes: { ...SELECTION },
    image: PRODUCT.images?.[0] || '',
    quantity: qty,
  };

  const cart = JSON.parse(localStorage.getItem('nova_style_cart') || '[]');
  const key = JSON.stringify({ id: item.id, axes: item.axes });
  const idx = cart.findIndex(c => JSON.stringify({ id: c.id, axes: c.axes }) === key);
  if (idx >= 0) cart[idx].quantity = (cart[idx].quantity || 1) + qty;
  else cart.push(item);

  localStorage.setItem('nova_style_cart', JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent('cartUpdated'));

  const btn = document.getElementById('add-to-cart-btn');
  if (btn) {
    btn.textContent = '✓ Ajouté !';
    setTimeout(() => { btn.textContent = '🛒 Ajouter au panier'; }, 1800);
  }
}

// Expose to onclick attributes in HTML (non-module context).
window.selectOption = selectOption;
window.addProductToCart = addProductToCart;
window.findMatchingVariant = findMatchingVariant;
window.updateUI = updateUI;

// ─── hydration ──────────────────────────────────────────────────────────────

async function hydrate() {
  const res = await fetch(`/products/${slug}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status} loading /products/${slug}.json`);
  PRODUCT = await res.json();

  // Expose for product-qty.js compatibility.
  window.PRODUCT = PRODUCT;
  window.SELECTION = SELECTION;

  // Gallery — main image + thumbnails
  const gallery = document.getElementById('p-gallery');
  if (gallery && PRODUCT.images?.length) {
    const imgs = PRODUCT.images;
    const alt = PRODUCT.name.replace(/"/g, '&quot;');

    const thumbsHTML = imgs.length > 1
      ? `<div class="thumbs">${imgs.map((src, i) =>
          `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" class="${i === 0 ? 'active' : ''}" onclick="window.setMainImg(this)">`
        ).join('')}</div>`
      : '';

    gallery.innerHTML = `<div class="p-gallery-wrap">
  <div class="p-gallery-main-wrap">
    <img id="main-img" src="${imgs[0]}" alt="${alt}" fetchpriority="high" decoding="async"
      onload="this.closest('.p-gallery-main-wrap').classList.add('img-ready')">
  </div>
  ${thumbsHTML}
</div>`;

    window.setMainImg = function(thumb) {
      const mainImg = document.getElementById('main-img');
      if (!mainImg) return;
      const wrap = mainImg.closest('.p-gallery-main-wrap');
      wrap?.classList.remove('img-ready');
      mainImg.src = thumb.src;
      mainImg.onload = () => wrap?.classList.add('img-ready');
      document.querySelectorAll('.thumbs img').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    };
  }

  // Variant option pills
  const axesContainer = document.getElementById('axes-container');
  if (axesContainer) {
    const order = PRODUCT.axes?.order || [];
    const options = PRODUCT.axes?.options || {};
    axesContainer.innerHTML = order
      .map(axis => {
        const pills = (options[axis] || [])
          .map(v =>
            `<button type="button" class="opt-pill" data-axis="${axis}" data-value="${v}" onclick="selectOption('${axis}','${v.replace(/'/g, "\\'")}')">` +
            `${v}</button>`
          )
          .join('');
        return `<div class="axis-row">
  <div class="axis-label">${axis} <span class="selected-val" data-axis-label="${axis}"></span></div>
  <div class="opt-values" data-axis="${axis}">${pills}</div>
</div>`;
      })
      .join('\n');
  }

  // Description
  const descEl = document.getElementById('p-desc');
  if (descEl && PRODUCT.description) {
    descEl.innerHTML = `<p>${PRODUCT.description}</p>`;
  }

  // Auto-select first value in each axis.
  const order = PRODUCT.axes?.order || [];
  const options = PRODUCT.axes?.options || {};
  order.forEach(axis => {
    if (options[axis]?.length) SELECTION[axis] = options[axis][0];
  });

  updateUI();
}

hydrate().catch(err => {
  console.error('[product-loader]', err);
  root.insertAdjacentHTML(
    'beforeend',
    `<p style="color:red;padding:20px">Erreur de chargement du produit. <a href="/">Retour à l'accueil</a></p>`
  );
});
