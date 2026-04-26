
// Nova Style — Nouveau Produit Creator v2
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// ─── GitHub config ────────────────────────────────────────────────────────────
const GH_OWNER  = "energiemogador-max";
const GH_REPO   = "novastyle";
const GH_BRANCH = "main";
const GH_TOKEN_KEY = "nova_github_token";

async function ghUpload(token, repoPath, base64, message) {
  let sha;
  try {
    const r = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${repoPath}`,
      { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json" } });
    if (r.ok) { const d = await r.json(); sha = d.sha; }
  } catch {}
  const body = { message, content: base64, branch: GH_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${repoPath}`, {
    method: "PUT",
    headers: { Authorization: `token ${token}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) { const t = await res.text().catch(() => ""); throw new Error(`GitHub ${res.status}: ${t.slice(0,200)}`); }
  return true;
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "sdb-premium",   label: "Miroirs SDB Premium" },
  { id: "sdb-essentiel", label: "Miroirs SDB Essentiel" },
  { id: "salon",         label: "Salon & Dressing" },
  { id: "consoles",      label: "Consoles & Entrée" },
  { id: "douches",       label: "Douches Italiennes" },
  { id: "tables",        label: "Tables de Séjour" },
];
const DB = "https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app";
const steps = ["Info & Photos", "Copier un produit", "Axes", "Prix", "Exporter"];

const slug = (s) => s.toLowerCase()
  .replace(/[àâä]/g,"a").replace(/[éèêë]/g,"e").replace(/[îï]/g,"i")
  .replace(/[ôö]/g,"o").replace(/[ùûü]/g,"u").replace(/[ç]/g,"c")
  .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");

// Build a complete product HTML page (SEO meta + JSON-LD + dynamic shell that
// product-loader.js fills from /products/{slug}.json). Mirrors the static
// pages' structure so search engines see canonical/og tags + product schema,
// while gallery/axes/prices are populated at runtime.
function buildProductHtml({ slug, name, catLabel, categoryId, images, seoTitle, seoDesc, variants, priceMin, priceMax }) {
  const title = seoTitle || name;
  const desc  = (seoDesc || "").replace(/"/g, "&quot;");
  const img   = images?.[0] || `/images/${slug}/1.webp`;
  const catUrl = String(categoryId || "").startsWith("sdb") ? "/miroir-salle-de-bain/" : "/";

  const offers = (variants || []).filter(v => v.price > 0).map(v => ({
    "@type": "Offer", priceCurrency: "MAD", price: String(Math.round(v.price)),
    availability: "https://schema.org/InStock",
    url: `https://novastyle.ma/produits/${slug}/`,
    seller: { "@type": "Organization", name: "Nova Style" }
  }));

  const schemaProduct = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product", name,
    description: (seoDesc || "").slice(0, 300),
    image: images || [],
    brand: { "@type": "Brand", name: "Nova Style" },
    sku: slug,
    offers: {
      "@type": "AggregateOffer", priceCurrency: "MAD",
      lowPrice: String(Math.round(priceMin || 0)),
      highPrice: String(Math.round(priceMax || 0)),
      offerCount: offers.length, offers
    }
  });

  const schemaBreadcrumb = JSON.stringify({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://novastyle.ma/" },
      { "@type": "ListItem", position: 2, name: catLabel || "Miroirs", item: `https://novastyle.ma${catUrl}` },
      { "@type": "ListItem", position: 3, name }
    ]
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Nova Style</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow">
<meta name="author" content="Nova Style">
<meta name="geo.region" content="MA-06">
<meta name="geo.placename" content="Casablanca">
<meta name="geo.position" content="33.5731;-7.5898">
<link rel="canonical" href="https://novastyle.ma/produits/${slug}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://novastyle.ma/produits/${slug}/">
<meta property="og:locale" content="fr_MA">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">
<link rel="icon" type="image/png" href="/assets/logo.png">
<link rel="stylesheet" href="/assets/style.css">
<link rel="preconnect" href="https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app" crossorigin>
<link rel="preconnect" href="https://www.gstatic.com" crossorigin>
</head>
<body>
<script type="application/ld+json">${schemaProduct}</script>
<script type="application/ld+json">${schemaBreadcrumb}</script>

<script src="/assets/ads-loader.js" defer></script>
<script src="/assets/header.js" defer></script>

<nav class="breadcrumb"><a href="/">Accueil</a> › <a href="${catUrl}">${catLabel || "Miroirs"}</a> › <span>${name}</span></nav>

<article class="product-page" id="product-root" data-slug="${slug}">
  <div class="product-gallery" id="p-gallery"></div>
  <div class="product-info">
    <h1>${name}</h1>
    <p class="p-subtitle">Miroir sur mesure · Fabrication Casablanca · Livraison Maroc</p>
    <div class="p-price" id="current-price"></div>
    <div class="axes-container" id="axes-container"></div>
    <div id="qty-wrap"></div>
    <div class="p-cta">
      <button class="btn-primary" id="add-to-cart-btn" onclick="addProductToCart()">🛒 Ajouter au panier</button>
      <a class="btn-secondary" href="/cart">Voir panier</a>
    </div>
    <div class="deposit-note">💡 Acompte de 50% requis pour confirmer la commande. Solde à la livraison ou installation.</div>
  </div>
</article>

<section class="product-content" id="p-desc"></section>

<section class="reviews-section">
  <ns-reviews-widget product-id="${slug}"></ns-reviews-widget>
  <script type="module" src="/assets/reviews-widget.js"></script>
</section>

<script type="module" src="/assets/product-loader.js"></script>
<script src="/assets/product-qty.js" defer></script>
<script src="/assets/footer.js" defer></script>
<script type="module" src="/assets/cart.js"></script>
<script type="module" src="/assets/visitor-tracker.js"></script>
</body>
</html>
`;
}

function generateAllVariants(axes, axis_order) {
  if (!axis_order.length) return [];
  let result = [{}];
  for (const axis of axis_order) {
    const opts = axes[axis] || [];
    const next = [];
    for (const combo of result)
      for (const opt of opts)
        next.push({ ...combo, [axis]: opt });
    result = next;
  }
  return result;
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function Stepper({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:32, gap:0 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : "none" }}>
          <div style={{
            width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
            background: i <= current ? "#e8194b" : "#1a1a1a",
            border: `2px solid ${i <= current ? "#e8194b" : "#333"}`,
            color: i <= current ? "#fff" : "#555", fontSize:11, fontWeight:800, flexShrink:0
          }}>{i < current ? "✓" : i+1}</div>
          <span style={{ marginLeft:7, fontSize:10, fontWeight:700, color: i === current ? "#fff" : i < current ? "#e8194b" : "#444", textTransform:"uppercase", letterSpacing:.8, flexShrink:0 }}>{s}</span>
          {i < steps.length-1 && <div style={{ flex:1, height:2, background: i < current ? "#e8194b" : "#1e1e1e", margin:"0 10px" }} />}
        </div>
      ))}
    </div>
  );
}

// ─── RICH HTML EDITOR ────────────────────────────────────────────────────────
function HtmlEditor({ value, onChange }) {
  const [tab, setTab] = useState("visual"); // visual | html | preview
  const editorRef = useRef(null);

  // Sync contentEditable → state
  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // When switching to visual, set innerHTML from value
  useEffect(() => {
    if (tab === "visual" && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [tab]);

  const exec = (cmd, arg) => { document.execCommand(cmd, false, arg); editorRef.current?.focus(); handleInput(); };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding:"5px 14px", fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
      background: tab === id ? "#e8194b" : "#1a1a1a", color: tab === id ? "#fff" : "#666",
      borderRadius:"6px 6px 0 0", textTransform:"uppercase", letterSpacing:.8
    }}>{label}</button>
  );

  const toolBtn = (label, onclick, title) => (
    <button title={title} onClick={onclick} style={{
      background:"#1e1e1e", border:"1px solid #2a2a2a", color:"#aaa", padding:"4px 10px",
      borderRadius:5, fontSize:12, cursor:"pointer", fontFamily:"inherit"
    }}>{label}</button>
  );

  return (
    <div style={{ border:"1px solid #2a2a2a", borderRadius:8, overflow:"hidden" }}>
      {/* Tabs */}
      <div style={{ display:"flex", gap:4, padding:"8px 10px 0", background:"#111", borderBottom:"1px solid #1e1e1e" }}>
        {tabBtn("visual","Visuel")}
        {tabBtn("html","HTML")}
        {tabBtn("preview","Aperçu")}
      </div>

      {/* Toolbar (visual only) */}
      {tab === "visual" && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, padding:"8px 10px", background:"#111", borderBottom:"1px solid #1e1e1e" }}>
          {toolBtn("H1", () => exec("formatBlock","h1"), "Titre H1")}
          {toolBtn("H2", () => exec("formatBlock","h2"), "Titre H2")}
          {toolBtn("H3", () => exec("formatBlock","h3"), "Titre H3")}
          {toolBtn("P",  () => exec("formatBlock","p"),  "Paragraphe")}
          {toolBtn(<b>G</b>, () => exec("bold"),   "Gras")}
          {toolBtn(<i>I</i>, () => exec("italic"), "Italique")}
          {toolBtn("🔗", () => { const url = prompt("URL du lien:"); if(url) exec("createLink", url); }, "Lien")}
          {toolBtn("• Liste", () => exec("insertUnorderedList"), "Liste à puces")}
          {toolBtn("Effacer", () => exec("removeFormat"), "Effacer format")}
        </div>
      )}

      {/* Visual editor */}
      {tab === "visual" && (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{
            minHeight:180, padding:"14px 16px", background:"#0d0d0d", color:"#e8e8e8",
            outline:"none", fontSize:13, lineHeight:1.7,
            fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
          }}
        />
      )}

      {/* Raw HTML textarea */}
      {tab === "html" && (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width:"100%", minHeight:200, padding:"14px 16px", background:"#0d0d0d",
            color:"#7ec8e3", border:"none", outline:"none", resize:"vertical",
            fontFamily:"'Courier New',monospace", fontSize:12, lineHeight:1.6, boxSizing:"border-box"
          }}
          placeholder="<h2>Titre section</h2><p>Description HTML…</p>"
        />
      )}

      {/* Preview */}
      {tab === "preview" && (
        <div
          style={{ minHeight:180, padding:"16px 20px", background:"#fff", color:"#111", fontSize:14, lineHeight:1.7 }}
          dangerouslySetInnerHTML={{ __html: value || "<em style='color:#aaa'>Aucun contenu</em>" }}
        />
      )}
    </div>
  );
}

// ─── PHOTO UPLOADER ──────────────────────────────────────────────────────────
function PhotoUploader({ slugVal, photos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const token = localStorage.getItem(GH_TOKEN_KEY);

  const addFiles = (files) => {
    const newPhotos = [...photos];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      newPhotos.push({ file, preview: url, name: file.name });
    });
    onChange(newPhotos);
  };

  const removePhoto = (i) => {
    const next = photos.filter((_, j) => j !== i);
    onChange(next);
  };

  const moveUp = (i) => {
    if (i === 0) return;
    const next = [...photos];
    [next[i-1], next[i]] = [next[i], next[i-1]];
    onChange(next);
  };

  const uploadAll = async () => {
    if (!token) { alert("Token GitHub manquant — configurez-le dans les Paramètres."); return; }
    if (!slugVal) { alert("Définissez d'abord le slug du produit (Étape 1)."); return; }
    setUploading(true);
    const res = [];
    for (let i = 0; i < photos.length; i++) {
      const { file } = photos[i];
      // Always use .webp extension regardless of source format — browsers
      // display PNG/JPG/JFIF served as .webp fine, and the rest of the site
      // expects .webp paths in product JSONs.
      const repoPath = `images/${slugVal}/${i+1}.webp`;
      try {
        const b64 = await fileToBase64(file);
        await ghUpload(token, repoPath, b64, `Add image ${i+1} for ${slugVal}`);
        res.push({ i, ok: true, path: repoPath });
      } catch(e) {
        res.push({ i, ok: false, err: e.message });
      }
    }
    setResults(res);
    setUploading(false);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#e8194b" : "#2a2a2a"}`,
          borderRadius:10, padding:"22px 16px", textAlign:"center", cursor:"pointer",
          background: dragOver ? "#1a0005" : "#0d0d0d", transition:"all .2s", marginBottom:12
        }}
      >
        <div style={{ fontSize:24, marginBottom:6 }}>📸</div>
        <div style={{ fontSize:13, color:"#888" }}>Glissez les photos ici ou <span style={{ color:"#e8194b" }}>cliquez pour choisir</span></div>
        <div style={{ fontSize:10, color:"#444", marginTop:4 }}>WEBP, JPG, PNG · L'ordre ici = ordre dans la galerie</div>
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display:"none" }} onChange={e => addFiles(e.target.files)} />
      </div>

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:8, marginBottom:12 }}>
          {photos.map((ph, i) => (
            <div key={i} style={{ position:"relative", background:"#111", borderRadius:8, overflow:"hidden", border:"1px solid #2a2a2a" }}>
              <img src={ph.preview} style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", top:4, left:4, background:"#e8194b", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:4 }}>
                {i+1}
              </div>
              <div style={{ position:"absolute", top:4, right:4, display:"flex", flexDirection:"column", gap:3 }}>
                {i > 0 && (
                  <button onClick={() => moveUp(i)} title="Monter" style={{ background:"#111a", border:"none", color:"#fff", borderRadius:4, width:20, height:20, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" }}>↑</button>
                )}
                <button onClick={() => removePhoto(i)} title="Supprimer" style={{ background:"#e8194b99", border:"none", color:"#fff", borderRadius:4, width:20, height:20, cursor:"pointer", fontSize:13, lineHeight:1 }}>×</button>
              </div>
              <div style={{ fontSize:9, color:"#555", padding:"3px 5px", textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{ph.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {photos.length > 0 && (
        <button onClick={uploadAll} disabled={uploading} style={{
          background: uploading ? "#2a2a2a" : "#1a6b1a", color: uploading ? "#555" : "#fff",
          border:"none", padding:"10px 20px", borderRadius:8, fontWeight:800, fontSize:13,
          cursor: uploading ? "not-allowed" : "pointer", width:"100%", marginBottom:8
        }}>
          {uploading ? "⏳ Upload en cours…" : `⬆ Uploader ${photos.length} photo${photos.length>1?"s":""} sur GitHub`}
        </button>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ background:"#0a0a0a", borderRadius:8, padding:10, marginTop:4 }}>
          {results.map(r => (
            <div key={r.i} style={{ fontSize:11, padding:"3px 0", color: r.ok ? "#00c853" : "#e8194b" }}>
              {r.ok ? `✓ Photo ${r.i+1} → ${r.path}` : `✗ Photo ${r.i+1}: ${r.err}`}
            </div>
          ))}
        </div>
      )}

      {!token && (
        <div style={{ fontSize:11, color:"#e8194b", marginTop:6 }}>
          ⚠ Token GitHub non configuré — allez dans Paramètres pour l'ajouter.
        </div>
      )}
    </div>
  );
}

// ─── STEP 1: INFO ─────────────────────────────────────────────────────────────
function StepInfo({ data, onChange, onNext }) {
  const [name,      setName]      = useState(data.name      || "");
  const [slugVal,   setSlug]      = useState(data.slug      || "");
  const [category,  setCategory]  = useState(data.category  || CATEGORIES[0].id);
  const [desc,      setDesc]      = useState(data.desc      || "");
  const [seoTitle,  setSeoTitle]  = useState(data.seoTitle  || "");
  const [seoDesc,   setSeoDesc]   = useState(data.seoDesc   || "");
  const [photos,    setPhotos]    = useState(data.photos    || []);
  const [autoSlug,  setAutoSlug]  = useState(!data.slug);

  useEffect(() => { if (autoSlug) setSlug("nova-style-" + slug(name)); }, [name, autoSlug]);

  const valid = name.trim() && slugVal.trim();

  const next = () => {
    onChange({ name, slug: slugVal, category, desc, seoTitle, seoDesc, photos, imageCount: photos.length || 3 });
    onNext();
  };

  const inp  = { background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"10px 14px", borderRadius:8, fontSize:14, outline:"none", width:"100%", fontFamily:"inherit", boxSizing:"border-box" };
  const lbl  = { fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:"1.2px", fontWeight:700, marginBottom:6, display:"block" };
  const card = { background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:20, marginBottom:16 };

  return (
    <div>
      {/* ① Identité */}
      <div style={card}>
        <div style={{ fontWeight:800, fontSize:12, color:"#e8194b", textTransform:"uppercase", letterSpacing:1, marginBottom:16 }}>① Identité du produit</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <div>
            <label style={lbl}>Nom du produit *</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Miroir LUNE LED" />
          </div>
          <div>
            <label style={lbl}>Slug (URL) *</label>
            <input style={{...inp, fontFamily:"monospace", fontSize:12}} value={slugVal}
              onChange={e => { setAutoSlug(false); setSlug(e.target.value); }} placeholder="nova-style-miroir-lune" />
            <div style={{ fontSize:10, color:"#555", marginTop:4 }}>
              → /produits/<span style={{ color:"#e8194b" }}>{slugVal || "…"}</span>/
            </div>
          </div>
        </div>
        <div>
          <label style={lbl}>Catégorie</label>
          <select style={{...inp, cursor:"pointer"}} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* ② Description HTML */}
      <div style={card}>
        <div style={{ fontWeight:800, fontSize:12, color:"#e8194b", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>② Description produit (HTML)</div>
        <div style={{ fontSize:11, color:"#555", marginBottom:10 }}>
          Utilisez les boutons de mise en forme ou collez directement du HTML. Supports H1, H2, H3, gras, italique, liens.
        </div>
        <HtmlEditor value={desc} onChange={setDesc} />
      </div>

      {/* ③ SEO */}
      <div style={card}>
        <div style={{ fontWeight:800, fontSize:12, color:"#e8194b", textTransform:"uppercase", letterSpacing:1, marginBottom:16 }}>③ SEO</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <label style={lbl}>Titre SEO (meta title)</label>
            <input style={inp} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Miroir LUNE LED salle de bain | Nova Style Maroc" />
            <div style={{ fontSize:10, color: seoTitle.length > 60 ? "#e8194b" : "#555", marginTop:4 }}>{seoTitle.length}/60 car.</div>
          </div>
          <div>
            <label style={lbl}>Meta description</label>
            <input style={inp} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Miroir LUNE Nova Style — LED anti-buée, verre AGC…" />
            <div style={{ fontSize:10, color: seoDesc.length > 160 ? "#e8194b" : "#555", marginTop:4 }}>{seoDesc.length}/160 car.</div>
          </div>
        </div>
      </div>

      {/* ④ Photos */}
      <div style={card}>
        <div style={{ fontWeight:800, fontSize:12, color:"#e8194b", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>④ Photos produit</div>
        <div style={{ fontSize:11, color:"#555", marginBottom:12 }}>
          Ajoutez les photos ici pour les uploader directement sur GitHub dans <code style={{color:"#7ec8e3"}}>/images/{slugVal || "slug"}/</code>.<br/>
          La 1ère photo = image principale. Réordonnez en cliquant ↑.
        </div>
        <PhotoUploader slugVal={slugVal} photos={photos} onChange={setPhotos} />
      </div>

      <button onClick={next} disabled={!valid} style={{
        background: valid ? "#e8194b" : "#2a2a2a", color: valid ? "#fff" : "#555",
        border:"none", padding:"13px 32px", borderRadius:8, fontWeight:800, fontSize:14,
        cursor: valid ? "pointer" : "not-allowed", transition:"all .2s"
      }}>
        Suivant → Copier une config
      </button>
    </div>
  );
}

// ─── STEP 2: COPY FROM ALL PRODUCTS ──────────────────────────────────────────
function StepCopy({ onNext, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [catFilter,setCatFilter]= useState("all");
  const [selected, setSelected] = useState(null);  // { slug, name, image }
  const [copied,   setCopied]   = useState(null);  // full product JSON
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        let data;
        // Prefer already-loaded index from tab Produits (same fetch, no round-trip)
        if (window.__novaIndexData && (window.__novaIndexData.products || []).length > 0) {
          data = window.__novaIndexData;
        } else {
          // Fallback: fetch directly, same pattern as loadProductList in admin
          const r = await fetch('/products-index.json?_=' + Date.now());
          if (!r.ok) throw new Error('HTTP ' + r.status);
          data = await r.json();
          window.__novaIndexData = data; // cache for next time
        }
        const list = (data.products || []).filter(p => p.active !== false && !/[^\x00-\x7F]/.test(p.slug));
        setProducts(list);
      } catch(e) {
        setFetchErr('Impossible de charger les produits : ' + e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filtered = products.filter(p => {
    const matchCat = catFilter === "all" || p.categoryId === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectProduct = async (p) => {
    setSelected(p);
    setCopied(null);
    setFetchErr("");
    setFetching(true);
    try {
      const r = await fetch(`/products/${p.slug}.json`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const full = await r.json();
      setCopied(full);
    } catch(e) {
      setFetchErr(e.message);
    } finally {
      setFetching(false);
    }
  };

  const buildConfig = () => {
    if (!copied) return null;
    // Support both old (axis_order) and new (axes.order) schema
    const order   = copied.axes?.order || copied.axis_order || [];
    const options = copied.axes?.options || copied.axes || {};
    // Remove non-array keys from options
    const cleanOpts = {};
    order.forEach(ax => { if (Array.isArray(options[ax])) cleanOpts[ax] = options[ax]; });
    return { axis_order: order, axes: cleanOpts, variants: copied.variants || [] };
  };

  const inp = { background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"8px 12px", borderRadius:6, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

  return (
    <div>
      <p style={{ color:"#888", fontSize:13, marginBottom:16, lineHeight:1.7 }}>
        Choisissez un produit existant pour <strong style={{ color:"#f0f0f0" }}>copier sa configuration d'axes et de variantes</strong>.<br/>
        Vous pourrez modifier dimensions, options et prix ensuite.
      </p>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <input style={{...inp, flex:1, minWidth:180}} value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit…" />
        <select style={{...inp, cursor:"pointer"}} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <div style={{ fontSize:11, color:"#444", padding:"8px 14px", background:"#111", border:"1px solid #1e1e1e", borderRadius:6 }}>
          {filtered.length} produits
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#555", fontSize:13 }}>Chargement des produits…</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10, marginBottom:16, maxHeight:420, overflowY:"auto", paddingRight:4 }}>
          {filtered.map(p => {
            const isSelected = selected?.slug === p.slug;
            const priceMin = p.price?.min;
            return (
              <div key={p.slug} onClick={() => selectProduct(p)} style={{
                background: isSelected ? "#1a0008" : "#141414",
                border: `2px solid ${isSelected ? "#e8194b" : "#1e1e1e"}`,
                borderRadius:10, cursor:"pointer", overflow:"hidden", transition:"all .15s"
              }}>
                <div style={{ aspectRatio:"1", overflow:"hidden", background:"#0d0d0d" }}>
                  <img src={p.image} alt={p.name} loading="lazy"
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                    onError={e => { e.target.style.display="none"; }}
                  />
                </div>
                <div style={{ padding:"8px 10px" }}>
                  <div style={{ fontSize:11, fontWeight:800, color: isSelected ? "#e8194b" : "#e0e0e0", lineHeight:1.3, marginBottom:4 }}>{p.name}</div>
                  {priceMin != null && <div style={{ fontSize:10, color:"#555" }}>dès {Math.round(priceMin).toLocaleString("fr-FR")} MAD</div>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:30, color:"#555", fontSize:13 }}>Aucun produit trouvé.</div>}
        </div>
      )}

      {/* Selected product preview */}
      {selected && (
        <div style={{ background:"#0d0800", border:"1px solid #3a2000", borderRadius:10, padding:16, marginBottom:16 }}>
          {fetching && <div style={{ fontSize:12, color:"#888" }}>⏳ Chargement de la configuration…</div>}
          {fetchErr && <div style={{ fontSize:12, color:"#e8194b" }}>❌ {fetchErr}</div>}
          {copied && (() => {
            const cfg = buildConfig();
            return (
              <div>
                <div style={{ fontWeight:700, color:"#ffb300", fontSize:12, marginBottom:10 }}>
                  📋 Config copiée depuis : <span style={{ color:"#fff" }}>{selected.name}</span>
                </div>
                {cfg.axis_order.length > 0 ? cfg.axis_order.map(axis => (
                  <div key={axis} style={{ marginBottom:6 }}>
                    <span style={{ fontSize:11, color:"#555", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{axis}: </span>
                    <span style={{ fontSize:11, color:"#ccc" }}>{(cfg.axes[axis] || []).join(" · ")}</span>
                  </div>
                )) : <div style={{ fontSize:11, color:"#555" }}>Pas d'axes de variantes.</div>}
                <div style={{ fontSize:11, color:"#555", marginTop:8 }}>
                  {cfg.variants.length} variantes · Prix: {Math.min(...cfg.variants.map(v=>v.price).filter(p=>p>0), Infinity).toLocaleString("fr-FR")} – {Math.max(...cfg.variants.map(v=>v.price).filter(p=>p>0), 0).toLocaleString("fr-FR")} MAD
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div style={{ display:"flex", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #2a2a2a", color:"#888", padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>← Retour</button>
        <button onClick={() => onNext(copied && !fetchErr ? buildConfig() : null)} style={{ background:"#e8194b", color:"#fff", border:"none", padding:"11px 32px", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer" }}>
          {copied && !fetchErr ? "Copier cette config →" : "Continuer sans copier →"}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: AXES ─────────────────────────────────────────────────────────────
function StepAxes({ copied, onNext, onBack }) {
  const [axisOrder, setAxisOrder] = useState(copied?.axis_order || ["Dimension"]);
  const [axes, setAxes] = useState(() => {
    if (copied) return JSON.parse(JSON.stringify(copied.axes));
    return { Dimension: [""] };
  });
  const [newAxisName, setNewAxisName] = useState("");

  const addAxis = () => {
    if (!newAxisName.trim() || axisOrder.includes(newAxisName.trim())) return;
    const n = newAxisName.trim();
    setAxisOrder(a => [...a, n]);
    setAxes(a => ({ ...a, [n]: [""] }));
    setNewAxisName("");
  };
  const removeAxis = (ax) => {
    setAxisOrder(o => o.filter(a => a !== ax));
    setAxes(a => { const b = {...a}; delete b[ax]; return b; });
  };
  const updateOption = (ax, i, val) => setAxes(a => ({ ...a, [ax]: a[ax].map((v,j) => j===i ? val : v) }));
  const addOption    = (ax)       => setAxes(a => ({ ...a, [ax]: [...a[ax], ""] }));
  const removeOption = (ax, i)    => setAxes(a => ({ ...a, [ax]: a[ax].filter((_,j) => j!==i) }));

  const totalVariants = axisOrder.reduce((acc, ax) => acc * (axes[ax]?.filter(v=>v.trim()).length || 1), 1);
  const inp = { background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"8px 12px", borderRadius:6, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:13 }}>Configurez les axes de variantes (dimensions, LED, finitions…)</p>
        <div style={{ fontSize:11, color:"#444", background:"#141414", padding:"5px 12px", borderRadius:20, border:"1px solid #222" }}>
          <span style={{ color:"#e8194b", fontWeight:800 }}>{totalVariants}</span> variantes
        </div>
      </div>

      {axisOrder.map(ax => (
        <div key={ax} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontWeight:800, fontSize:13, color:"#e0e0e0" }}>{ax}</span>
            {axisOrder.length > 1 && (
              <button onClick={() => removeAxis(ax)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:18, padding:0 }}>×</button>
            )}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
            {(axes[ax] || []).map((val, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <input style={{...inp, width:180}} value={val} onChange={e => updateOption(ax, i, e.target.value)} placeholder={`Option ${i+1}`} />
                {(axes[ax] || []).length > 1 && (
                  <button onClick={() => removeOption(ax, i)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:16, padding:"0 4px" }}>×</button>
                )}
              </div>
            ))}
            <button onClick={() => addOption(ax)} style={{ background:"#1e1e1e", border:"1px dashed #333", color:"#666", padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:12 }}>+ Option</button>
          </div>
        </div>
      ))}

      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        <input style={{...inp, width:200}} value={newAxisName} onChange={e => setNewAxisName(e.target.value)} placeholder="Nouveau axe (ex: Finition)" onKeyDown={e => e.key==="Enter" && addAxis()} />
        <button onClick={addAxis} style={{ background:"#1e1e1e", border:"1px solid #333", color:"#888", padding:"8px 16px", borderRadius:6, cursor:"pointer", fontSize:12 }}>+ Ajouter axe</button>
      </div>

      <div style={{ display:"flex", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #2a2a2a", color:"#888", padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>← Retour</button>
        <button onClick={() => onNext({ axis_order: axisOrder, axes: Object.fromEntries(Object.entries(axes).map(([k,v]) => [k, v.filter(x=>x.trim())])) })}
          style={{ background:"#e8194b", color:"#fff", border:"none", padding:"11px 32px", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer" }}>
          Suivant → Prix ({totalVariants} variantes)
        </button>
      </div>
    </div>
  );
}

// ─── STEP 4: PRIX ─────────────────────────────────────────────────────────────
function StepPrix({ axesConfig, copied, onNext, onBack }) {
  const allCombos = useMemo(() => generateAllVariants(axesConfig.axes, axesConfig.axis_order), [axesConfig]);

  const initPrices = () => {
    const map = {};
    allCombos.forEach(combo => {
      const key = JSON.stringify(combo);
      if (copied) {
        const match = copied.variants.find(v => axesConfig.axis_order.every(ax => v.axes[ax] === combo[ax]));
        map[key] = match ? match.price : 0;
      } else map[key] = 0;
    });
    return map;
  };

  const [prices,    setPrices]   = useState(initPrices);
  const [pctInput,  setPctInput] = useState("");
  const [filterAxis,setFA]       = useState("all");
  const [filterVal, setFV]       = useState("all");

  const updatePrice = (key, val) => { const n = parseFloat(val); setPrices(p => ({ ...p, [key]: isNaN(n) ? 0 : n })); };

  const applyPct = (mode) => {
    const pct = parseFloat(pctInput); if (isNaN(pct)) return;
    const mult = 1 + pct / 100;
    setPrices(p => {
      const next = { ...p };
      allCombos.forEach(combo => {
        const key = JSON.stringify(combo);
        if (mode === "all" || (filterAxis !== "all" && combo[filterAxis] === filterVal))
          next[key] = Math.round(p[key] * mult);
      });
      return next;
    });
  };

  const setAllPrices = (val) => {
    const n = parseFloat(val); if (isNaN(n)) return;
    setPrices(p => { const next = { ...p }; allCombos.forEach(combo => { next[JSON.stringify(combo)] = n; }); return next; });
  };

  const firstAxis = axesConfig.axis_order[0];
  const allPriceVals = Object.values(prices).filter(v => v > 0);
  const priceMin = allPriceVals.length ? Math.min(...allPriceVals) : 0;
  const priceMax = allPriceVals.length ? Math.max(...allPriceVals) : 0;
  const inp = { background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"7px 10px", borderRadius:6, fontSize:13, outline:"none", width:90, textAlign:"right", fontFamily:"monospace" };

  return (
    <div>
      <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1.2, fontWeight:700, marginBottom:12 }}>🔧 Outils de prix</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"flex-end" }}>
          <div>
            <div style={{ fontSize:10, color:"#888", marginBottom:5 }}>% sur tous les prix</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"8px 12px", borderRadius:6, width:80, outline:"none", fontSize:14, fontFamily:"monospace", textAlign:"right" }}
                value={pctInput} onChange={e => setPctInput(e.target.value)} placeholder="+10" />
              <span style={{ color:"#555" }}>%</span>
              <button onClick={() => applyPct("all")} style={{ background:"#e8194b", color:"#fff", border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700, fontSize:12, cursor:"pointer" }}>Appliquer</button>
            </div>
          </div>
          {axesConfig.axis_order.length > 1 && (
            <div>
              <div style={{ fontSize:10, color:"#888", marginBottom:5 }}>Appliquer seulement à…</div>
              <div style={{ display:"flex", gap:6 }}>
                <select style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"7px 10px", borderRadius:6, fontSize:12, outline:"none", cursor:"pointer" }}
                  value={filterAxis} onChange={e => { setFA(e.target.value); setFV("all"); }}>
                  <option value="all">Tous axes</option>
                  {axesConfig.axis_order.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {filterAxis !== "all" && (
                  <select style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"7px 10px", borderRadius:6, fontSize:12, outline:"none", cursor:"pointer" }}
                    value={filterVal} onChange={e => setFV(e.target.value)}>
                    <option value="all">Toutes options</option>
                    {(axesConfig.axes[filterAxis] || []).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
                {filterAxis !== "all" && filterVal !== "all" && (
                  <button onClick={() => applyPct("filter")} style={{ background:"#1e1e1e", border:"1px solid #e8194b30", color:"#e8194b", padding:"7px 14px", borderRadius:6, fontWeight:700, fontSize:12, cursor:"pointer" }}>→ {filterVal}</button>
                )}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize:10, color:"#888", marginBottom:5 }}>Mettre tous à</div>
            <div style={{ display:"flex", gap:6 }}>
              <input id="bulk-price" style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"8px 12px", borderRadius:6, width:80, outline:"none", fontSize:14, fontFamily:"monospace", textAlign:"right" }} placeholder="1200" />
              <span style={{ color:"#555", lineHeight:"36px" }}>MAD</span>
              <button onClick={() => setAllPrices(document.getElementById("bulk-price")?.value)} style={{ background:"#1e1e1e", border:"1px solid #2a2a2a", color:"#888", padding:"8px 14px", borderRadius:6, fontSize:12, cursor:"pointer" }}>OK</button>
            </div>
          </div>
          <div style={{ marginLeft:"auto", textAlign:"right" }}>
            <div style={{ fontSize:10, color:"#555" }}>Fourchette</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#e8194b" }}>{priceMin.toLocaleString("fr-FR")} – {priceMax.toLocaleString("fr-FR")} <span style={{fontSize:11,color:"#555"}}>MAD</span></div>
          </div>
        </div>
      </div>

      <div style={{ maxHeight:440, overflowY:"auto", borderRadius:12, border:"1px solid #1e1e1e", marginBottom:20 }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead style={{ position:"sticky", top:0, background:"#0d0d0d", zIndex:2 }}>
            <tr>
              {axesConfig.axis_order.map(ax => (
                <th key={ax} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1.2, fontWeight:700, borderBottom:"2px solid #1e1e1e" }}>{ax}</th>
              ))}
              <th style={{ padding:"10px 14px", textAlign:"right", fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1.2, fontWeight:700, borderBottom:"2px solid #1e1e1e" }}>Prix MAD</th>
            </tr>
          </thead>
          <tbody>
            {allCombos.map((combo, i) => {
              const key = JSON.stringify(combo);
              const showDim = i === 0 || allCombos[i-1][firstAxis] !== combo[firstAxis];
              return (
                <tr key={key} style={{ background: i%2===0 ? "#111" : "#0f0f0f", borderBottom:"1px solid #1a1a1a" }}>
                  {axesConfig.axis_order.map((ax, j) => (
                    <td key={ax} style={{ padding:"8px 14px", fontSize:12, color: j===0 ? "#e0e0e0" : "#888", fontWeight: j===0 && showDim ? 700 : 400 }}>
                      {j===0 ? (showDim ? combo[ax] : <span style={{color:"#333"}}>″</span>) : combo[ax]}
                    </td>
                  ))}
                  <td style={{ padding:"6px 14px", textAlign:"right" }}>
                    <input style={inp} type="number" min={0} step={50} value={prices[key] || ""} onChange={e => updatePrice(key, e.target.value)} placeholder="0" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display:"flex", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #2a2a2a", color:"#888", padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>← Retour</button>
        <button onClick={() => onNext(prices, allCombos)} style={{ background:"#e8194b", color:"#fff", border:"none", padding:"11px 32px", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer" }}>
          Suivant → Exporter & Enregistrer
        </button>
      </div>
    </div>
  );
}

// ─── STEP 5: EXPORT (fully automatic) ────────────────────────────────────────
function StepExport({ info, axesConfig, prices, allCombos, onBack }) {
  // tasks: { id, label, status: "pending"|"running"|"ok"|"error", detail }
  const [tasks, setTasks] = useState([
    { id: "firebase", label: "Enregistrer dans Firebase",                      status: "pending", detail: "" },
    { id: "product",  label: `Créer products/${info.slug}.json`,               status: "pending", detail: "" },
    { id: "page",     label: `Créer la page produits/${info.slug}/index.html`,  status: "pending", detail: "" },
    { id: "index",    label: "Mettre à jour products-index.json",              status: "pending", detail: "" },
    { id: "regen",    label: "Régénérer les pages catégories",                 status: "pending", detail: "" },
  ]);
  const [done, setDone] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const variants   = allCombos.map(combo => ({ axes: combo, price: prices[JSON.stringify(combo)] || 0, sku: "" }));
  const validPrices = variants.map(v => v.price).filter(p => p > 0);
  const priceMin    = validPrices.length ? Math.min(...validPrices) : 0;
  const priceMax    = validPrices.length ? Math.max(...validPrices) : 0;
  const imgCount    = info.photos?.length || info.imageCount || 1;
  const images      = Array.from({ length: imgCount }, (_, i) => `/images/${info.slug}/${i+1}.webp`);
  const catLabel    = CATEGORIES.find(c => c.id === info.category)?.label || info.category;

  const productJson = JSON.stringify({
    slug: info.slug, name: info.name, categoryId: info.category, category: catLabel,
    active: true, images,
    description: info.desc || "",
    seo: { title: info.seoTitle || info.name, description: info.seoDesc || "" },
    axes: { order: axesConfig.axis_order, options: axesConfig.axes },
    variants
  }, null, 2);

  const indexEntry = {
    slug: info.slug, name: info.name, categoryId: info.category, category: catLabel,
    image: images[0], images, active: true,
    price: { min: priceMin, max: priceMax },
    axes: { order: axesConfig.axis_order, options: axesConfig.axes },
    seo: { title: info.seoTitle || info.name, description: info.seoDesc || "" },
    hasVariants: variants.length > 0, variantCount: variants.length
  };

  const catalogEntry = JSON.stringify({
    title: info.name, slug: info.slug, category: catLabel, active: true, images,
    price_min: priceMin, price_max: priceMax,
    axis_order: axesConfig.axis_order, axes: axesConfig.axes, variants,
    description: info.desc, seo: { title: info.seoTitle || info.name, description: info.seoDesc }
  }, null, 2);

  const setTask = (id, patch) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  // ── Run all tasks automatically on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(GH_TOKEN_KEY);

    async function runAll() {
      // 1. Firebase
      setTask("firebase", { status: "running", detail: "" });
      try {
        const fbAuth = window.__NOVA_FIREBASE__?.auth;
        const currentUser = fbAuth?.currentUser;
        if (!currentUser) throw new Error("Non authentifié");
        const fbToken = await currentUser.getIdToken();
        const res = await fetch(`${DB}/catalog/${info.slug}.json?auth=${fbToken}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: catalogEntry
        });
        if (!res.ok) throw new Error(`Firebase ${res.status}`);
        setTask("firebase", { status: "ok", detail: `catalog/${info.slug}` });
      } catch(e) {
        setTask("firebase", { status: "error", detail: e.message });
      }

      if (!token) {
        setTask("product",  { status: "error", detail: "Token GitHub manquant — configurez-le dans Paramètres" });
        setTask("page",     { status: "error", detail: "Token GitHub manquant" });
        setTask("index",    { status: "error", detail: "Token GitHub manquant" });
        setDone(true);
        return;
      }

      // 2. products/{slug}.json
      setTask("product", { status: "running", detail: "" });
      try {
        const b64 = btoa(unescape(encodeURIComponent(productJson)));
        await ghUpload(token, `products/${info.slug}.json`, b64, `Add product ${info.slug}`);
        setTask("product", { status: "ok", detail: `products/${info.slug}.json` });
      } catch(e) {
        setTask("product", { status: "error", detail: e.message });
      }

      // 3. produits/{slug}/index.html — generate full HTML page with SEO + JSON-LD
      setTask("page", { status: "running", detail: "" });
      try {
        const html = buildProductHtml({
          slug: info.slug, name: info.name, catLabel,
          categoryId: info.category, images,
          seoTitle: info.seoTitle, seoDesc: info.seoDesc,
          variants, priceMin, priceMax
        });
        const b64 = btoa(unescape(encodeURIComponent(html)));
        await ghUpload(token, `produits/${info.slug}/index.html`, b64, `Add product page ${info.slug}`);
        setTask("page", { status: "ok", detail: `produits/${info.slug}/index.html` });
      } catch(e) {
        setTask("page", { status: "error", detail: e.message });
      }

      // 4. products-index.json — fetch current, insert new entry, push back
      setTask("index", { status: "running", detail: "" });
      try {
        const fileRes = await fetch(
          `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/products-index.json`,
          { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json" } }
        );
        if (!fileRes.ok) throw new Error(`Cannot read products-index.json (${fileRes.status})`);
        const fileData = await fileRes.json();
        // Decode as UTF-8 (not Latin-1) to preserve French accents in existing product names.
        const binary = atob(fileData.content.replace(/\n/g, ""));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const currentContent = JSON.parse(new TextDecoder("utf-8").decode(bytes));

        // Remove existing entry with same slug (idempotent)
        const products = (currentContent.products || []).filter(p => p.slug !== info.slug);
        products.push(indexEntry);
        currentContent.products = products;

        const newB64 = btoa(unescape(encodeURIComponent(JSON.stringify(currentContent, null, 2))));
        await fetch(
          `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/products-index.json`,
          {
            method: "PUT",
            headers: { Authorization: `token ${token}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
            body: JSON.stringify({ message: `Add ${info.slug} to products-index`, content: newB64, sha: fileData.sha, branch: GH_BRANCH })
          }
        );
        setTask("index", { status: "ok", detail: `${products.length} produits dans l'index` });
        // Invalidate local cache so StepCopy picks up fresh data next time
        window.__novaIndexData = null;
      } catch(e) {
        setTask("index", { status: "error", detail: e.message });
      }

      // 5. Regenerate category pages static HTML so new product appears immediately
      setTask("regen", { status: "running", detail: "" });
      try {
        const REGEN_CATS = [
          { id: "sdb-premium",   path: "categorie/sdb-premium/index.html" },
          { id: "sdb-essentiel", path: "categorie/sdb-essentiel/index.html" },
          { id: "salon",         path: "categorie/salon/index.html" },
          { id: "consoles",      path: "categorie/consoles/index.html" },
          { id: "tables",        path: "categorie/tables/index.html" },
          { id: "douches",       path: "categorie/douches/index.html" },
        ];
        const regenTok = token || localStorage.getItem("nova_gh_pat") || "";
        if (!regenTok) throw new Error("Token GitHub manquant pour la régénération");

        // Fetch the just-committed products-index.json
        const idxRes = await fetch(
          `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/products-index.json`,
          { headers: { Authorization: `token ${regenTok}`, Accept: "application/vnd.github+json" } }
        );
        if (!idxRes.ok) throw new Error(`Lecture products-index.json : ${idxRes.status}`);
        const idxFile = await idxRes.json();
        const idxBinary = atob(idxFile.content.replace(/\n/g, ""));
        const idxBytes = new Uint8Array(idxBinary.length);
        for (let i = 0; i < idxBinary.length; i++) idxBytes[i] = idxBinary.charCodeAt(i);
        const freshIndex = JSON.parse(new TextDecoder("utf-8").decode(idxBytes));

        // Group active products by categoryId
        const byCat = {};
        (freshIndex.products || []).filter(p => p.active !== false).forEach(p => {
          if (!byCat[p.categoryId]) byCat[p.categoryId] = [];
          byCat[p.categoryId].push(p);
        });

        // Build a product card (same as category-loader.js)
        const cardHTML = (p) => {
          const price = (p.price?.min != null)
            ? "À partir de " + Math.round(p.price.min).toLocaleString("fr-FR") + " MAD" : "";
          return `<a class="product-card" href="/produits/${p.slug}/">\n  <div class="card-img"><img src="${p.image}" alt="${p.name.replace(/"/g, "&quot;")}" loading="lazy" width="400" height="400"></div>\n  <div class="card-info">\n    <div class="card-name">${p.name}</div>\n    <div class="card-price">${price}</div>\n  </div>\n</a>`;
        };

        let regenOk = 0, regenFail = 0;
        for (const cat of REGEN_CATS) {
          try {
            const catRes = await fetch(
              `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${cat.path}`,
              { headers: { Authorization: `token ${regenTok}`, Accept: "application/vnd.github+json" } }
            );
            if (!catRes.ok) throw new Error(`${catRes.status}`);
            const catFile = await catRes.json();
            const catBin = atob(catFile.content.replace(/\n/g, ""));
            const catBytes = new Uint8Array(catBin.length);
            for (let i = 0; i < catBin.length; i++) catBytes[i] = catBin.charCodeAt(i);
            let catHTML = new TextDecoder("utf-8").decode(catBytes);

            // Replace static product cards inside #products-grid
            const catProds = byCat[cat.id] || [];
            const cards = catProds.map(cardHTML).join("\n");
            catHTML = catHTML.replace(
              /(<div id="products-grid"[^>]*>)([\s\S]*?)(<\/div>\s*\n\n<\/section>)/,
              (_, open, _old, close) => `${open}\n${cards}\n</div>\n\n</section>`
            );
            catHTML = catHTML.replace(/("numberOfItems"\s*:\s*)\d+/, `$1${catProds.length}`);

            const newB64 = btoa(unescape(encodeURIComponent(catHTML)));
            await fetch(
              `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${cat.path}`,
              {
                method: "PUT",
                headers: { Authorization: `token ${regenTok}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
                body: JSON.stringify({ message: `⚡ Regen ${cat.id} after adding ${info.slug}`, content: newB64, sha: catFile.sha, branch: GH_BRANCH })
              }
            );
            regenOk++;
          } catch { regenFail++; }
        }
        if (regenFail === 0) {
          setTask("regen", { status: "ok", detail: `${regenOk} pages mises à jour` });
        } else {
          setTask("regen", { status: "error", detail: `${regenOk} ok, ${regenFail} erreur(s)` });
        }
      } catch(e) {
        setTask("regen", { status: "error", detail: e.message });
      }

      setDone(true);
    }

    runAll();
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1800); });
  };

  const CopyBtn = ({ text, id, label }) => (
    <button onClick={() => copy(text, id)} style={{
      background: copiedKey===id ? "#091509" : "#1e1e1e",
      border: copiedKey===id ? "1px solid #00c85340" : "1px solid #2a2a2a",
      color: copiedKey===id ? "#00c853" : "#888",
      padding:"5px 12px", borderRadius:5, fontSize:11, cursor:"pointer", marginLeft:8
    }}>
      {copiedKey===id ? "✓ Copié !" : `📋 ${label}`}
    </button>
  );

  const statusIcon = (s) => s === "pending" ? "⏳" : s === "running" ? "🔄" : s === "ok" ? "✅" : "❌";
  const statusColor = (s) => s === "ok" ? "#00c853" : s === "error" ? "#e8194b" : s === "running" ? "#ffb300" : "#555";
  const boxStyle = { background:"#0a0a0a", border:"1px solid #1e1e1e", borderRadius:8, padding:"12px 14px", fontFamily:"'Courier New',monospace", fontSize:11, color:"#7ec8e3", lineHeight:1.6, maxHeight:180, overflowY:"auto", overflowX:"auto", whiteSpace:"pre", marginTop:8 };

  return (
    <div>
      {/* Summary */}
      <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[["Produit",info.name],["Variantes",variants.length],["Prix min",priceMin?priceMin+" MAD":"—"],["Prix max",priceMax?priceMax+" MAD":"—"]].map(([l,v]) => (
            <div key={l}>
              <div style={{ fontSize:9, color:"#444", textTransform:"uppercase", letterSpacing:1.5, fontWeight:700 }}>{l}</div>
              <div style={{ fontSize:15, fontWeight:800, color:"#e8194b", marginTop:3 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-tasks progress */}
      <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:20, marginBottom:20 }}>
        <div style={{ fontWeight:800, fontSize:13, color:"#f0f0f0", marginBottom:16 }}>
          {done ? (tasks.every(t=>t.status==="ok") ? "✅ Tout est enregistré automatiquement !" : "⚠ Terminé avec des erreurs") : "🔄 Enregistrement en cours…"}
        </div>
        {tasks.map(t => (
          <div key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
            <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{statusIcon(t.status)}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color: statusColor(t.status) }}>{t.label}</div>
              {t.detail && <div style={{ fontSize:11, color: t.status==="error" ? "#e8194b" : "#555", marginTop:3 }}>{t.detail}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Success / link to live page */}
      {done && tasks.every(t => t.status === "ok") && (
        <div style={{ background:"#091509", border:"1px solid #00c85340", borderRadius:12, padding:16, marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:24, marginBottom:6 }}>🎉</div>
          <div style={{ fontWeight:800, color:"#00c853", fontSize:14, marginBottom:8 }}>Produit publié — tout est automatique !</div>
          <a href={`/produits/${info.slug}/`} target="_blank" style={{ color:"#7ec8e3", fontSize:13, textDecoration:"none", borderBottom:"1px dotted #7ec8e3" }}>
            Voir la page produit ↗
          </a>
        </div>
      )}

      {/* JSON copy fallback (for debugging or manual rescue) */}
      {done && tasks.some(t => t.status === "error") && (
        <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", marginBottom:6 }}>
            <div style={{ fontWeight:800, fontSize:12, color:"#f0f0f0" }}>products/{info.slug}.json (sauvegarde)</div>
            <CopyBtn text={productJson} id="productjson" label="Copier" />
          </div>
          <div style={boxStyle}>{productJson.substring(0,500)}{productJson.length>500?"\n…":""}</div>
        </div>
      )}

      <div style={{ display:"flex", gap:12, marginTop:8 }}>
        {!done && <button disabled style={{ background:"#1a1a1a", color:"#444", border:"1px solid #222", padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"not-allowed" }}>← Retour</button>}
        {done && <button onClick={onBack} style={{ background:"none", border:"1px solid #2a2a2a", color:"#888", padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>← Retour</button>}
        {done && <button onClick={() => window.location.reload()} style={{ background:"#e8194b", color:"#fff", border:"none", padding:"11px 28px", borderRadius:8, fontWeight:800, fontSize:13, cursor:"pointer" }}>
          + Nouveau produit
        </button>}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step,      setStep]     = useState(0);
  const [info,      setInfo]     = useState({});
  const [copied,    setCopied]   = useState(null);
  const [axesConfig,setAxesCfg] = useState(null);
  const [prices,    setPrices]   = useState(null);
  const [allCombos, setAllCombos]= useState(null);

  return (
    <div style={{ background:"#0f0f0f", minHeight:"100vh", color:"#f0f0f0", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding:"0 0 60px" }}>
      <div style={{ background:"#141414", borderBottom:"2px solid #e8194b", padding:"14px 24px", display:"flex", alignItems:"center", gap:16, marginBottom:32 }}>
        <span style={{ fontSize:20, fontWeight:900, color:"#e8194b", letterSpacing:-1 }}>NOVA STYLE</span>
        <span style={{ fontSize:10, color:"#333", letterSpacing:3, textTransform:"uppercase", marginTop:2 }}>Nouveau Produit</span>
        <div style={{ marginLeft:"auto", fontSize:11, color:"#555", background:"#111", padding:"4px 12px", borderRadius:12, border:"1px solid #1e1e1e" }}>
          Étape {step+1} / {steps.length}
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"0 24px" }}>
        <Stepper current={step} />
        {step===0 && <StepInfo  data={info} onChange={setInfo} onNext={() => setStep(1)} />}
        {step===1 && <StepCopy  onBack={() => setStep(0)} onNext={ref => { setCopied(ref); setStep(2); }} />}
        {step===2 && <StepAxes  copied={copied} onBack={() => setStep(1)} onNext={cfg => { setAxesCfg(cfg); setStep(3); }} />}
        {step===3 && <StepPrix  axesConfig={axesConfig} copied={copied} onBack={() => setStep(2)} onNext={(p,c) => { setPrices(p); setAllCombos(c); setStep(4); }} />}
        {step===4 && <StepExport info={info} axesConfig={axesConfig} prices={prices} allCombos={allCombos} onBack={() => setStep(3)} />}
      </div>
    </div>
  );
}
