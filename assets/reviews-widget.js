import { firebaseConfig } from './firebase-config.js.js';

class NSReviewsWidget extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productId || window.location.pathname.split("/").filter(p => p).pop() || "default";
    this.safeProductId = this.productId.replace(/[\.#\$\[\]]/g, "_");
    this.reviews = [];
    this.dbUrl = `${firebaseConfig.databaseURL}/reviews/${this.safeProductId}.json`;
    this.submitUrl = `${firebaseConfig.databaseURL}/reviews/${this.safeProductId}.json`;
  }

  async connectedCallback() {
    this.renderSkeleton();
    await this.fetchReviews();
    this.render();
  }

  async fetchReviews() {
    try {
      const response = await fetch(this.dbUrl);
      const data = await response.json();
      if (data) {
        // Convert object to array and sort by date descending
        this.reviews = Object.keys(data).map(key => ({ id: key, ...data[key] }))
          .filter(r => r.approved !== false)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  renderSkeleton() {
    this.innerHTML = `
      <div class="ns-reviews-container">
        <h2 style="font-size: 24px; color: #cc2366; margin-bottom: 20px;">Avis Clients</h2>
        <p>Chargement des avis...</p>
      </div>
    `;
  }

  getAverageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<span style="color: ${i <= rating ? '#ffb400' : '#ddd'}; font-size: 18px;">★</span>`;
    }
    return stars;
  }

  render() {
    const avgRating = this.getAverageRating();
    const count = this.reviews.length;
    
    let html = `
      <div class="ns-reviews-container" style="max-width: 1200px; margin: 40px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 24px; color: #cc2366; margin: 0;">Avis Clients</h2>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
              <div style="font-size: 32px; font-weight: bold;">${avgRating}</div>
              <div>
                <div>${this.renderStars(Math.round(avgRating))}</div>
                <div style="font-size: 14px; color: #888;">Basé sur ${count} avis</div>
              </div>
            </div>
          </div>
          <button id="ns-write-review-btn" style="background: #cc2366; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">Écrire un avis</button>
        </div>
        
        <form id="ns-review-form" style="display: none; background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Laissez votre avis</h3>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Votre note :</label>
            <select id="ns-rating" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
              <option value="5">5 Étoiles - Excellent</option>
              <option value="4">4 Étoiles - Très bien</option>
              <option value="3">3 Étoiles - Moyen</option>
              <option value="2">2 Étoiles - Décevant</option>
              <option value="1">1 Étoile - Mauvais</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Votre nom :</label>
            <input type="text" id="ns-name" placeholder="Ex: Karim B." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Votre commentaire :</label>
            <textarea id="ns-text" rows="4" placeholder="Qu'avez-vous pensé de ce miroir ?" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required></textarea>
          </div>
          <button type="submit" style="background: #222; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">Envoyer</button>
          <div id="ns-form-msg" style="margin-top: 10px; color: green; display: none;">Merci pour votre avis !</div>
        </form>

        <div class="ns-reviews-list" style="display: grid; gap: 20px;">
    `;

    if (count === 0) {
      html += `<p style="color: #666; text-align: center; padding: 20px 0;">Soyez le premier à donner votre avis sur ce produit !</p>`;
    } else {
      this.reviews.forEach(review => {
        const dateStr = new Date(review.date).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long', day: 'numeric' });
        html += `
          <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
              <div>
                <strong style="font-size: 16px;">${review.name}</strong>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">✔ Acheteur vérifié</div>
              </div>
              <div style="text-align: right;">
                <div>${this.renderStars(review.rating)}</div>
                <div style="font-size: 12px; color: #888;">${dateStr}</div>
              </div>
            </div>
            <p style="margin: 0; color: #444; line-height: 1.5; font-size: 15px;">"${review.text}"</p>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    this.innerHTML = html;

    // Attach Event Listeners
    const btn = this.querySelector('#ns-write-review-btn');
    const form = this.querySelector('#ns-review-form');
    
    if (btn && form) {
      btn.addEventListener('click', () => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";

        const newReview = {
          name: this.querySelector('#ns-name').value,
          rating: parseInt(this.querySelector('#ns-rating').value),
          text: this.querySelector('#ns-text').value,
          date: new Date().toISOString(),
          approved: true
        };

        try {
          // Firebase REST API requires POST to generate a unique key
          const response = await fetch(this.submitUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReview)
          });
          
          if (!response.ok) {
            throw new Error(`Firebase error: ${response.status}`);
          }

          this.querySelector('#ns-form-msg').style.display = 'block';
          form.reset();
          
          // Instantly add to local list and re-render
          this.reviews.unshift(newReview);
          setTimeout(() => {
            this.render();
          }, 1500);

        } catch (err) {
          console.error("Error submitting review:", err);
          alert("Erreur lors de l'envoi de l'avis. Vérifiez les permissions de votre base de données Firebase.");
          submitBtn.disabled = false;
          submitBtn.textContent = "Envoyer";
        }
      });
    }
  }
}

customElements.define('ns-reviews-widget', NSReviewsWidget);
