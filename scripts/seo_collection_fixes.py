"""
Collection page (/categorie/*) SEO fixes:
1. Replace empty/JS-loaded CollectionPage schema with one containing
   `mainEntity: ItemList` of static products
2. Inject static <noscript>-friendly product cards as fallback so Googlebot
   sees products even without JS execution
3. Add absolute og:image URLs
"""
import os, re, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

BASE = 'https://novastyle.ma'

# Load products
with open('products-index.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Group by category
by_cat = {}
for p in data['products']:
    if not p.get('active', True):
        continue
    by_cat.setdefault(p['categoryId'], []).append(p)

def clean_name(name):
    """Strip 'Nova Style :' / 'NOVA STYLE :' prefixes."""
    n = re.sub(r'^Nova Style\s*[:\-–]\s*', '', name, flags=re.IGNORECASE)
    n = re.sub(r'^NOVA STYLE\s*[:\-–]\s*', '', n)
    return n.strip()

def clean_slug_url(slug):
    """Build correct product URL — root-level if folder exists, else /produits/."""
    if os.path.exists(f'{slug}/index.html'):
        return f'{BASE}/{slug}/'
    return f'{BASE}/produits/{slug}/'

# Process each category page
cat_pages = glob.glob('categorie/*/index.html')
stats = {'updated': 0, 'with_itemlist': 0}

for fpath in cat_pages:
    cat_id = fpath.replace('\\', '/').split('/')[-2]
    products = by_cat.get(cat_id, [])
    if not products:
        print(f'No products for {cat_id}, skipping')
        continue

    with open(fpath, 'r', encoding='utf-8-sig', errors='replace') as f:
        content = f.read()
    orig = content

    # Build ItemList of top 10 products
    items = []
    for i, p in enumerate(products[:10], 1):
        items.append({
            "@type": "ListItem",
            "position": i,
            "item": {
                "@type": "Product",
                "name": clean_name(p['name']),
                "image": BASE + p['image'],
                "url": clean_slug_url(p['slug']),
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "MAD",
                    "price": str(p['price']['min']),
                    "availability": "https://schema.org/InStock"
                }
            }
        })

    # Find existing CollectionPage JSON-LD and rewrite
    cp_re = re.compile(
        r'<script type="application/ld\+json">(\{[^<]*?"@type":\s*"CollectionPage"[^<]*?\})</script>',
        re.DOTALL
    )

    cp_match = cp_re.search(content)
    if cp_match:
        try:
            old = json.loads(cp_match.group(1))
        except Exception:
            old = {}
        new_cp = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": old.get('name', ''),
            "description": old.get('description', ''),
            "url": old.get('url', f'{BASE}/categorie/{cat_id}/'),
            "numberOfItems": len(products),
            "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": len(items),
                "itemListElement": items
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Accueil", "item": f"{BASE}/"},
                    {"@type": "ListItem", "position": 2, "name": old.get('name', cat_id)}
                ]
            }
        }
        new_cp_str = json.dumps(new_cp, ensure_ascii=False)
        content = cp_re.sub(
            f'<script type="application/ld+json">{new_cp_str}</script>',
            content,
            count=1
        )
        stats['with_itemlist'] += 1

    # Make og:image absolute
    content = re.sub(
        r'<meta property="og:image" content="(/images/[^"]+)">',
        lambda m: f'<meta property="og:image" content="{BASE}{m.group(1)}">',
        content
    )
    content = re.sub(
        r'<meta name="twitter:image" content="(/images/[^"]+)">',
        lambda m: f'<meta name="twitter:image" content="{BASE}{m.group(1)}">',
        content
    )

    # Inject SSR product cards as fallback (before the JS-loaded grid)
    # Build static cards
    static_cards_html = ''
    for p in products[:12]:
        url = clean_slug_url(p['slug']).replace(BASE, '')
        cn = clean_name(p['name'])
        img = p['image']
        price = p.get('price', {}).get('min')
        price_html = f'<div class="card-price">À partir de {price} MAD</div>' if price else ''
        static_cards_html += f'''
<a class="product-card" href="{url}">
  <div class="card-img"><img src="{img}" alt="{cn}" loading="lazy" width="400" height="400"></div>
  <div class="card-info">
    <div class="card-name">{cn}</div>
    {price_html}
  </div>
</a>'''

    # Replace the JS-loaded grid with static products + JS hydration
    static_block = f'''<div id="products-grid" data-category-id="{cat_id}">{static_cards_html}
</div>'''

    # Match the existing div with the loading message
    grid_re = re.compile(
        r'<div id="products-grid"[^>]*>\s*<p class="loading-products">[^<]*</p>\s*</div>',
        re.DOTALL
    )
    if grid_re.search(content):
        content = grid_re.sub(static_block, content, count=1)
        stats['updated'] += 1

    if content != orig:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {fpath}')

print('\n=== STATS ===')
for k, v in stats.items():
    print(f'  {k}: {v}')
