import { firebaseConfig } from './firebase-config.js.js';

class NSHomeReviewsWidget extends HTMLElement {
  constructor() {
    super();
    this.dbUrl = `${firebaseConfig.databaseURL}/reviews.json`;
    this.allReviews = [];
  }

  async connectedCallback() {
    this.renderSkeleton();
    await this.fetchAndSelectReviews();
    this.render();
  }

  async fetchAndSelectReviews() {
    try {
      const response = await fetch(this.dbUrl);
      const data = await response.json();
      if (data) {
        let flatReviews = [];
        // Flatten the structure: { productId: { reviewId: { ... } } }
        for (const [productId, reviews] of Object.entries(data)) {
          for (const [reviewId, review] of Object.entries(reviews)) {
            if (review.rating === 5 && review.approved !== false) {
              flatReviews.push({ productId, reviewId, ...review });
            }
          }
        }
        
        // Shuffle and select top 6
        this.allReviews = flatReviews.sort(() => 0.5 - Math.random()).slice(0, 6);
      }
    } catch (error) {
      console.error("Error fetching global reviews:", error);
    }
  }

  renderSkeleton() {
    this.innerHTML = `
      <div style="padding: 60px 20px; background: #fafafa; text-align: center;">
        <h2 style="font-size: 32px; color: #222; margin-bottom: 40px;">Ce que nos clients disent</h2>
        <p>Chargement des avis...</p>
      </div>
    `;
  }

  renderStars() {
    return `<span style="color: #ffb400; font-size: 18px;">★★★★★</span>`;
  }

  render() {
    if (this.allReviews.length === 0) return;

    let html = `
      <section style="padding: 60px 20px; background: #fafafa;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2 style="font-size: 32px; color: #222; text-align: center; margin-bottom: 10px;">Ce que nos clients disent</h2>
          <p style="text-align: center; color: #666; margin-bottom: 40px;">Plus de 500 clients satisfaits partout au Maroc</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
    `;

    this.allReviews.forEach(review => {
      const dateStr = new Date(review.date).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long', day: 'numeric' });
      html += `
        <div style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>${this.renderStars()}</div>
            <span style="font-size: 12px; color: #999;">${dateStr}</span>
          </div>
          <p style="font-size: 16px; color: #444; line-height: 1.6; font-style: italic; flex-grow: 1;">"${review.text}"</p>
          <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; background: #cc2366; color: #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 18px;">
              ${review.name.charAt(0)}
            </div>
            <div>
              <strong style="display: block; color: #222;">${review.name}</strong>
              <span style="font-size: 12px; color: #4CAF50;">✔ Acheteur vérifié</span>
            </div>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </section>
    `;

    this.innerHTML = html;
  }
}

customElements.define('ns-home-reviews-widget', NSHomeReviewsWidget);
