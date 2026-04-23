// visitor-tracker.js — uses shared Firebase app from firebase-config.js (Bug #3 fix)
import { firebaseConfig } from './firebase-config.js';
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Reuse existing Firebase app if already initialized (prevents duplicate app error)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── Visitor ID: localStorage → same person across all tabs = 1 live entry ──
let vid=localStorage.getItem("nova_visitor_id");
if(!vid){vid="v_"+Math.random().toString(36).slice(2,11);localStorage.setItem("nova_visitor_id",vid);}

// ── Session ID: sessionStorage → each tab/visit = separate session for counting ──
let sid=sessionStorage.getItem("nova_session_id");
if(!sid){sid="s_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);sessionStorage.setItem("nova_session_id",sid);}

function pageLabel(p){
  if(p==="/"||p==="") return "🏠 Accueil";
  if(p.startsWith("/produits/")) return "🪞 "+p.split("/")[2].replace(/-/g," ").slice(0,38);
  if(p.startsWith("/categorie/")) return "📂 "+p.split("/")[2].replace(/-/g," ");
  if(p.includes("cart")) return "🛒 Panier";
  if(p.includes("confirmation")) return "✅ Confirmation";
  return "📄 "+p.split("/").filter(Boolean).join(" › ").slice(0,38);
}
function getDevice(){const u=navigator.userAgent;if(/iPad/.test(u))return"Tablette";if(/Mobi|Android/.test(u))return"Mobile";return"PC";}
function getBrowser(){const u=navigator.userAgent;if(u.includes("Chrome")&&!u.includes("Edg"))return"Chrome";if(u.includes("Safari")&&!u.includes("Chrome"))return"Safari";if(u.includes("Firefox"))return"Firefox";if(u.includes("Edg"))return"Edge";return"Autre";}
function getReferrer(){const r=document.referrer;if(!r)return"Direct";if(r.includes("google"))return"Google";if(r.includes("facebook")||r.includes("fb."))return"Facebook";if(r.includes("instagram"))return"Instagram";if(r.includes("whatsapp"))return"WhatsApp";try{return new URL(r).hostname.replace("www.","");}catch{return"Autre";}}
function getCartCount(){try{const i=JSON.parse(localStorage.getItem("nova_style_cart")||"[]");return Array.isArray(i)?i.reduce((s,x)=>s+(x.quantity||1),0):0;}catch{return 0;}}

// ── IP Geolocation: cached 24h to avoid hammering the API ──
// Uses ipwho.is — free, CORS-enabled, no API key required.
async function getLocation(){
  const KEY="nova_geo_cache",TTL=86400000;
  try{
    const cached=JSON.parse(localStorage.getItem(KEY)||"null");
    if(cached&&Date.now()-cached.ts<TTL) return cached.data;
    const res=await fetch("https://ipwho.is/",{signal:AbortSignal.timeout(4000)});
    if(!res.ok) return null;
    const j=await res.json();
    if(!j.success) return null;
    const data={ip:j.ip||"",city:j.city||"",country:j.country||"",country_code:j.country_code||""};
    localStorage.setItem(KEY,JSON.stringify({ts:Date.now(),data}));
    return data;
  }catch{return null;}
}

// ── Firebase refs ──
const visRef=ref(db,"online_visitors/"+vid);
const arrival=Date.now();

async function initTracker(){
  const geo=await getLocation();

  function write(){
    const payload={
      visitorId:vid,sessionId:sid,
      page:window.location.pathname,
      pageLabel:pageLabel(window.location.pathname),
      device:getDevice(),browser:getBrowser(),referrer:getReferrer(),
      cartCount:getCartCount(),
      arrivalAt:arrival,lastSeen:Date.now(),
      duration:Math.round((Date.now()-arrival)/1000),
      screenW:screen.width,
    };
    if(geo){payload.ip=geo.ip;payload.city=geo.city;payload.country=geo.country;payload.country_code=geo.country_code;}
    set(visRef,payload).catch(()=>{});
  }

  write();
  const hb=setInterval(write,30000);
  onDisconnect(visRef).remove();
  document.addEventListener("cartUpdated",write);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){write();clearInterval(hb);}});

  // ── Session counting ──
  try{
    const today=new Date().toISOString().slice(0,10);
    const sessRef=ref(db,"sessions/"+today+"/"+sid);
    const sess={visitorId:vid,referrer:getReferrer(),device:getDevice(),startedAt:arrival};
    if(geo){sess.city=geo.city;sess.country=geo.country;sess.country_code=geo.country_code;}
    set(sessRef,sess).catch(()=>{});
  }catch{}
}

initTracker();
