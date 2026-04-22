import { firebaseConfig } from './firebase-config.js.js';

const DB_URL = firebaseConfig.databaseURL;

class NSReviewsWidget extends HTMLElement {
  constructor() {
    super();
    this.productId =
      this.dataset.productId ||
      window.location.pathname.split('/').filter(Boolean).pop() ||
      'default';
    this.safeProductId = this.productId.replace(/[\.#\$\[\]]/g, '_');
    this.reviews   = [];
    this.dbUrl     = `${DB_URL}/reviews/${this.safeProductId}.json`;
    this.submitUrl = `${DB_URL}/reviews/${this.safeProductId}.json`;
    this.page      = 0;
    this.pageSize  = 5;
  }

  async connectedCallback() {
    this.renderSkeleton();
    await this.fetchReviews();
    this.render();
  }

  async fetchReviews() {
    try {
      const res  = await fetch(this.dbUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && typeof data === 'object') {
        this.reviews = Object.entries(data)
          .map(([id, r]) => {
            if (!r || typeof r !== 'object') return null;
            return {
              id,
              name    : r.name    || 'Client Anonyme',
              rating  : Number(r.rating) || 5,
              text    : r.text    || '',
              date    : r.date    || new Date().toISOString(),
              approved: r.approved !== false
            };
          })
          .filter(r => r !== null && r.approved);
        this.reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    } catch (err) {
      console.warn('[NSReviews] fetch error:', err.message);
    }
  }

  async submitReview(payload) {
    const res = await fetch(this.submitUrl, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload)
    });
    if (!res.ok) {
      const errCode = (res.status === 401 || res.status === 403) ? 'permission_denied' : 'http_error';
      throw Object.assign(new Error(errCode), { code: errCode, status: res.status });
    }
    return res.json();
  }

  renderSkeleton() {
    this.innerHTML = `
      <div style="max-width:1200px;margin:40px auto;padding:20px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;color:#aaa;font-size:14px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:nsspin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          Chargement des avis…
        </div>
        <style>@keyframes nsspin{to{transform:rotate(360deg)}}</style>
      </div>`;
  }

  getAverageRating() {
    if (!this.reviews.length) return 0;
    return (this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length).toFixed(1);
  }

  renderStars(rating, size = 18) {
    return Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < rating ? '#ffb400' : '#ddd'};font-size:${size}px;line-height:1;">★</span>`
    ).join('');
  }

  ratingBars() {
    return [5, 4, 3, 2, 1].map(n => {
      const cnt = this.reviews.filter(r => r.rating === n).length;
      const pct = this.reviews.length ? Math.round(cnt / this.reviews.length * 100) : 0;
      return `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          <span style="font-size:12px;color:#888;width:8px;">${n}</span>
          <span style="font-size:11px;color:#ffb400;">★</span>
          <div style="flex:1;background:#f0f0f0;border-radius:4px;height:7px;overflow:hidden;">
            <div style="width:${pct}%;background:#ffb400;height:100%;border-radius:4px;"></div>
          </div>
          <span style="font-size:12px;color:#aaa;width:26px;">${pct}%</span>
        </div>`;
    }).join('');
  }

  fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('fr-MA', { year:'numeric', month:'long', day:'numeric' }); }
    catch { return ''; }
  }

  _esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  render() {
    const avg   = this.getAverageRating();
    const count = this.reviews.length;
    const pages = Math.ceil(count / this.pageSize);
    const start = this.page * this.pageSize;
    const paged = this.reviews.slice(start, start + this.pageSize);

    this.innerHTML = `
    <div class="ns-reviews-container" style="max-width:1200px;margin:40px auto;padding:24px;background:#fff;border-radius:12px;box-shadow:0 2px 20px rgba(0,0,0,.06);">

      <!-- HEADER -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;border-bottom:1px solid #f2f2f2;padding-bottom:24px;margin-bottom:24px;">
        <div>
          <h2 style="font-size:21px;font-weight:800;color:#cc2366;margin:0 0 14px;">Avis Clients</h2>
          <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
            <div>
              <div style="font-size:46px;font-weight:900;line-height:1;color:#222;">${avg}</div>
              <div style="margin-top:5px;">${this.renderStars(Math.round(Number(avg)), 18)}</div>
              <div style="font-size:12px;color:#999;margin-top:4px;">Basé sur <strong style="color:#555;">${count}</strong> avis</div>
            </div>
            <div style="min-width:180px;">${this.ratingBars()}</div>
          </div>
        </div>
        <button id="ns-toggle-form" style="background:#cc2366;color:#fff;border:none;padding:10px 20px;border-radius:7px;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;white-space:nowrap;">
          ✏️ Écrire un avis
        </button>
      </div>

      <!-- FORM -->
      <div id="ns-form-wrap" style="display:none;background:#fafafa;padding:22px;border-radius:10px;border:1px solid #eee;margin-bottom:24px;">
        <h3 style="margin:0 0 18px;font-size:16px;color:#222;">Laissez votre avis</h3>

        <div style="margin-bottom:14px;">
          <label style="display:block;margin-bottom:7px;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:.4px;">Note :</label>
          <div id="ns-star-picker" style="display:flex;gap:4px;cursor:pointer;">
            ${[1,2,3,4,5].map(n=>`<span data-v="${n}" style="font-size:30px;color:#ddd;transition:color .1s;user-select:none;">★</span>`).join('')}
          </div>
          <input type="hidden" id="ns-rating" value="5">
        </div>

        <div style="margin-bottom:12px;">
          <label style="display:block;margin-bottom:6px;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:.4px;">Votre nom :</label>
          <input id="ns-name" type="text" placeholder="Ex : Karim B." maxlength="60"
            style="width:100%;padding:10px 13px;border:1px solid #ddd;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box;"
            onfocus="this.style.borderColor='#cc2366'" onblur="this.style.borderColor='#ddd'">
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block;margin-bottom:6px;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:.4px;">Commentaire :</label>
          <textarea id="ns-text" rows="4" maxlength="1000" placeholder="Qu'avez-vous pensé de ce produit ?"
            style="width:100%;padding:10px 13px;border:1px solid #ddd;border-radius:6px;font-size:14px;outline:none;resize:vertical;box-sizing:border-box;"
            onfocus="this.style.borderColor='#cc2366'" onblur="this.style.borderColor='#ddd'"></textarea>
        </div>

        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <button id="ns-submit-btn" style="background:#222;color:#fff;border:none;padding:10px 22px;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer;transition:opacity .2s;">
            Envoyer l'avis
          </button>
          <span id="ns-form-msg" style="display:none;font-size:13px;"></span>
        </div>
      </div>

      <!-- REVIEWS -->
      <div style="display:grid;gap:14px;">
        ${count === 0
          ? `<p style="text-align:center;color:#aaa;padding:30px 0;font-size:14px;">Soyez le premier à donner votre avis sur ce produit !</p>`
          : paged.map(r => `
            <div style="padding:16px 18px;border:1px solid #f0f0f0;border-radius:10px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
                <div>
                  <strong style="font-size:14px;color:#222;">${this._esc(r.name)}</strong>
                  <div style="font-size:11px;color:#4CAF50;margin-top:3px;">✔ Acheteur vérifié</div>
                </div>
                <div style="text-align:right;">
                  <div>${this.renderStars(r.rating, 15)}</div>
                  <div style="font-size:11px;color:#bbb;margin-top:3px;">${this.fmtDate(r.date)}</div>
                </div>
              </div>
              <p style="margin:0;color:#444;line-height:1.65;font-size:14px;">"${this._esc(r.text)}"</p>
            </div>`).join('')
        }
      </div>

      <!-- PAGINATION -->
      ${pages > 1 ? `
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:22px;padding-top:16px;border-top:1px solid #f2f2f2;">
          <button id="ns-prev" ${this.page===0?'disabled':''} style="padding:7px 16px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;${this.page===0?'opacity:.35;cursor:default;':''}">← Précédent</button>
          <span style="font-size:13px;color:#999;">${this.page+1} / ${pages}</span>
          <button id="ns-next" ${this.page>=pages-1?'disabled':''} style="padding:7px 16px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;${this.page>=pages-1?'opacity:.35;cursor:default;':''}">Suivant →</button>
        </div>` : ''}

    </div>`;

    this._bind();
  }

  _bind() {
    // Toggle form
    this.querySelector('#ns-toggle-form')?.addEventListener('click', () => {
      const wrap = this.querySelector('#ns-form-wrap');
      const btn  = this.querySelector('#ns-toggle-form');
      if (!wrap) return;
      const isOpen = wrap.style.display !== 'none';
      wrap.style.display = isOpen ? 'none' : 'block';
      btn.textContent    = isOpen ? '✏️ Écrire un avis' : '✕ Fermer le formulaire';
    });

    // Star picker
    const picker   = this.querySelector('#ns-star-picker');
    const ratingEl = this.querySelector('#ns-rating');
    let   current  = 5;
    if (picker) {
      const stars = [...picker.querySelectorAll('span')];
      const paint = v => stars.forEach((s, i) => s.style.color = i < v ? '#ffb400' : '#ddd');
      paint(current);
      picker.addEventListener('mouseover',  e => e.target.dataset.v && paint(+e.target.dataset.v));
      picker.addEventListener('mouseleave', () => paint(current));
      picker.addEventListener('click',      e => {
        if (e.target.dataset.v) { current = +e.target.dataset.v; ratingEl.value = current; paint(current); }
      });
    }

    // Submit
    const btn  = this.querySelector('#ns-submit-btn');
    const msg  = this.querySelector('#ns-form-msg');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const nameEl = this.querySelector('#ns-name');
      const textEl = this.querySelector('#ns-text');
      const name   = nameEl?.value.trim();
      const text   = textEl?.value.trim();

      if (!name) { nameEl.style.borderColor='#cc2366'; nameEl.focus(); return; }
      if (!text) { textEl.style.borderColor='#cc2366'; textEl.focus(); return; }

      btn.disabled = true;
      btn.textContent = '⏳ Envoi en cours…';
      this._msg(msg, '', '');

      try {
        await this.submitReview({
          name,
          rating  : parseInt(ratingEl?.value || '5'),
          text,
          date    : new Date().toISOString(),
          approved: true
        });
        this._msg(msg, '✅ Merci ! Votre avis a bien été envoyé.', '#2e7d32');
        if (nameEl) nameEl.value = '';
        if (textEl) textEl.value = '';
        await this.fetchReviews();
        setTimeout(() => this.render(), 1800);

      } catch (err) {
        console.error('[NSReviews]', err);
        if (err.code === 'permission_denied') {
          this._msg(msg, '⚠️ Service temporairement indisponible. Réessayez dans un instant.', '#cc2366');
        } else {
          this._msg(msg, '❌ Erreur de connexion. Veuillez réessayer.', '#cc2366');
        }
        btn.disabled    = false;
        btn.textContent = 'Envoyer l\'avis';
      }
    });

    // Pagination
    const scrollToTop = () => window.scrollTo({ top: this.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' });
    this.querySelector('#ns-prev')?.addEventListener('click', () => { this.page--; this.render(); scrollToTop(); });
    this.querySelector('#ns-next')?.addEventListener('click', () => { this.page++; this.render(); scrollToTop(); });
  }

  _msg(el, text, color) {
    if (!el) return;
    el.textContent   = text;
    el.style.color   = color;
    el.style.display = text ? 'inline' : 'none';
  }
}

customElements.define('ns-reviews-widget', NSReviewsWidget);
