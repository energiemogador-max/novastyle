// Fetches /ads_config.json and injects tracking pixels (GA4, Google Ads, Meta, TikTok).
// Included on every public page; safe to load when config is absent.
(async () => {
  try {
    const res = await fetch('/ads_config.json');
    if (!res.ok) return;
    const cfg = await res.json();
    if (!cfg) return;

    const ga4 = cfg.google_ga4 && cfg.google_ga4.trim();
    const gads = cfg.google_ads && cfg.google_ads.trim();
    const meta = cfg.meta_pixel && cfg.meta_pixel.trim();
    const tiktok = cfg.tiktok_pixel && cfg.tiktok_pixel.trim();

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
      const inline = document.createElement('script');
      inline.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`;
      document.head.appendChild(inline);
    }

    // TikTok Pixel
    if (tiktok) {
      const inline = document.createElement('script');
      inline.textContent = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktok}');ttq.page()}(window,document,'ttq');`;
      document.head.appendChild(inline);
    }
  } catch (e) {
    // Silently ignore — ads config file may not exist yet
  }
})();
