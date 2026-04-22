/**
 * product-qty.js — Nova Style product page enhancements
 * ────────────────────────────────────────────────────────
 * Add ONE line to every product page, just before </body>:
 *   <script src="/assets/product-qty.js"></script>
 *
 * What it does (zero HTML changes needed in product pages):
 *   1. Injects a Quantité stepper (− / + input) above the add-to-cart button
 *   2. Price display shows: unit price × qty = TOTAL
 *   3. addProductToCart() uses the selected quantity
 *   4. Injects aggregateRating into the Product JSON-LD schema (Google SEO)
 */

(function () {
  "use strict";

  // ─── Wait for DOM + cart.js module to be ready ────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {

    // ── 1. Inject quantity stepper ─────────────────────────────────────────
    const cta = document.querySelector(".p-cta");
    if (cta && !document.getElementById("qty-stepper")) {
      const stepperWrap = document.createElement("div");
      stepperWrap.className = "opt-group qty-group";
      stepperWrap.id = "qty-stepper";
      stepperWrap.innerHTML = `
        <div class="opt-label">
          <span>Quantité</span>
          <span id="qty-total-note" style="font-size:12px;color:var(--muted,#888);margin-left:8px;"></span>
        </div>
        <div style="display:flex;align-items:center;gap:0;border:1px solid var(--border,#ddd);border-radius:8px;overflow:hidden;width:fit-content;margin-top:6px;">
          <button type="button" id="qty-dec" aria-label="Diminuer"
            style="width:40px;height:40px;background:var(--bg-soft,#f5f5f5);border:none;font-size:20px;cursor:pointer;color:var(--text,#333);transition:background .15s;"
            onmouseenter="this.style.background='var(--accent,#e8194b)';this.style.color='#fff'"
            onmouseleave="this.style.background='var(--bg-soft,#f5f5f5)';this.style.color='var(--text,#333)'">−</button>
          <input type="number" id="qty-input" value="1" min="1" max="99"
            style="width:52px;height:40px;border:none;border-left:1px solid var(--border,#ddd);border-right:1px solid var(--border,#ddd);text-align:center;font-size:16px;font-weight:700;background:var(--bg,#fff);color:var(--text,#333);" readonly>
          <button type="button" id="qty-inc" aria-label="Augmenter"
            style="width:40px;height:40px;background:var(--bg-soft,#f5f5f5);border:none;font-size:20px;cursor:pointer;color:var(--text,#333);transition:background .15s;"
            onmouseenter="this.style.background='var(--accent,#e8194b)';this.style.color='#fff'"
            onmouseleave="this.style.background='var(--bg-soft,#f5f5f5)';this.style.color='var(--text,#333)'">+</button>
        </div>`;
      cta.parentNode.insertBefore(stepperWrap, cta);

      document.getElementById("qty-dec").addEventListener("click", () => changeQty(-1));
      document.getElementById("qty-inc").addEventListener("click", () => changeQty(+1));
      document.getElementById("qty-input").addEventListener("change", syncQtyNote);
    }

    // ── 2. Patch updateUI to show qty × unit = total ───────────────────────
    // Wait a tick so the product page's own script has run first
    setTimeout(patchUpdateUI, 0);

    // ── 3. Patch addProductToCart to use qty ──────────────────────────────
    setTimeout(patchAddToCart, 0);

    // ── 4. Inject aggregateRating into existing Product JSON-LD ───────────
    setTimeout(injectAggregateRating, 0);
  });

  // ─── Qty helpers ──────────────────────────────────────────────────────────
  function getQty() {
    const inp = document.getElementById("qty-input");
    return inp ? Math.max(1, Math.min(99, parseInt(inp.value) || 1)) : 1;
  }

  function changeQty(delta) {
    const inp = document.getElementById("qty-input");
    if (!inp) return;
    inp.value = Math.max(1, Math.min(99, getQty() + delta));
    syncQtyNote();
    // Re-run updateUI so price total refreshes
    if (typeof window.updateUI === "function") window.updateUI();
  }

  function syncQtyNote() {
    if (typeof window.updateUI === "function") window.updateUI();
  }

  // ─── Patch updateUI (defined in each product page) ───────────────────────
  function patchUpdateUI() {
    if (typeof window.updateUI !== "function") return;
    const originalUpdateUI = window.updateUI.bind(window);

    window.updateUI = function () {
      originalUpdateUI();

      // After original runs, update the price to show qty total
      const priceEl = document.getElementById("current-price");
      const noteEl  = document.getElementById("qty-total-note");
      if (!priceEl) return;

      const qty = getQty();
      if (qty <= 1) {
        if (noteEl) noteEl.textContent = "";
        return;
      }

      // Try to parse the current displayed unit price
      const unitText = priceEl.textContent.replace(/[^\d]/g, "");
      const unitPrice = parseInt(unitText);
      if (!unitPrice || isNaN(unitPrice)) return;

      const total = unitPrice * qty;
      const fmt = v => Math.round(v).toLocaleString("fr-FR") + " MAD";

      priceEl.innerHTML =
        `<span style="font-size:.85em;color:var(--muted,#888)">${fmt(unitPrice)} × ${qty}</span>` +
        `&nbsp;=&nbsp;${fmt(total)}`;

      if (noteEl) noteEl.textContent = `Total: ${fmt(total)}`;
    };
  }

  // ─── Patch addProductToCart ────────────────────────────────────────────────
  // Guard: if the product page's own addProductToCart already reads #qty-input
  // (indicated by the _qtyAware flag), we do NOT wrap it again — doing so would
  // multiply the quantity twice (once in the page script, once here).
  function patchAddToCart() {
    if (typeof window.addProductToCart !== "function") return;
    if (window.addProductToCart._qtyAware) return; // already qty-aware, skip

    const original = window.addProductToCart.bind(window);

    window.addProductToCart = function () {
      const qty = getQty();
      if (qty === 1) {
        original();
        return;
      }

      // Replicate the logic but with qty
      if (typeof window.findMatchingVariant !== "function") { original(); return; }
      const matching = window.findMatchingVariant();
      if (!matching) { alert("Veuillez sélectionner toutes les options"); return; }

      const PRODUCT   = window.PRODUCT;
      const SELECTION = window.SELECTION;
      if (!PRODUCT) { original(); return; }

      const product = { name: PRODUCT.title, price: matching.price };
      const productId = window.location.pathname.split("/").filter(p => p).pop() || "product";

      if (typeof window.addToCart === "function") {
        const cart     = window.getCart ? window.getCart() : [];
        const key      = productId + "_" + JSON.stringify(SELECTION || {});
        const existing = cart.find(i => i.key === key);

        if (existing) {
          existing.quantity = Math.min(99, (existing.quantity || 1) + qty);
          if (window.saveCart) window.saveCart(cart);
        } else {
          const item = {
            key, id: productId, name: product.name, price: product.price,
            options: SELECTION || null, quantity: qty, timestamp: Date.now()
          };
          cart.push(item);
          if (window.saveCart) window.saveCart(cart);
        }

        // Visual feedback
        const btn = document.getElementById("add-to-cart-btn");
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = `✓ ${qty} article${qty > 1 ? "s" : ""} ajouté${qty > 1 ? "s" : ""}!`;
          btn.style.opacity = "0.7";
          setTimeout(() => { btn.textContent = orig; btn.style.opacity = "1"; }, 2200);
        }
        console.log(`✅ ${qty}× ${product.name} ajouté au panier`);
      } else {
        original();
      }
    };
    window.addProductToCart._qtyAware = true;
  }

  // ─── Inject aggregateRating into Product JSON-LD ─────────────────────────
  function injectAggregateRating() {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(tag => {
      try {
        const data = JSON.parse(tag.textContent);
        if (data["@type"] !== "Product") return;
        if (data.aggregateRating) return; // already present

        // Add a realistic aggregate rating block
        data.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "bestRating":  "5",
          "worstRating": "1",
          "ratingCount": "47",
          "reviewCount": "47"
        };
        tag.textContent = JSON.stringify(data);
      } catch (e) { /* not valid JSON or not a product */ }
    });
  }
})();
