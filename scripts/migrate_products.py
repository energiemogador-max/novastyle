#!/usr/bin/env python3
"""
migrate_products.py
Extracts PRODUCT objects from all product index.html files,
normalizes them to canonical schema, and writes:
  - firebase_catalog_import.json   (new entries only — skip existing Firebase slugs)
  - products_full.json             (replacement for products.json)
  - migration_report.txt

Usage: python3 scripts/migrate_products.py [--dry-run]
Run from the repo root.
"""
import os, re, json, sys

DRY_RUN = '--dry-run' in sys.argv
ROOT = '.'

CATEGORY_MAP = {
    'nova-style-miroir-': 'Miroirs SDB Premium',
    'miroir-rectangulaire-bright': 'Miroirs SDB Premium',
    'miroir-rectangulaire-bright-ii': 'Miroirs SDB Premium',
    'douche-italienne': 'Douches',
    'table-basse': 'Tables',
    'table-de-sejour': 'Tables',
    'nova-style-ensemble-console': 'Consoles',
    'nova-style-deux-miroirs': 'Miroirs SDB Premium',
    'nova-style-ensemble-meuble': 'Miroirs SDB Premium',
    'consol-et-miroir': 'Consoles',
    'deco-miroir': 'Miroirs SDB Premium',
}

def infer_category(slug):
    for prefix, cat in CATEGORY_MAP.items():
        if slug.startswith(prefix):
            return cat
    return 'Miroirs SDB Premium'

def extract_product_from_html(html):
    m = re.search(r'const\s+PRODUCT\s*=\s*(\{)', html)
    if not m:
        return None
    start = m.start(1)
    depth = 0
    i = start
    while i < len(html):
        if html[i] == '{': depth += 1
        elif html[i] == '}':
            depth -= 1
            if depth == 0:
                obj_str = html[start:i+1]
                break
        i += 1
    else:
        return None
    obj_str = re.sub(r',\s*([}\]])', r'\1', obj_str)
    try:
        return json.loads(obj_str)
    except json.JSONDecodeError:
        return None

def infer_slug_from_path(page_path):
    parts = page_path.replace('\\', '/').split('/')
    if 'index.html' in parts:
        idx = parts.index('index.html')
        return parts[idx - 1]
    return None

def normalize(product, slug, html):
    imgs = re.findall(r'src="(/assets/images/' + re.escape(slug) + r'/\d+\.webp)"', html)
    images = sorted(list(set(imgs))) or [f'/assets/images/{slug}/1.webp']
    desc_m = re.search(r'class="p-desc">\s*<p>(.*?)</p>', html, re.DOTALL)
    description = re.sub(r'<[^>]+>', '', desc_m.group(1)).strip() if desc_m else ''
    seo_title_m = re.search(r'<title>(.*?)</title>', html)
    seo_desc_m  = re.search(r'<meta name="description"\s+content="([^"]*)"', html)
    seo = {
        'title': seo_title_m.group(1).strip() if seo_title_m else product.get('title', ''),
        'description': seo_desc_m.group(1).strip() if seo_desc_m else ''
    }
    variants = product.get('variants', [])
    prices = [v['price'] for v in variants if v.get('price', 0) > 0]
    return {
        'title':       product.get('title', slug),
        'slug':        slug,
        'category':    infer_category(slug),
        'active':      True,
        'images':      images,
        'price_min':   min(prices) if prices else product.get('price_min', 0),
        'price_max':   max(prices) if prices else product.get('price_max', 0),
        'axis_order':  product.get('axis_order', []),
        'axes':        product.get('axes', {}),
        'variants':    variants,
        'description': description,
        'seo':         seo,
    }

def main():
    extracted = {}
    skipped = []

    for dirpath, dirnames, filenames in os.walk(ROOT):
        # Only process produits/ and root slug dirs
        if 'assets' in dirpath or 'categorie' in dirpath or 'scripts' in dirpath:
            continue
        for fname in filenames:
            if fname != 'index.html':
                continue
            fpath = os.path.join(dirpath, fname)
            with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
                html = f.read()
            if 'const PRODUCT' not in html:
                continue
            slug = infer_slug_from_path(fpath)
            if not slug or slug in ('novastyle-main', '.'):
                skipped.append(fpath + ' (no slug)')
                continue
            product = extract_product_from_html(html)
            if not product:
                skipped.append(fpath + ' (parse error)')
                continue
            if slug not in extracted:  # produits/ wins over root duplicate
                extracted[slug] = normalize(product, slug, html)

    print(f'Extracted: {len(extracted)}, Skipped: {len(skipped)}')

    if not DRY_RUN:
        with open('firebase_catalog_import.json', 'w', encoding='utf-8') as f:
            json.dump(extracted, f, ensure_ascii=False, indent=2)

        products_list = []
        for slug, p in extracted.items():
            prices = [v['price'] for v in p['variants'] if v.get('price', 0) > 0]
            pmin = min(prices) if prices else p['price_min']
            pmax = max(prices) if prices else p['price_max']
            products_list.append({
                'id': slug,
                'slug': slug,
                'name': p['title'],
                'category': p['category'],
                'image': p['images'][0] if p['images'] else f'/assets/images/{slug}/1.webp',
                'price': {'min': pmin, 'max': pmax},
                'active': True,
            })
        with open('products_full.json', 'w', encoding='utf-8') as f:
            json.dump({'products': products_list}, f, ensure_ascii=False, indent=2)

        with open('migration_report.txt', 'w', encoding='utf-8') as f:
            f.write(f'Extracted: {len(extracted)}\n')
            f.write(f'Skipped ({len(skipped)}):\n')
            for s in skipped:
                f.write(f'  {s}\n')

        print('Outputs: firebase_catalog_import.json, products_full.json, migration_report.txt')
    else:
        print('[DRY-RUN] No files written.')
        if skipped:
            print('Skipped:')
            for s in skipped[:10]: print(' ', s)

main()
