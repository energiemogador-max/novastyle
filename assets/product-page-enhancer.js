/**
 * product-page-enhancer.js
 * Upgrades all product pages with:
 *  1. "Commander maintenant" primary CTA (full-width, bold)
 *  2. Deposit hint line (50% à la commande)
 *  3. 4-step prepayment trust block
 *  4. Trust badge strip below CTA
 */
(function () {
  if (!document.querySelector('.product-info, .product-page, [class*="product"]')) return;

  // ── Styles ────────────────────────────────────────────────────────────────
  const css = `
  /* ── Commander button ─────────────────────────────── */
  #add-to-cart-btn {
    width: 100%;
    font-size: 16px !important;
    font-weight: 700 !important;
    padding: 16px 24px !important;
    border-radius: 10px !important;
    letter-spacing: 0.01em;
    box-shadow: 0 4px 18px rgba(107,41,41,.22);
    transition: opacity .15s, transform .1s !important;
  }
  #add-to-cart-btn:hover { opacity: .92; transform: translateY(-1px); }
  #add-to-cart-btn:active { transform: translateY(0); }

  /* ── Deposit hint line ────────────────────────────── */
  .ns-deposit-hint {
    font-size: 13px;
    color: #555;
    margin: 6px 0 14px;
    background: #f8f4ff;
    border: 1px solid #e2d8f5;
    border-radius: 7px;
    padding: 9px 14px;
    line-height: 1.5;
  }
  .ns-deposit-hint strong { color: #6b2929; font-size: 14px; }

  /* ── Trust badge strip ────────────────────────────── */
  .ns-trust-strip-mini {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 10px 0 0;
  }
  .ns-trust-strip-mini span {
    font-size: 11px;
    font-weight: 600;
    color: #444;
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    padding: 4px 10px;
    white-space: nowrap;
  }

  /* ── Prepayment trust block ───────────────────────── */
  .ns-prepayment-trust {
    margin: 20px 0 10px;
    background: linear-gradient(135deg,#fdfcff 0%,#f9f5ff 100%);
    border: 1.5px solid #e0d4f5;
    border-radius: 12px;
    padding: 18px 20px;
  }
  .ns-prepayment-trust .pt-header {
    font-size: 13px;
    font-weight: 700;
    color: #6b2929;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .ns-prepayment-trust ol.pt-steps {
    margin: 0 0 14px 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .ns-prepayment-trust ol.pt-steps li {
    font-size: 13px;
    color: #333;
    line-height: 1.5;
  }
  .ns-prepayment-trust .pt-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    border-top: 1px solid #e8dff5;
    padding-top: 12px;
    margin-top: 2px;
  }
  .ns-prepayment-trust .pt-badges span {
    font-size: 11px;
    font-weight: 600;
    color: #2a6b3a;
    background: #f0faf3;
    border: 1px solid #c8ecd2;
    border-radius: 20px;
    padding: 4px 10px;
  }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Rename button ─────────────────────────────────────────────────────────
  const btn = document.getElementById('add-to-cart-btn');
  if (btn) {
    btn.textContent = 'Commander maintenant';
  }

  // ── Inject deposit hint after price element ───────────────────────────────
  const priceEl = document.getElementById('current-price');
  if (priceEl && !document.getElementById('ns-deposit-hint')) {
    priceEl.insertAdjacentHTML('afterend',
      '<div class="ns-deposit-hint" id="ns-deposit-hint">Réservez avec <strong>50% à la commande</strong> — solde en cash à la livraison après inspection</div>'
    );
  }

  // ── Inject trust strip + prepayment block after .p-cta ────────────────────
  const ctaDiv = document.querySelector('.p-cta');
  if (ctaDiv && !document.querySelector('.ns-prepayment-trust')) {
    ctaDiv.insertAdjacentHTML('afterend', `
<div class="ns-trust-strip-mini">
  <span>🇧🇪 Verre AGC Belgique</span>
  <span>🏭 Fabriqué Casablanca</span>
  <span>🛡️ Garantie 3 ans</span>
  <span>✔ Atelier visitable</span>
</div>
<div class="ns-prepayment-trust">
  <div class="pt-header">🔐 Comment fonctionne votre commande</div>
  <ol class="pt-steps">
    <li>Vous payez <strong>50% maintenant</strong> pour lancer la fabrication sur mesure</li>
    <li>Votre miroir est fabriqué dans notre atelier en <strong>5 à 7 jours</strong></li>
    <li>Vous recevez <strong>3 photos de validation</strong> avant l'expédition</li>
    <li>Vous réglez les <strong>50% restants à la livraison</strong>, après inspection</li>
  </ol>
  <div class="pt-badges">
    <span>✅ Facture officielle</span>
    <span>✅ Garantie 3 ans</span>
    <span>✅ Échange immédiat si défaut</span>
    <span>✅ Atelier Bd Oued Sebou, Casa</span>
  </div>
</div>`
    );
  }
})();
