/**
 * cart.js — Nova Style [REPAIRED]
 * EMAIL SETUP (emailjs.com — free):
 *   1. Sign up → Add Gmail service → note SERVICE_ID
 *   2. Create template "nova_admin"  → note TEMPLATE_ID
 *   3. Create template "nova_client" → note TEMPLATE_ID
 *   4. Copy PUBLIC KEY from Account > API Keys
 *   5. Fill the 5 constants below
 * Leave EMAILJS_PUBLIC_KEY="" to disable emails silently.
 *
 * Admin template vars: {{order_id}} {{customer_name}} {{customer_phone}}
 *   {{customer_city}} {{customer_address}} {{customer_notes}} {{customer_email}}
 *   {{items_html}} {{total}} {{deposit}} {{order_date}}
 * Customer template vars: same + {{reply_to}}
 */
const EMAILJS_PUBLIC_KEY      = "k3e_LOpxkERLpQnz1";           // "user_xxxxxxxx"
const EMAILJS_SERVICE_ID      = "service_e66tthp";           // "service_nova"
const EMAILJS_ADMIN_TEMPLATE  = "template_hi0ana5";           // "template_nova_admin"
const EMAILJS_CLIENT_TEMPLATE = "template_pbrlanl";           // "template_nova_client"
const ADMIN_EMAIL             = "energiemogador@gmail.com";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyB2RjmI_KcLc5j9mcmcyAjdCQjrBNlQjlc",
  authDomain:        "nova-9ac76.firebaseapp.com",
  projectId:         "nova-9ac76",
  databaseURL:       "https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket:     "nova-9ac76.firebasestorage.app",
  messagingSenderId: "645613145752",
  appId:             "1:645613145752:web:775e6f8ffce64ae12c4aed"
};
const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── CART ──────────────────────────────────────────────────────────────────────
function getCart() {
  try { const d=localStorage.getItem("nova_style_cart"); const c=d?JSON.parse(d):[]; return Array.isArray(c)?c:[]; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem("nova_style_cart", JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent("cartUpdated"));
  if (window.refreshCartDisplay) window.refreshCartDisplay();
}
function getCartTotal() { return getCart().reduce((s,i)=>s+(i.price||0)*(i.quantity||1),0); }
function formatPrice(p) {
  return new Intl.NumberFormat("fr-MA",{style:"currency",currency:"MAD",minimumFractionDigits:0,maximumFractionDigits:0}).format(p);
}
function addToCart(productId,product,options,qty) {
  const quantity=Math.max(1,Math.min(99,parseInt(qty)||1));
  const cart=getCart(), key=productId+"_"+JSON.stringify(options||{});
  const ex=cart.find(i=>i.key===key);
  if(ex) ex.quantity=Math.min(99,(ex.quantity||1)+quantity);
  else cart.push({key,id:productId,name:product.name,price:product.price,options:options||null,quantity,timestamp:Date.now()});
  saveCart(cart);
  console.log(`✅ Produit ajouté (×${quantity}) :`,product.name);
}
function removeFromCart(k) {
  saveCart(getCart().filter(i => {
    if (i.key) return i.key !== k;
    // Legacy items (added via product-loader before fix): match by id+axes
    const legacyKey = (i.id || '') + '_' + JSON.stringify(i.axes && Object.keys(i.axes).length ? i.axes : {});
    return legacyKey !== k;
  }));
}
function updateQuantity(k,qty) { const c=getCart(),i=c.find(x=>x.key===k); if(i){i.quantity=Math.max(1,Math.min(99,parseInt(qty)||1));saveCart(c);} }
function clearCart() { saveCart([]); }

// ── SANITISE ──────────────────────────────────────────────────────────────────
function san(s) { return typeof s==="string"?s.trim().replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\\/g,"").slice(0,500):""; }
function sanCustomer(c) {
  return { 
    name:san(c.name||""), 
    phone:san(c.phone||"").replace(/[^0-9+\s\-()]/g,""),
    city:san(c.city||""), 
    address:san(c.address||""), 
    notes:san(c.notes||"").slice(0,300), 
    email:san(c.email||"").toLowerCase().trim() // FIXED: validate and normalize email
  };
}

// ── ANTISPAM ──────────────────────────────────────────────────────────────────
function isRateLimited() {
  try { const n=Date.now(),s=JSON.parse(localStorage.getItem("nova_order_times")||"[]"); return s.filter(t=>n-t<900000).length>=3; }
  catch { return false; }
}
function recordOrderTime() {
  try { const n=Date.now(),s=JSON.parse(localStorage.getItem("nova_order_times")||"[]");
        localStorage.setItem("nova_order_times",JSON.stringify([...s.filter(t=>n-t<900000),n])); }
  catch {}
}

// ── EMAIL VALIDATION ──────────────────────────────────────────────────────────
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 100;
}

// ── EMAILJS ───────────────────────────────────────────────────────────────────
function loadEmailJS() {
  return new Promise(resolve=>{
    if(!EMAILJS_PUBLIC_KEY){resolve(false);return;}
    if(window.emailjs){resolve(true);return;}
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    s.onload=()=>{window.emailjs.init(EMAILJS_PUBLIC_KEY);resolve(true);};
    s.onerror=()=>resolve(false);
    document.head.appendChild(s);
  });
}
function itemsText(items) {
  return (items||[]).map(i=>{
    let l=`• ${i.name} ×${i.quantity||1} = ${formatPrice((i.price||0)*(i.quantity||1))}`;
    if(i.options) l+="\n  "+Object.entries(i.options).map(([k,v])=>`${k}: ${v}`).join(" | ");
    return l;
  }).join("\n");
}

/**
 * FIXED: Send two separate emails (admin + customer)
 * - Always send to admin with all details
 * - Only send to customer if email is provided and valid
 */
async function sendEmails(order,orderId) {
  const ok=await loadEmailJS(); 
  if(!ok) {
    console.warn("⚠️ EmailJS not loaded - emails will not be sent");
    return;
  }
  
  const p={
    // Standard variables
    order_id:         orderId.slice(-6).toUpperCase(),
    customer_name:    order.customer?.name    ||"—",
    customer_phone:   order.customer?.phone   ||"—",
    customer_city:    order.customer?.city    ||"—",
    customer_address: order.customer?.address ||"—",
    customer_notes:   order.customer?.notes   ||"Aucune",
    customer_email:   order.customer?.email   ||"—",
    items_html:       itemsText(order.items),
    total:            formatPrice(order.total||0),
    deposit:          formatPrice(Math.round((order.total||0)*0.5)),
    order_date:       new Date(order.timestamp).toLocaleString("fr-MA"),
    reply_to:         ADMIN_EMAIL,
    
    // Aliases in case the template uses default or simpler variable names
    id:               orderId.slice(-6).toUpperCase(),
    name:             order.customer?.name    ||"—",
    phone:            order.customer?.phone   ||"—",
    city:             order.customer?.city    ||"—",
    address:          order.customer?.address ||"—",
    notes:            order.customer?.notes   ||"Aucune",
    email:            order.customer?.email   ||"—",
    items:            itemsText(order.items),
    message:          itemsText(order.items), // Often the default text area in EmailJS
    date:             new Date(order.timestamp).toLocaleString("fr-MA"),
  };
  
  // SEND TO ADMIN (always)
  try { 
    await window.emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ADMIN_TEMPLATE,
      {...p, email:ADMIN_EMAIL}
    ); 
    console.log("✅ 📧 Email ADMIN envoyé avec succès à:", ADMIN_EMAIL); 
  }
  catch(e) { 
    console.error("❌ Erreur envoi email admin:", e.message); 
  }
  
  // SEND TO CUSTOMER (only if email provided and valid)
  const customerEmail = order.customer?.email;
  if(customerEmail && isValidEmail(customerEmail) && EMAILJS_CLIENT_TEMPLATE) {
    try { 
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CLIENT_TEMPLATE,
        {...p, email:customerEmail}
      ); 
      console.log("✅ 📧 Email CLIENT envoyé avec succès à:", customerEmail); 
    }
    catch(e) { 
      console.error("❌ Erreur envoi email client:", e.message); 
    }
  } else if(customerEmail && !isValidEmail(customerEmail)) {
    console.warn("⚠️ Email client invalide, non envoyé:", customerEmail);
  } else {
    console.log("ℹ️ Pas d'email client fourni - email client non envoyé");
  }
}

// ── CHECKOUT → FIREBASE ───────────────────────────────────────────────────────
function finalizeCheckout(customerDetails) {
  const cart=getCart();
  if(cart.length===0){alert("Votre panier est vide");return;}
  if(isRateLimited()){alert("Trop de commandes. Réessayez dans quelques minutes.");return;}
  const c=sanCustomer(customerDetails);
  if(!c.name||!c.phone||!c.city||!c.address){alert("Veuillez remplir tous les champs obligatoires.");return;}
  if(c.phone.replace(/\D/g,"").length<9){alert("Numéro de téléphone invalide.");return;}
  
  // FIXED: Email is optional but must be valid if provided
  if(c.email && !isValidEmail(c.email)){alert("Adresse email invalide (si fournie).");return;}

  const orderData={
    customer: c,
    items: cart.map(i=>({
      name:san(i.name||""),
      price:Number(i.price)||0,
      quantity:Math.max(1,Math.min(99,Number(i.quantity)||1)), // FIXED: ensure quantity is valid number
      options:i.options||null
    })),
    total: getCartTotal(), 
    status:"En attente", 
    timestamp:Date.now(),
    dateString:new Date().toLocaleString("fr-MA"), 
    source:"formulaire"
  };

  // Disable submit buttons while saving
  document.querySelectorAll(".btn-submit,[data-submit-order]").forEach(b=>{b.disabled=true;b.textContent="Envoi…";});

  const newRef=push(ref(db,"orders"));
  set(newRef,orderData)
    .then(async()=>{
      recordOrderTime();
      // FIXED: Call sendEmails with proper error handling
      try {
        await sendEmails(orderData,newRef.key);
      } catch(emailError) {
        console.error("Erreur lors de l'envoi des emails:", emailError);
        // Don't block checkout if emails fail
      }
      clearCart();
      sessionStorage.setItem("nova_confirmation_order",JSON.stringify({...orderData,id:newRef.key}));
      window.location.href="/confirmation.html";
    })
    .catch(err=>{
      document.querySelectorAll(".btn-submit,[data-submit-order]").forEach(b=>{b.disabled=false;b.textContent="Envoyer la commande";});
      alert("Erreur Firebase : "+err.message);
    });
}

// ── EXPORTS ───────────────────────────────────────────────────────────────────
window.getCart=getCart; 
window.saveCart=saveCart; 
window.addToCart=addToCart;
window.removeFromCart=removeFromCart; 
window.updateQuantity=updateQuantity;
window.clearCart=clearCart; 
window.getCartTotal=getCartTotal;
window.formatPrice=formatPrice; 
window.finalizeCheckout=finalizeCheckout;
document.dispatchEvent(new CustomEvent("cartUpdated"));
