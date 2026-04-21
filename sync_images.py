import os, re, json

produits_dir = 'produits'
images_base_dir = 'images'

def sync_product(p_id):
    p_path = os.path.join(produits_dir, p_id)
    html_path = os.path.join(p_path, 'index.html')
    if not os.path.exists(html_path): return None
    
    img_dir = os.path.join(images_base_dir, p_id)
    webp_files = []
    if os.path.exists(img_dir):
        # Sort files numerically
        def sort_key(filename):
            match = re.search(r'(\d+)', filename)
            return int(match.group(1)) if match else 0
        
        webp_files = sorted([f for f in os.listdir(img_dir) if f.endswith('.webp')], key=sort_key)
    
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {html_path}: {e}")
        return None
    
    # Sync Meta Tags
    if webp_files:
        content = re.sub(r'<meta property="og:image" content="[^"]+">', f'<meta property="og:image" content="/images/{p_id}/1.webp">', content)
        content = re.sub(r'<meta name="twitter:image" content="[^"]+">', f'<meta name="twitter:image" content="/images/{p_id}/1.webp">', content)
    
    # Sync JSON-LD
    img_urls = [f'/images/{p_id}/{f}' for f in webp_files]
    # Handle multiple JSON-LD blocks
    content = re.sub(r'"image":\s*\[[^\]]*\]', f'"image": {json.dumps(img_urls)}', content)
    
    # Sync Gallery
    if len(webp_files) <= 1:
        # The special rule: remove the image from page if only one webp
        # We replace the gallery div with a comment or keep it empty
        content = re.sub(r'<div class="product-gallery">.*?</div>', '<div class="product-gallery">\n  <!-- Product gallery removed: only one image available -->\n</div>', content, flags=re.DOTALL)
    else:
        # Update main-img
        content = re.sub(r'<img id="main-img" src="[^"]+"', f'<img id="main-img" src="/images/{p_id}/1.webp"', content)
        
        # Preserve alt text if possible
        alt_match = re.search(r'<img id="main-img"[^>]+alt="([^"]+)"', content)
        alt_text = alt_match.group(1) if alt_match else ''
        
        # Update thumbs
        thumbs_html = ''.join([f'<img src="/images/{p_id}/{f}" alt="{alt_text}" onclick="document.getElementById(\'main-img\').src=this.src">' for f in webp_files])
        content = re.sub(r'<div class="thumbs">.*?</div>', f'<div class="thumbs">{thumbs_html}</div>', content, flags=re.DOTALL)

    try:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"Error writing {html_path}: {e}")
        return None
        
    return len(webp_files)

results = {}
for p_id in os.listdir(produits_dir):
    if os.path.isdir(os.path.join(produits_dir, p_id)):
        count = sync_product(p_id)
        if count is not None:
            results[p_id] = count

print(f"Processed {len(results)} products.")
print(f"Products with images removed (count <= 1): {len([k for k, v in results.items() if v <= 1])}")
