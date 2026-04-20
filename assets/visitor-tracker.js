import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
const firebaseConfig={apiKey:"AIzaSyB2RjmI_KcLc5j9mcmcyAjdCQjrBNlQjlc",authDomain:"nova-9ac76.firebaseapp.com",projectId:"nova-9ac76",databaseURL:"https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app",storageBucket:"nova-9ac76.firebasestorage.app",messagingSenderId:"645613145752",appId:"1:645613145752:web:775e6f8ffce64ae12c4aed"};
const app=initializeApp(firebaseConfig),db=getDatabase(app);
let vid=localStorage.getItem("nova_visitor_id");
if(!vid){vid="v_"+Math.random().toString(36).slice(2,11);localStorage.setItem("nova_visitor_id",vid);}
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
const visRef=ref(db,"online_visitors/"+sid), arrival=Date.now();
function write(){set(visRef,{visitorId:vid,sessionId:sid,page:window.location.pathname,pageLabel:pageLabel(window.location.pathname),device:getDevice(),browser:getBrowser(),referrer:getReferrer(),cartCount:getCartCount(),arrivalAt:arrival,lastSeen:Date.now(),duration:Math.round((Date.now()-arrival)/1000),screenW:screen.width}).catch(()=>{});}
write();
const hb=setInterval(write,30000);
onDisconnect(visRef).remove();
document.addEventListener("cartUpdated",write);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){write();clearInterval(hb);}});
