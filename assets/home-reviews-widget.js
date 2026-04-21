import { firebaseConfig } from './firebase-config.js.js';

const DB_URL = firebaseConfig.databaseURL;

class NSHomeReviewsWidget extends HTMLElement {
  constructor() {
    super();
    this.dbUrl      = `${DB_URL}/reviews.json`;
    this.allReviews = [];
  }

  async connectedCallback() {
    this.renderSkeleton();
    await this.fetchAndSelectReviews();
    this.render();
  }

  async fetchAndSelectReviews() {
    try {
      const res  = await fetch(this.dbUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || typeof data !== 'object') return;

      const flat = [];
      for (const [productId, reviews] of Object.entries(data)) {
        if (!reviews || typeof reviews !== 'object') continue;
        for (const [reviewId, r] of Object.entries(reviews)) {
          if (!r || typeof r !== 'object') continue;
          const rating = Number(r.rating) || 0;
          if (rating >= 4 && r.approved !== false && r.text) {
            flat.push({
              productId, reviewId,
              name  : r.name   || 'Client',
              text  : r.text,
              date  : r.date   || new Date().toISOString(),
              rating
            });
          }
        }
      }

      // Prefer 5-star; shuffle within rating groups then take 6
      const fiveStars = flat.filter(r => r.rating === 5);
      const pool      = fiveStars.length >= 6 ? fiveStars : flat;
      this.allReviews = pool.sort(() => 0.5 - Math.random()).slice(0, 6);

    } catch (err) {
      console.warn('[NSHomeReviews] fetch error:', err.message);
    }
  }

  renderSkeleton() {
    this.innerHTML = `
      <section style="padding:60px 20px;background:#fafafa;text-align:center;">
        <h2 style="font-size:30px;color:#222;margin-bottom:10px;">Ce que nos clients disent</h2>
        <p style="color:#bbb;font-size:14px;">Chargement des avis…</p>
      </section>`;
  }

  _esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('fr-MA', { year:'numeric', month:'long', day:'numeric' }); }
    catch { return ''; }
  }

  render() {
    if (this.allReviews.length === 0) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `
      <section style="padding:60px 20px;background:#fafafa;">
        <div style="max-width:1200px;margin:0 auto;">
          <h2 style="font-size:30px;font-weight:800;color:#222;text-align:center;margin:0 0 8px;">Ce que nos clients disent</h2>
          <p style="text-align:center;color:#aaa;font-size:14px;margin:0 0 40px;">Plus de 500 clients satisfaits partout au Maroc</p>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
            ${this.allReviews.map(r => `
              <div style="background:#fff;padding:24px;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.06);display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s;"
                   onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 28px rgba(0,0,0,.1)'"
                   onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 18px rgba(0,0,0,.06)'">

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <span style="color:#ffb400;font-size:17px;">★★★★★</span>
                  <span style="font-size:11px;color:#ccc;">${this.fmtDate(r.date)}</span>
                </div>

                <p style="font-size:14px;color:#444;line-height:1.65;font-style:italic;flex-grow:1;margin:0 0 18px;">
                  "${this._esc(r.text.length > 200 ? r.text.slice(0, 200) + '…' : r.text)}"
                </p>

                <div style="border-top:1px solid #f0f0f0;padding-top:14px;display:flex;align-items:center;gap:10px;">
                  <div style="width:38px;height:38px;background:#cc2366;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0;">
                    ${this._esc(r.name.charAt(0).toUpperCase())}
                  </div>
                  <div>
                    <strong style="display:block;color:#222;font-size:14px;">${this._esc(r.name)}</strong>
                    <span style="font-size:11px;color:#4CAF50;">✔ Acheteur vérifié</span>
                  </div>
                </div>

              </div>`).join('')}
          </div>
        </div>
      </section>`;
  }
}

customElements.define('ns-home-reviews-widget', NSHomeReviewsWidget);
