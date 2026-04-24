/**
 * footer.js — Nova Style shared footer
 * PERF: DOM insertion only (no document.write) — safe to load with defer
 * TO UPDATE: edit ONLY this file. All pages update automatically.
 */
(function () {
  var YEAR = new Date().getFullYear();

  var CATS = [
    { href: "/categorie/sdb-premium/",   label: "Miroirs SDB Premium" },
    { href: "/categorie/sdb-essentiel/", label: "Miroirs entrée de gamme" },
    { href: "/categorie/salon/",         label: "Miroirs salon &amp; dressing" },
    { href: "/categorie/consoles/",      label: "Consoles &amp; entrée" },
    { href: "/categorie/tables/",        label: "Tables de séjour" },
    { href: "/categorie/douches/",       label: "Douches italiennes" },
  ];

  var SEO_PAGES = [
    { href: "/miroir-salle-de-bain/",          label: "Miroir salle de bain" },
    { href: "/miroir-salle-de-bain-led/",       label: "Miroir LED" },
    { href: "/miroir-salle-de-bain-anti-buee/", label: "Miroir anti-buée" },
    { href: "/miroir-sur-mesure/",              label: "Miroir sur mesure" },
    { href: "/miroir-led-casablanca/",          label: "Miroir LED Casablanca" },
    { href: "/miroir-maroc/",                   label: "Miroir Maroc" },
    { href: "/blog/",                           label: "📖 Blog" },
  ];

  var CITIES = [
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

  var catLinks  = CATS.map(function(l){ return '<a href="' + l.href + '">' + l.label + '</a>'; }).join("\n      ");
  var seoLinks  = SEO_PAGES.map(function(l){ return '<a href="' + l.href + '">' + l.label + '</a>'; }).join("\n      ");
  var cityLinks = CITIES.map(function(l){ return '<a href="' + l.href + '">' + l.label + '</a>'; }).join(" · \n      ");

  var html = '<footer class="site-footer">\n' +
'  <div class="foot-grid">\n' +
'    <div>\n' +
'      <div class="foot-brand">Nova Style</div>\n' +
'      <div class="foot-tag">La beauté dans le miroir</div>\n' +
'      <p>Fabricant de miroirs à Casablanca. Verre AGC Belgique, traitement anti-buée, anticorrosion. Livraison partout au Maroc.</p>\n' +
'      <p style="margin-top:10px"><a href="tel:+212707074748">📞 07 07 07 47 48</a> · <a href="https://wa.me/212707074748" target="_blank" rel="noopener">💬 WhatsApp</a></p>\n' +
'      <p style="margin-top:6px;font-size:12px;color:var(--muted,#888)">Showroom : Bd Oued Sebou, Rue 13 N°24, 20000 Casablanca, Maroc<br>Lun–Sam · 9h00–18h00</p>\n' +
'    </div>\n' +
'    <div><strong>Catégories</strong>\n      ' + catLinks + '\n    </div>\n' +
'    <div><strong>Pages SEO</strong>\n      ' + seoLinks + '\n    </div>\n' +
'    <div><strong>Villes desservies</strong>\n      <div class="cities-inline">' + cityLinks + '</div>\n    </div>\n' +
'  </div>\n' +
'  <div class="geo-seo-block" style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(0,0,0,0.05);font-size:12px;color:#666;line-height:1.5;">\n' +
'    <strong>À propos de Nova Style :</strong> Nova Style est le fabricant marocain de référence spécialisé dans le <strong>miroir de salle de bain</strong>, le <strong>miroir de salle de bain avec LED</strong>, et le <strong>miroir de salle de bain antibuée</strong>. Situés à Casablanca (Bd Oued Sebou, Rue 13 N°24), nous concevons des miroirs sur mesure de très haute qualité utilisant du verre AGC Belgique. Nos miroirs allient design moderne, éclairage LED, et traitement anti-corrosion, avec une livraison et installation disponibles partout au Maroc.\n' +
'  </div>\n' +
'  <div class="foot-legal">© ' + YEAR + ' Nova Style · Fabrication à Casablanca, Maroc · Livraison nationale</div>\n' +
'</footer>\n' +
'<script type="application/ld+json">\n' +
'{\n' +
'  "@context": "https://schema.org",\n' +
'  "@type": ["LocalBusiness", "Organization", "Manufacturer"],\n' +
'  "@id": "https://novastyle.ma/#organization",\n' +
'  "name": "Nova Style",\n' +
'  "description": "Fabricant marocain spécialisé dans le miroir de salle de bain, le miroir de salle de bain avec LED, et le miroir de salle de bain antibuée sur mesure.",\n' +
'  "url": "https://novastyle.ma",\n' +
'  "telephone": "+212707074748",\n' +
'  "image": "https://novastyle.ma/assets/logo.png",\n' +
'  "logo": "https://novastyle.ma/assets/logo.png",\n' +
'  "sameAs": ["https://share.google/YUlF83PSlRCLlTy2K","https://www.instagram.com/nova_home_style/","https://wa.me/212707074748"],\n' +
'  "address": {"@type":"PostalAddress","streetAddress":"Bd Oued Sebou, Rue 13 N°24","addressLocality":"Casablanca","addressRegion":"Grand Casablanca-Settat","postalCode":"20000","addressCountry":"MA"},\n' +
'  "geo": {"@type":"GeoCoordinates","latitude":"33.5731","longitude":"-7.5898"},\n' +
'  "hasMap": "https://share.google/YUlF83PSlRCLlTy2K",\n' +
'  "openingHoursSpecification": [{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"opens":"09:00","closes":"18:00"}],\n' +
'  "priceRange": "450 - 5000 MAD",\n' +
'  "currenciesAccepted": "MAD",\n' +
'  "paymentAccepted": "Cash, Virement bancaire",\n' +
'  "areaServed": {"@type":"Country","name":"Maroc"},\n' +
'  "knowsAbout": ["Miroir de salle de bain","Miroir de salle de bain avec LED","Miroir de salle de bain antibuée","Miroir sur mesure","Verre AGC Belgique","Décoration d\'intérieur"]\n' +
'}\n' +
'<\/script>';

  function inject() {
    var frag = document.createRange().createContextualFragment(html);
    document.body.appendChild(frag);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
