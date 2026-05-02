/**
 * product-page-enhancer.js — Impeccable edition
 * Applied to all product pages. Uses only design system tokens (var(--*)).
 * 1. Upgrade add-to-cart button style
 * 2. Trust micro-strip (guaranteed, delivery, AGC)
 * 3. Sticky WA floating button on mobile
 * 4. Gallery fade-in handler
 */
(function () {
  if (!document.querySelector('.product-info, .product-page')) return;

  const css = `
  /* ── Add to cart button ── */
  #add-to-cart-btn {
    width: 100%;
    font-size: 1rem !important;
    font-weight: 700 !important;
    padding: 15px 24px !important;
    border-radius: var(--radius-pill) !important;
    letter-spacing: 0.01em;
    background: var(--brand) !important;
    color: var(--surface) !important;
    border: none !important;
    cursor: pointer;
    transition: opacity .15s, transform .1s !important;
    min-height: 52px !important;
  }
  #add-to-cart-btn:hover { opacity: .92; transform: translateY(-1px); }
  #add-to-cart-btn:active { transform: translateY(0); }

  /* ── Deposit hint ── */
  .ns-deposit-hint {
    font-size: 0.8125rem;
    color: var(--text-soft);
    margin: 8px 0 16px;
    background: var(--brand-dim);
    border: 1px solid oklch(38% 0.12 28 / 0.15);
    border-radius: var(--radius);
    padding: 9px 14px;
    line-height: 1.5;
  }
  .ns-deposit-hint strong { color: var(--brand); }

  /* ── Trust micro-strip ── */
  .ns-trust-micro {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
  }
  .ns-trust-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    padding: 5px 10px;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--text-soft);
    white-space: nowrap;
  }

  /* ── Floating WA btn (mobile only) ── */
  .ns-float-wa {
    display: none;
    position: fixed;
    bottom: 80px;
    right: 16px;
    z-index: 450;
    background: var(--wa);
    color: #fff;
    border: none;
    border-radius: var(--radius-pill);
    padding: 12px 18px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 4px 20px oklch(58% 0.18 148 / 0.35);
    transition: transform .15s, opacity .15s;
    align-items: center;
    gap: 6px;
    font-family: var(--font-ui);
  }
  .ns-float-wa:hover { transform: translateY(-2px); opacity: .95; }
  @media (max-width: 768px) {
    .ns-float-wa { display: inline-flex; }
  }

  /* ── Gallery fade-in ── */
  .product-gallery img#main-img {
    opacity: 0;
    transition: opacity .25s ease-out;
    background: var(--surface-2);
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }
  .product-gallery img#main-img.loaded { opacity: 1; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── Gallery ───────────────────────────────────────────────────────────────
  const mainImg = document.getElementById('main-img');
  if (mainImg) {
    function markLoaded() { mainImg.classList.add('loaded'); }
    if (mainImg.complete) markLoaded();
    else mainImg.addEventListener('load', markLoaded);

    // Thumb click
    document.querySelectorAll('.thumbs img').forEach(function(thumb) {
      thumb.style.display = '';
      thumb.addEventListener('click', function() {
        document.querySelectorAll('.thumbs img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainImg.classList.remove('loaded');
        mainImg.src = thumb.src;
        mainImg.addEventListener('load', function onLoad() {
          mainImg.classList.add('loaded');
          mainImg.removeEventListener('load', onLoad);
        });
      });
      if (thumb.src === mainImg.src) thumb.classList.add('active');
    });

    // Show thumbs container
    const thumbsEl = document.querySelector('.thumbs');
    if (thumbsEl) thumbsEl.style.display = '';
  }

  // ── Trust micro-strip ─────────────────────────────────────────────────────
  const infoEl = document.querySelector('.product-info');
  if (infoEl) {
    const trust = document.createElement('div');
    trust.className = 'ns-trust-micro';
    trust.innerHTML = `
      <span class="ns-trust-pill">🇧🇪 Verre AGC Belgique</span>
      <span class="ns-trust-pill">💧 Anti-buée 3 ans</span>
      <span class="ns-trust-pill">🚚 Livraison gratuite</span>
      <span class="ns-trust-pill">🏭 Fabriqué à Casablanca</span>`;
    const priceEl = document.getElementById('current-price');
    if (priceEl) priceEl.after(trust);
    else infoEl.appendChild(trust);

    // Deposit hint
    const depositHint = document.createElement('div');
    depositHint.className = 'ns-deposit-hint';
    depositHint.innerHTML = '<strong>💡 Acompte 50%</strong> à la commande — solde à la livraison ou installation.';
    const ctaEl = document.querySelector('.p-cta');
    if (ctaEl) ctaEl.before(depositHint);
  }

  // ── Floating WA ───────────────────────────────────────────────────────────
  const WA = '212635228074';
  const waBtn = document.getElementById('wa-order-btn');
  const waHref = waBtn ? waBtn.href : `https://wa.me/${WA}`;
  const floatWA = document.createElement('a');
  floatWA.className = 'ns-float-wa';
  floatWA.href = waHref;
  floatWA.target = '_blank';
  floatWA.rel = 'noopener';
  floatWA.innerHTML = '💬 Commander';
  document.body.appendChild(floatWA);

  // Sync href with variant selection
  if (waBtn) {
    new MutationObserver(() => { floatWA.href = waBtn.href; })
      .observe(waBtn, { attributes: true, attributeFilter: ['href'] });
  }

  // Hide when cart CTA is visible on screen
  if ('IntersectionObserver' in window) {
    const ctaEl = document.querySelector('.p-cta');
    if (ctaEl) {
      new IntersectionObserver(([entry]) => {
        floatWA.style.opacity = entry.isIntersecting ? '0' : '1';
        floatWA.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
      }, { threshold: 0.5 }).observe(ctaEl);
    }
  }
})();
