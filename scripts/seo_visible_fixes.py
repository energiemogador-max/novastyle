"""
Fix visible elements that still contain the old product name:
1. Breadcrumb <span> (visible nav)
2. <img alt="..."> in product gallery and thumbs
3. FAQ Q1 with spammy product name embedded
4. Add width/height to product gallery images (CLS prevention)
"""
import os, re, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def get_clean_name(content):
    m = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    if not m:
        return None
    t = m.group(1)
    return re.sub(r'\s*\|\s*Nova Style\s*$', '', t).strip()

def get_h1(content):
    m = re.search(r'<h1>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else None

patterns = [
    'nova-style-*/index.html',
    'produits/*/index.html',
    'table-*/index.html',
    'miroir-rectangulaire-*/index.html',
]

product_files = list(set([f for p in patterns for f in glob.glob(p)]))

stats = {'breadcrumb': 0, 'gallery_alt': 0, 'thumb_alt': 0, 'img_dim': 0, 'faq_q1': 0}

for fpath in product_files:
    with open(fpath, 'r', encoding='utf-8-sig', errors='replace') as f:
        content = f.read()
    orig = content

    h1 = get_h1(content)
    clean = get_clean_name(content)
    if not h1 or not clean:
        continue

    # 1. Fix visible breadcrumb span (last segment)
    # <span>Nova Style : Miroir X - long...</span>
    new_content = re.sub(
        r'(<nav class="breadcrumb">[^<]*<a[^>]*>[^<]*</a>[^<]*<a[^>]*>[^<]*</a>[^<]*)<span>([^<]+)</span>',
        lambda m: m.group(1) + f'<span>{h1}</span>',
        content
    )
    if new_content != content:
        stats['breadcrumb'] += 1
        content = new_content

    # 2. Fix gallery main image alt
    new_content = re.sub(
        r'<img id="main-img" src="([^"]+)" alt="[^"]*">',
        lambda m: f'<img id="main-img" src="{m.group(1)}" alt="{h1}" width="800" height="800">',
        content
    )
    if new_content != content:
        stats['gallery_alt'] += 1
        stats['img_dim'] += 1
        content = new_content

    # 3. Fix thumbnail alts (numbered for variety)
    thumb_count = [0]
    def fix_thumb(m):
        thumb_count[0] += 1
        src = m.group(1)
        n = thumb_count[0]
        # Vary alt texts
        suffixes = ['', ' — Vue détail', ' — Vue de profil', ' — Vue alternative']
        alt = h1 + (suffixes[n] if n < len(suffixes) else f' — Vue {n}')
        return f'<img src="{src}" alt="{alt}" width="200" height="200" loading="lazy" onclick="document.getElementById(\'main-img\').src=this.src">'

    new_content = re.sub(
        r'<img src="([^"]+\.webp)" alt="[^"]*" onclick="document\.getElementById\(\'main-img\'\)\.src=this\.src">',
        fix_thumb,
        content
    )
    if new_content != content:
        stats['thumb_alt'] += 1
        content = new_content

    # 4. Clean FAQ Q1 product name spam
    # Pattern: "Le Nova Style : Miroir X - long is..." → "Le {h1} est..."
    spammy_re = re.compile(r'Le Nova Style\s*:\s*[^?<]+(?=\s+est-il)', re.IGNORECASE)
    if spammy_re.search(content):
        content = spammy_re.sub(f'Le {h1}', content)
        stats['faq_q1'] += 1

    if content != orig:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)

print('=== STATS ===')
for k, v in stats.items():
    print(f'  {k}: {v}')
print(f'  total: {len(product_files)} product files')
