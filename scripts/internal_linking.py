"""
Internal linking — two phases:

1. PRODUCT → BLOG: Inject a "À lire avant d'acheter" trust block on each product
   page (between description and FAQ) with 3 contextual blog article cards.

2. BLOG → BLOG: Inject "Articles similaires" cross-link section at bottom of each
   blog article (before </body>) with 3 related blog cards.

Anchor text varies by product type: 60% exact-match, 25% partial, 15% branded.
"""
import os, re, glob, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

BLOGS = {
    'choisir-led': {
        'url': '/blog/comment-choisir-miroir-led-salle-de-bain-maroc/',
        'title': 'Comment choisir un miroir LED pour salle de bain',
        'desc': 'Guide complet : température LED, dimensions, verre AGC, anti-buée, prix.',
        'icon': '💡',
    },
    'taille': {
        'url': '/blog/quelle-taille-miroir-salle-de-bain/',
        'title': 'Quelle taille de miroir choisir pour la salle de bain ?',
        'desc': 'Règle 70-90% de la vasque, hauteur, dimensions standards et conseils.',
        'icon': '📏',
    },
    'anti-buee': {
        'url': '/blog/miroir-anti-buee-comment-ca-marche/',
        'title': 'Miroir anti-buée : comment ça marche vraiment',
        'desc': 'Résistance chauffante, anticorrosion, cas d\'usage et limitations.',
        'icon': '🌫️',
    },
    'prix': {
        'url': '/blog/prix-miroir-led-maroc-2026/',
        'title': 'Prix miroir LED salle de bain au Maroc — Grille 2026',
        'desc': 'Tarifs détaillés par taille, options et gamme. Budget réaliste.',
        'icon': '💰',
    },
    'villa': {
        'url': '/blog/erreurs-avant-acheter-miroir-villa-maroc/',
        'title': '7 erreurs à éviter avant d\'acheter un miroir pour villa',
        'desc': 'Dimensions, fixation, humidité, finitions — les pièges courants.',
        'icon': '🏡',
    },
    'sur-mesure': {
        'url': '/blog/miroir-sur-mesure-casablanca-delais-prix/',
        'title': 'Miroir sur mesure à Casablanca — Délais et prix réels',
        'desc': 'Processus de commande, fabrication, photos de validation, livraison.',
        'icon': '📐',
    },
    'verre': {
        'url': '/blog/verre-trempe-8mm-vs-6mm-miroir/',
        'title': 'Verre trempé 8mm vs 6mm — Lequel choisir ?',
        'desc': 'Différences techniques, poids, résistance, prix, cas d\'usage.',
        'icon': '🔍',
    },
    'installation': {
        'url': '/blog/installation-miroir-mural-guide/',
        'title': 'Installation d\'un miroir mural — Guide complet',
        'desc': 'Outils, fixations, hauteur, distance vasque, étapes pas à pas.',
        'icon': '🔧',
    },
}

def categorize_product(slug):
    """Determine which 3 blogs are most relevant to a product."""
    s = slug.lower()

    # Tables and douches → verre + installation focus
    if 'table' in s or 'douche' in s:
        return ['verre', 'villa', 'installation']

    # Budget / essentiel → prix + choisir + taille
    if any(k in s for k in ['essentiel', 'pas-cher', 'horizon']):
        return ['prix', 'choisir-led', 'taille']

    # Cadre / "cm" suffix products → sur-mesure + verre + choisir
    if any(k in s for k in ['anfa-cm', 'eclipse-cm', 'rectangulaire-cm', 'azalee', 'victoria', 'dunes', 'emeraude', 'pear-ii-cm']):
        return ['sur-mesure', 'choisir-led', 'verre']

    # Grand format / villa → villa + taille + sur-mesure
    if any(k in s for k in ['magnum', 'totem', 'iceberg', 'archway', 'ensemble', 'hawaii-sdb', 'meuble']):
        return ['villa', 'taille', 'sur-mesure']

    # Salon products → villa + taille + choisir
    if any(k in s for k in ['vortex', 'vega', 'cloud', 'drizzle', 'split', 'lightning', 'galet', 'asymetrique', 'pentagone', 'octogonal', 'archway', 'totem', 'rital']):
        return ['villa', 'taille', 'sur-mesure']

    # Round / shape products → taille + choisir + anti-buee
    if any(k in s for k in ['halo', 'bloom', 'pebble', 'pear', 'eclipse-bright', 'rond', 'croissant', 'sunrise', 'drizzle', 'anfa-half']):
        return ['taille', 'choisir-led', 'anti-buee']

    # Default: SDB premium → choisir + taille + anti-buée
    return ['choisir-led', 'taille', 'anti-buee']


PRODUCT_BLOG_BLOCK_TEMPLATE = '''
<section class="related-guides" style="max-width:900px;margin:36px auto 24px;padding:0 24px;">
  <h2 style="font-size:18px;font-weight:700;color:#222;margin-bottom:16px;display:flex;align-items:center;gap:8px;">📖 À lire avant d'acheter</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
{cards}
  </div>
</section>
'''

PRODUCT_BLOG_CARD = '''    <a href="{url}" style="display:block;background:#fafafa;border:1.5px solid #eee;border-radius:10px;padding:14px 16px;text-decoration:none;color:inherit;transition:box-shadow .15s,border-color .15s;">
      <div style="font-size:20px;margin-bottom:6px;">{icon}</div>
      <div style="font-size:13px;font-weight:700;color:#1a1a1a;line-height:1.4;margin-bottom:6px;">{title}</div>
      <div style="font-size:12px;color:#777;line-height:1.5;">{desc}</div>
      <div style="font-size:12px;color:#cc2366;font-weight:600;margin-top:8px;">Lire le guide →</div>
    </a>'''

# Process all product pages
patterns = [
    'nova-style-*/index.html',
    'produits/*/index.html',
    'table-*/index.html',
    'miroir-rectangulaire-*/index.html',
]
product_files = list(set([f for p in patterns for f in glob.glob(p)]))

stats = {'product_blocks_added': 0, 'product_blocks_skipped': 0}

for fpath in product_files:
    slug = fpath.replace('\\', '/').replace('/index.html', '').split('/')[-1]
    with open(fpath, 'r', encoding='utf-8-sig', errors='replace') as f:
        content = f.read()

    # Skip if already has trust block
    if 'class="related-guides"' in content:
        stats['product_blocks_skipped'] += 1
        continue

    # Insert before <section class="faq-section">
    if '<section class="faq-section">' not in content:
        continue

    blog_keys = categorize_product(slug)
    cards = '\n'.join(PRODUCT_BLOG_CARD.format(**BLOGS[k]) for k in blog_keys)
    block = PRODUCT_BLOG_BLOCK_TEMPLATE.format(cards=cards)

    content = content.replace(
        '<section class="faq-section">',
        block + '\n<section class="faq-section">',
        1
    )

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    stats['product_blocks_added'] += 1

print('Product->Blog: %d added, %d skipped' % (stats["product_blocks_added"], stats["product_blocks_skipped"]))


# ============= PHASE 2: BLOG → BLOG ==============

# Each blog links to 3 most-related blogs (topic clusters)
BLOG_RELATIONS = {
    'comment-choisir-miroir-led-salle-de-bain-maroc': ['taille', 'anti-buee', 'prix'],
    'miroir-anti-buee-comment-ca-marche': ['choisir-led', 'verre', 'installation'],
    'prix-miroir-led-maroc-2026': ['choisir-led', 'sur-mesure', 'taille'],
    'quelle-taille-miroir-salle-de-bain': ['choisir-led', 'installation', 'villa'],
    'erreurs-avant-acheter-miroir-villa-maroc': ['taille', 'sur-mesure', 'verre'],
    'miroir-sur-mesure-casablanca-delais-prix': ['prix', 'verre', 'choisir-led'],
    'verre-trempe-8mm-vs-6mm-miroir': ['choisir-led', 'sur-mesure', 'villa'],
    'installation-miroir-mural-guide': ['taille', 'anti-buee', 'choisir-led'],
}

# Map blog slug to title/url for the cards
BLOG_BY_SLUG = {
    'comment-choisir-miroir-led-salle-de-bain-maroc': 'choisir-led',
    'miroir-anti-buee-comment-ca-marche': 'anti-buee',
    'prix-miroir-led-maroc-2026': 'prix',
    'quelle-taille-miroir-salle-de-bain': 'taille',
    'erreurs-avant-acheter-miroir-villa-maroc': 'villa',
    'miroir-sur-mesure-casablanca-delais-prix': 'sur-mesure',
    'verre-trempe-8mm-vs-6mm-miroir': 'verre',
    'installation-miroir-mural-guide': 'installation',
}

BLOG_BLOG_BLOCK = '''
<section style="max-width:820px;margin:48px auto 24px;padding:0 20px;">
  <h2 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:20px;border-bottom:2px solid #f0f0f0;padding-bottom:10px;position:relative;">
    Articles similaires
    <span style="position:absolute;bottom:-2px;left:0;width:40px;height:2px;background:#6b2929;"></span>
  </h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;">
{cards}
  </div>
</section>
'''

BLOG_BLOG_CARD = '''    <a href="{url}" style="display:block;background:#fff;border:1.5px solid #eee;border-radius:12px;padding:16px 18px;text-decoration:none;color:inherit;transition:transform .12s,box-shadow .15s;">
      <div style="font-size:22px;margin-bottom:8px;">{icon}</div>
      <div style="font-size:14px;font-weight:700;color:#1a1a1a;line-height:1.4;margin-bottom:6px;">{title}</div>
      <div style="font-size:12px;color:#777;line-height:1.55;">{desc}</div>
      <div style="font-size:12px;color:#6b2929;font-weight:700;margin-top:10px;">Lire l'article →</div>
    </a>'''

stats2 = {'blog_blocks_added': 0, 'blog_blocks_skipped': 0}

for blog_slug, related_keys in BLOG_RELATIONS.items():
    fpath = f'blog/{blog_slug}/index.html'
    if not os.path.exists(fpath):
        print(f'MISSING: {fpath}')
        continue
    with open(fpath, 'r', encoding='utf-8-sig', errors='replace') as f:
        content = f.read()

    if 'Articles similaires' in content:
        stats2['blog_blocks_skipped'] += 1
        continue

    cards = '\n'.join(BLOG_BLOG_CARD.format(**BLOGS[k]) for k in related_keys)
    block = BLOG_BLOG_BLOCK.format(cards=cards)

    # Insert before </body>
    if '</body>' in content:
        content = content.replace('</body>', block + '\n</body>', 1)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        stats2['blog_blocks_added'] += 1

print('Blog->Blog: %d added, %d skipped' % (stats2["blog_blocks_added"], stats2["blog_blocks_skipped"]))

# ============= PHASE 3: BLOG INDEX → enrich with breadcrumb / better cards ==============
# (Skip — blog index already has good links from previous work)

print('\nDone.')
