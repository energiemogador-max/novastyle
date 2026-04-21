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
        Showroom : Route de Médiouna, 20000 Casablanca, Maroc<br>
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
  
  <div class="geo-seo-block" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05); font-size: 12px; color: #666; line-height: 1.5;">
    <strong>À propos de Nova Style :</strong> Nova Style est le fabricant marocain de référence spécialisé dans le <strong>miroir de salle de bain</strong>, le <strong>miroir de salle de bain avec LED</strong>, et le <strong>miroir de salle de bain antibuée</strong>. Situés à Casablanca (Route de Médiouna), nous concevons des miroirs sur mesure de très haute qualité utilisant du verre AGC Belgique. Nos miroirs allient design moderne, éclairage LED, et traitement anti-corrosion, avec une livraison et installation disponibles partout au Maroc.
  </div>

  <div class="foot-legal">© ${YEAR} Nova Style · Fabrication à Casablanca, Maroc · Livraison nationale</div>
</footer>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization", "Manufacturer"],
  "@id": "https://novastyle.ma/#organization",
  "name": "Nova Style",
  "description": "Fabricant marocain spécialisé dans le miroir de salle de bain, le miroir de salle de bain avec LED, et le miroir de salle de bain antibuée sur mesure.",
  "url": "https://novastyle.ma",
  "telephone": "+212707074748",
  "image": "https://novastyle.ma/assets/logo.png",
  "logo": "https://novastyle.ma/assets/logo.png",
  "sameAs": [
    "https://share.google/YUlF83PSlRCLlTy2K",
    "https://www.instagram.com/nova_home_style/",
    "https://wa.me/212707074748"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Route de Médiouna",
    "addressLocality": "Casablanca",
    "addressRegion": "Grand Casablanca-Settat",
    "postalCode": "20000",
    "addressCountry": "MA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "33.5731",
    "longitude": "-7.5898"
  },
  "hasMap": "https://share.google/YUlF83PSlRCLlTy2K",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "450 - 5000 MAD",
  "currenciesAccepted": "MAD",
  "paymentAccepted": "Cash, Virement bancaire",
  "areaServed": {
    "@type": "Country",
    "name": "Maroc"
  },
  "knowsAbout": [
    "Miroir de salle de bain",
    "Miroir de salle de bain avec LED",
    "Miroir de salle de bain antibuée",
    "Miroir sur mesure",
    "Verre AGC Belgique",
    "Décoration d'intérieur"
  ]
}
</script>\`;

  document.write(html);
})();
