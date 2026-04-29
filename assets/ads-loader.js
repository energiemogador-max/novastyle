// Fetches /ads_config.json and injects tracking pixels (GA4, Google Ads, Meta, TikTok).
// Included on every public page; safe to load when config is absent.
(async () => {
  try {
    const res = await fetch('/ads_config.json');
    if (!res.ok) return;
    const cfg = await res.json();
    if (!cfg) return;

    const ga4    = cfg.google_ga4    && cfg.google_ga4.trim();
    const gads   = cfg.google_ads    && cfg.google_ads.trim();
    const meta   = cfg.meta_pixel    && cfg.meta_pixel.trim();
    const tiktok = cfg.tiktok_pixel  && cfg.tiktok_pixel.trim();

    // Google tag (GA4 + Google Ads)
    if (ga4 || gads) {
      const measurementId = ga4 || gads;
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(s);
      const inline = document.createElement('script');
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${ga4 ? `gtag('config','${ga4}');` : ''}${gads ? `gtag('config','${gads}');` : ''}`;
      document.head.appendChild(inline);
    }

    // Meta Pixel
    if (meta) {
      // Init pixel — inline script executes synchronously so fbq exists immediately after
      const inline = document.createElement('script');
      inline.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`;
      document.head.appendChild(inline);
      // Wire up e-commerce events now that fbq exists
      setupMetaEvents();
    }

    // TikTok Pixel
    if (tiktok) {
      const inline = document.createElement('script');
      inline.textContent = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktok}');ttq.page()}(window,document,'ttq');`;
      document.head.appendChild(inline);
      // Wire up e-commerce events now that ttq exists
      setupTikTokEvents();
    }
  } catch (e) {
    // Silently ignore — ads config file may not exist yet
  }
})();

function setupMetaEvents() {
  const path = location.pathname;
  const isProduct     = !!document.querySelector('.product-info, .product-page, [class*="product-"]');
  const isCart        = path.includes('cart');
  const isConfirmation = path.includes('confirmation');

  // ── ViewContent on product pages ────────────────────────────────────────────
  if (isProduct) {
    // Delay 800ms so JS-rendered price has time to fill in
    setTimeout(function () {
      const h1      = document.querySelector('h1');
      const name    = h1 ? h1.textContent.trim() : document.title;
      const priceEl = document.getElementById('current-price');
      let price = 0;
      if (priceEl) {
        const m = priceEl.textContent.replace(/[\s ,]/g, '').match(/\d+/);
        if (m) price = parseInt(m[0], 10);
      }
      const slug = path.split('/').filter(Boolean).pop() || '';
      window.fbq('track', 'ViewContent', {
        content_name: name,
        content_ids:  [slug],
        content_type: 'product',
        currency:     'MAD',
        value:        price
      });
    }, 800);
  }

  // ── AddToCart — patch window.addToCart once cart.js defines it ──────────────
  function patchAddToCart(tries) {
    if (typeof window.addToCart === 'function' && !window._fbPatched) {
      window._fbPatched = true;
      const orig = window.addToCart;
      window.addToCart = function (id, product, options, qty) {
        orig(id, product, options, qty);
        window.fbq('track', 'AddToCart', {
          content_name: (product && product.name) || '',
          content_ids:  [id || ''],
          content_type: 'product',
          currency:     'MAD',
          value:        ((product && product.price) || 0) * Math.max(1, parseInt(qty) || 1)
        });
      };
    } else if ((tries || 0) < 20) {
      setTimeout(function () { patchAddToCart((tries || 0) + 1); }, 300);
    }
  }
  patchAddToCart();

  // ── InitiateCheckout — fire once when the order submit button is clicked ─────
  if (isCart) {
    document.addEventListener('click', function onCheckout(e) {
      if (e.target.closest('.btn-submit, [data-submit-order], button[type="submit"]')) {
        document.removeEventListener('click', onCheckout);
        window.fbq('track', 'InitiateCheckout', {
          currency:  'MAD',
          value:     typeof window.getCartTotal === 'function' ? window.getCartTotal() : 0,
          num_items: typeof window.getCart === 'function'
            ? window.getCart().reduce(function (s, i) { return s + (i.quantity || 1); }, 0)
            : 1
        });
      }
    });
  }

  // ── Purchase — read order from sessionStorage on confirmation page ───────────
  if (isConfirmation) {
    try {
      const ord = JSON.parse(sessionStorage.getItem('nova_confirmation_order') || 'null');
      if (ord && ord.total) {
        window.fbq('track', 'Purchase', {
          currency:     'MAD',
          value:        ord.total,
          content_ids:  (ord.items || []).map(function (i) { return i.name; }),
          content_type: 'product',
          order_id:     ord.id || ''
        });
      }
    } catch (e) {}
  }

  // ── Contact — WhatsApp button taps ──────────────────────────────────────────
  document.addEventListener('click', function (e) {
    if (e.target.closest('a[href*="wa.me"], a[href*="whatsapp"]')) {
      window.fbq('track', 'Contact');
    }
  });
}

function setupTikTokEvents() {
  const path = location.pathname;
  const isProduct     = !!document.querySelector('.product-info, .product-page, [class*="product-"]');
  const isCart        = path.includes('cart');
  const isConfirmation = path.includes('confirmation');

  // ── ViewContent on product pages ────────────────────────────────────────────
  if (isProduct) {
    // Delay 800ms so JS-rendered price has time to fill in
    setTimeout(function () {
      const h1      = document.querySelector('h1');
      const name    = h1 ? h1.textContent.trim() : document.title;
      const priceEl = document.getElementById('current-price');
      let price = 0;
      if (priceEl) {
        const m = priceEl.textContent.replace(/[\s ,]/g, '').match(/\d+/);
        if (m) price = parseInt(m[0], 10);
      }
      const slug = path.split('/').filter(Boolean).pop() || '';
      window.ttq.track('ViewContent', {
        content_name: name,
        content_id:   slug,
        content_type: 'product',
        currency:     'MAD',
        value:        price
      });
    }, 800);
  }

  // ── AddToCart — patch window.addToCart once cart.js defines it ──────────────
  function patchAddToCart(tries) {
    if (typeof window.addToCart === 'function' && !window._ttPatched) {
      window._ttPatched = true;
      const orig = window.addToCart;
      window.addToCart = function (id, product, options, qty) {
        orig(id, product, options, qty);
        window.ttq.track('AddToCart', {
          content_name: (product && product.name) || '',
          content_id:   id || '',
          content_type: 'product',
          currency:     'MAD',
          value:        ((product && product.price) || 0) * Math.max(1, parseInt(qty) || 1),
          quantity:     Math.max(1, parseInt(qty) || 1)
        });
      };
    } else if ((tries || 0) < 20) {
      setTimeout(function () { patchAddToCart((tries || 0) + 1); }, 300);
    }
  }
  patchAddToCart();

  // Also listen for cartUpdated events (for quantity changes, etc.)
  document.addEventListener('cartUpdated', function() {
    // This could be used for cart updates, but AddToCart is specifically for additions
  });

  // ── InitiateCheckout — fire once when the order submit button is clicked ─────
  if (isCart) {
    document.addEventListener('click', function onCheckout(e) {
      if (e.target.closest('.btn-submit, [data-submit-order], button[type="submit"]')) {
        document.removeEventListener('click', onCheckout);
        window.ttq.track('InitiateCheckout', {
          currency:  'MAD',
          value:     typeof window.getCartTotal === 'function' ? window.getCartTotal() : 0,
          num_items: typeof window.getCart === 'function'
            ? window.getCart().reduce(function (s, i) { return s + (i.quantity || 1); }, 0)
            : 1
        });
      }
    });
  }

  // ── Purchase — read order from sessionStorage on confirmation page ───────────
  if (isConfirmation) {
    try {
      const ord = JSON.parse(sessionStorage.getItem('nova_confirmation_order') || 'null');
      if (ord && ord.total) {
        window.ttq.track('Purchase', {
          currency:     'MAD',
          value:        ord.total,
          content_id:   ord.id || '',
          content_type: 'product',
          num_items:    (ord.items || []).length
        });
      }
    } catch (e) {}
  }
}
