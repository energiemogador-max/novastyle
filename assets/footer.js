/**
 * footer.js — Nova Style shared footer
 * ──────────────────────────────────────
 * HOW TO USE: replace <footer>…</footer> in every page with:
 *   <script src="/assets/footer.js"></script>
 * TO UPDATE: edit ONLY this file. All pages update automatically.
 */
(function () {
  const YEAR = new Date().getFullYear();

  // ── Edit links here ─────────────────────────────────────────────────────
  const CATS = [
    { href: "/categorie/sdb-premium/",   label: "Miroirs SDB Premium" },
    { href: "/categorie/sdb-essentiel/", label: "Miroirs entrée de gamme" },
    { href: "/categorie/salon/",         label: "Miroirs salon &amp; dressing" },
    { href: "/categorie/consoles/",      label: "Consoles &amp; entrée" },
    { href: "/categorie/tables/",        label: "Tables de séjour" },
    { href: "/categorie/douches/",       label: "Douches italiennes" },
  ];

  const SEO_PAGES = [
    { href: "/miroir-salle-de-bain/",          label: "Miroir salle de bain" },
    { href: "/miroir-salle-de-bain-led/",       label: "Miroir LED" },
    { href: "/miroir-salle-de-bain-anti-buee/", label: "Miroir anti-buée" },
    { href: "/miroir-sur-mesure/",              label: "Miroir sur mesure" },
    { href: "/miroir-led-casablanca/",          label: "Miroir LED Casablanca" },
    { href: "/miroir-maroc/",                   label: "Miroir Maroc" },
  ];

  const CITIES = [
    { href: "/miroir-salle-de-bain-casablanca/",  label: "Casablanca" },
    { href: "/miroir-salle-de-bain-rabat/",        label: "Rabat" },
    { href: "/miroir-salle-de-bain-marrakech/",    label: "Marrakech" },
    { href: "/miroir-salle-de-bain-tanger/",       label: "Tanger" },
    { href: "/miroir-salle-de-bain-fes/",          label: "Fès" },
    { href: "/miroir-salle-de-bain-agadir/",       label: "Agadir" },
    { href: "/miroir-salle-de-bain-meknes/",       label: "Meknès" },
    { href: "/miroir-salle-de-bain-oujda/",        label: "Oujda" },
    { href: "/miroir-salle-de-bain-kenitra/",      label: "Kénitra" },
    { href: "/miroir-salle-de-bain-eljadida/",     label: "El Jadida" },
    { href: "/miroir-salle-de-bain-tetouan/",      label: "Tétouan" },
    { href: "/miroir-salle-de-bain-mohammedia/",   label: "Mohammedia" },
  ];

  const catLinks    = CATS.map(l => `<a href="${l.href}">${l.label}</a>`).join("\n      ");
  const seoLinks    = SEO_PAGES.map(l => `<a href="${l.href}">${l.label}</a>`).join("\n      ");
  const cityLinks   = CITIES.map(l => `<a href="${l.href}">${l.label}</a>`).join(" · \n      ");

  const html = `
<footer class="site-footer">
  <div class="foot-grid">
    <div>
      <div class="foot-brand">Nova Style</div>
      <div class="foot-tag">La beauté dans le miroir</div>
      <p>Fabricant de miroirs à Casablanca. Verre AGC Belgique, traitement anti-buée, anticorrosion. Livraison partout au Maroc.</p>
      <p style="margin-top:10px">
        <a href="tel:+212707074748">📞 07 07 07 47 48</a> ·
        <a href="https://wa.me/212707074748" target="_blank" rel="noopener">💬 WhatsApp</a>
      </p>
      <p style="margin-top:6px;font-size:12px;color:var(--muted,#888)">
        Showroom : Route de Médiouna, Casablanca<br>
        Lun–Sam · 9h00–18h00
      </p>
    </div>
    <div>
      <strong>Catégories</strong>
      ${catLinks}
    </div>
    <div>
      <strong>Pages SEO</strong>
      ${seoLinks}
    </div>
    <div>
      <strong>Villes desservies</strong>
      <div class="cities-inline">
        ${cityLinks}
      </div>
    </div>
  </div>
  <div class="foot-legal">© ${YEAR} Nova Style · Fabrication à Casablanca, Maroc · Livraison nationale</div>
</footer>`;

  document.write(html);
})();
