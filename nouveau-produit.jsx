
// Nova Style — Nouveau Produit Creator
// Integrates with Firebase /catalog + generates products.json entry + PRODUCT JS
import { useState, useCallback, useMemo, useEffect } from "react";

// ─── Reference products from the 5 real product pages ───────────────────────
const REFERENCE_PRODUCTS = {
  "miroir-maroc-nova-style-miroir-anfa": {
    label: "Miroir Anfa (SDB LED)",
    axis_order: ["Dimension", "LED", "Installation"],
    axes: {
      Dimension: ["80 L x 140 H cm","80 L x 120 H cm","75 L x 130 H cm","60 L x 120 H cm","55 L x 110 H cm","50 L x 140 H cm","50 L x 100 H cm","45 L x 90 H cm"],
      LED: ["Sans LED","6000K Blanc pur","4000K blanc lumière du jour","3000K Jaune","2000k Doré"],
      Installation: ["Sans Installation","Avec Installation"]
    },
    variants: [
      {axes:{Dimension:"80 L x 140 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:1050},
      {axes:{Dimension:"80 L x 140 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:1150},
      {axes:{Dimension:"80 L x 140 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"80 L x 140 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"80 L x 140 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"80 L x 140 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"80 L x 140 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"80 L x 140 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"80 L x 140 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"80 L x 140 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"80 L x 120 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:950},
      {axes:{Dimension:"80 L x 120 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:1050},
      {axes:{Dimension:"80 L x 120 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1050},
      {axes:{Dimension:"80 L x 120 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1150},
      {axes:{Dimension:"80 L x 120 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1050},
      {axes:{Dimension:"80 L x 120 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1150},
      {axes:{Dimension:"80 L x 120 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1050},
      {axes:{Dimension:"80 L x 120 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1150},
      {axes:{Dimension:"80 L x 120 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:1050},
      {axes:{Dimension:"80 L x 120 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:1150},
      {axes:{Dimension:"75 L x 130 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:900},
      {axes:{Dimension:"75 L x 130 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:1000},
      {axes:{Dimension:"75 L x 130 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"75 L x 130 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"75 L x 130 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"75 L x 130 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"75 L x 130 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"75 L x 130 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"75 L x 130 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"75 L x 130 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"60 L x 120 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:750},
      {axes:{Dimension:"60 L x 120 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:850},
      {axes:{Dimension:"60 L x 120 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:850},
      {axes:{Dimension:"60 L x 120 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:950},
      {axes:{Dimension:"60 L x 120 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:850},
      {axes:{Dimension:"60 L x 120 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:950},
      {axes:{Dimension:"60 L x 120 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:850},
      {axes:{Dimension:"60 L x 120 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:950},
      {axes:{Dimension:"60 L x 120 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:850},
      {axes:{Dimension:"60 L x 120 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:950},
      {axes:{Dimension:"55 L x 110 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:650},
      {axes:{Dimension:"55 L x 110 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:750},
      {axes:{Dimension:"55 L x 110 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:750},
      {axes:{Dimension:"55 L x 110 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:850},
      {axes:{Dimension:"55 L x 110 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:750},
      {axes:{Dimension:"55 L x 110 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:850},
      {axes:{Dimension:"55 L x 110 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:750},
      {axes:{Dimension:"55 L x 110 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:850},
      {axes:{Dimension:"55 L x 110 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:750},
      {axes:{Dimension:"55 L x 110 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:850},
      {axes:{Dimension:"50 L x 140 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:600},
      {axes:{Dimension:"50 L x 140 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:700},
      {axes:{Dimension:"50 L x 140 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:700},
      {axes:{Dimension:"50 L x 140 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:800},
      {axes:{Dimension:"50 L x 140 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:700},
      {axes:{Dimension:"50 L x 140 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:800},
      {axes:{Dimension:"50 L x 140 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:700},
      {axes:{Dimension:"50 L x 140 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:800},
      {axes:{Dimension:"50 L x 140 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:700},
      {axes:{Dimension:"50 L x 140 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:800},
      {axes:{Dimension:"50 L x 100 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:560},
      {axes:{Dimension:"50 L x 100 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:660},
      {axes:{Dimension:"50 L x 100 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:660},
      {axes:{Dimension:"50 L x 100 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:760},
      {axes:{Dimension:"50 L x 100 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:660},
      {axes:{Dimension:"50 L x 100 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:760},
      {axes:{Dimension:"50 L x 100 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:660},
      {axes:{Dimension:"50 L x 100 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:760},
      {axes:{Dimension:"50 L x 100 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:660},
      {axes:{Dimension:"50 L x 100 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:760},
      {axes:{Dimension:"45 L x 90 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:460},
      {axes:{Dimension:"45 L x 90 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:560},
      {axes:{Dimension:"45 L x 90 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:560},
      {axes:{Dimension:"45 L x 90 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:660},
      {axes:{Dimension:"45 L x 90 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:560},
      {axes:{Dimension:"45 L x 90 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:660},
      {axes:{Dimension:"45 L x 90 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:560},
      {axes:{Dimension:"45 L x 90 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:660},
      {axes:{Dimension:"45 L x 90 H cm",LED:"2000k Doré",Installation:"Sans Installation"},price:560},
      {axes:{Dimension:"45 L x 90 H cm",LED:"2000k Doré",Installation:"Avec Installation"},price:660}
    ]
  },
  "nova-style-miroir-rectangulaire-bright": {
    label: "Rectangulaire Bright (LED)",
    axis_order: ["Dimension", "LED", "Installation"],
    axes: {
      Dimension: ["80 X 60 cm","80 X 80 cm","80 X 100 cm","120 X 80 cm","140 X 95 cm","150 X 100 cm","155 X 105 cm","160 X 110 cm","170 X 95 cm","200 X 110 cm"],
      LED: ["6000K Blanc pur","4000K blanc lumière du jour","3000K Jaune","2000K Doré"],
      Installation: ["Sans Installation","Avec Installation"]
    },
    variants: [
      {axes:{Dimension:"80 X 60 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:800},
      {axes:{Dimension:"80 X 60 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:900},
      {axes:{Dimension:"80 X 60 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:800},
      {axes:{Dimension:"80 X 60 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:900},
      {axes:{Dimension:"80 X 60 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:800},
      {axes:{Dimension:"80 X 60 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:900},
      {axes:{Dimension:"80 X 60 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:800},
      {axes:{Dimension:"80 X 60 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:900},
      {axes:{Dimension:"80 X 80 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:900},
      {axes:{Dimension:"80 X 80 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1000},
      {axes:{Dimension:"80 X 80 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:900},
      {axes:{Dimension:"80 X 80 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1000},
      {axes:{Dimension:"80 X 80 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:900},
      {axes:{Dimension:"80 X 80 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1000},
      {axes:{Dimension:"80 X 80 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:900},
      {axes:{Dimension:"80 X 80 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1000},
      {axes:{Dimension:"80 X 100 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"80 X 100 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"80 X 100 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"80 X 100 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"80 X 100 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"80 X 100 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"80 X 100 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"80 X 100 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"120 X 80 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"120 X 80 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"120 X 80 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"120 X 80 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"120 X 80 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"120 X 80 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"120 X 80 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"120 X 80 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"140 X 95 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1400},
      {axes:{Dimension:"140 X 95 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1500},
      {axes:{Dimension:"140 X 95 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1400},
      {axes:{Dimension:"140 X 95 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1500},
      {axes:{Dimension:"140 X 95 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1400},
      {axes:{Dimension:"140 X 95 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1500},
      {axes:{Dimension:"140 X 95 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1400},
      {axes:{Dimension:"140 X 95 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1500},
      {axes:{Dimension:"150 X 100 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1600},
      {axes:{Dimension:"150 X 100 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1700},
      {axes:{Dimension:"150 X 100 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1600},
      {axes:{Dimension:"150 X 100 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1700},
      {axes:{Dimension:"150 X 100 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1600},
      {axes:{Dimension:"150 X 100 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1700},
      {axes:{Dimension:"150 X 100 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1600},
      {axes:{Dimension:"150 X 100 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1700},
      {axes:{Dimension:"155 X 105 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1700},
      {axes:{Dimension:"155 X 105 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1800},
      {axes:{Dimension:"155 X 105 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1700},
      {axes:{Dimension:"155 X 105 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1800},
      {axes:{Dimension:"155 X 105 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1700},
      {axes:{Dimension:"155 X 105 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1800},
      {axes:{Dimension:"155 X 105 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1700},
      {axes:{Dimension:"155 X 105 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1800},
      {axes:{Dimension:"160 X 110 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1800},
      {axes:{Dimension:"160 X 110 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1900},
      {axes:{Dimension:"160 X 110 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1800},
      {axes:{Dimension:"160 X 110 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1900},
      {axes:{Dimension:"160 X 110 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1800},
      {axes:{Dimension:"160 X 110 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1900},
      {axes:{Dimension:"160 X 110 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1800},
      {axes:{Dimension:"160 X 110 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1900},
      {axes:{Dimension:"170 X 95 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:2000},
      {axes:{Dimension:"170 X 95 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:2100},
      {axes:{Dimension:"170 X 95 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:2000},
      {axes:{Dimension:"170 X 95 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:2100},
      {axes:{Dimension:"170 X 95 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:2000},
      {axes:{Dimension:"170 X 95 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:2100},
      {axes:{Dimension:"170 X 95 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:2000},
      {axes:{Dimension:"170 X 95 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:2100},
      {axes:{Dimension:"200 X 110 cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:2200},
      {axes:{Dimension:"200 X 110 cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:2300},
      {axes:{Dimension:"200 X 110 cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:2200},
      {axes:{Dimension:"200 X 110 cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:2300},
      {axes:{Dimension:"200 X 110 cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:2200},
      {axes:{Dimension:"200 X 110 cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:2300},
      {axes:{Dimension:"200 X 110 cm",LED:"2000K Doré",Installation:"Sans Installation"},price:2200},
      {axes:{Dimension:"200 X 110 cm",LED:"2000K Doré",Installation:"Avec Installation"},price:2300}
    ]
  },
  "nova-style-deux-miroirs-anfa-medina": {
    label: "Deux Miroirs Anfa & Medina",
    axis_order: ["Dimension", "LED", "Installation"],
    axes: {
      Dimension: ["65 L cm x 125 H cm + 60 L cm x 125 H cm","60 L x 110 H cm +55 L x 110 H cm","55 L x 115 H cm + 50 L x 115 H cm","50 L x 100 H cm + 45 L x 100 H cm"],
      LED: ["Sans LED","6000K Blanc pur","4000K blanc lumière du jour","3000K Jaune","2000K Doré"],
      Installation: ["Sans Installation","Avec Installation"]
    },
    variants: [
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:1250},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:1350},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1350},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1450},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1350},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1450},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1350},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1450},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1350},
      {axes:{Dimension:"65 L cm x 125 H cm + 60 L cm x 125 H cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1450},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:1100},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:1200},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1200},
      {axes:{Dimension:"60 L x 110 H cm +55 L x 110 H cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1300},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:1050},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:1150},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1150},
      {axes:{Dimension:"55 L x 115 H cm + 50 L x 115 H cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1250},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"Sans LED",Installation:"Sans Installation"},price:1000},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"Sans LED",Installation:"Avec Installation"},price:1100},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"6000K Blanc pur",Installation:"Sans Installation"},price:1100},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"6000K Blanc pur",Installation:"Avec Installation"},price:1200},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"4000K blanc lumière du jour",Installation:"Sans Installation"},price:1100},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"4000K blanc lumière du jour",Installation:"Avec Installation"},price:1200},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"3000K Jaune",Installation:"Sans Installation"},price:1100},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"3000K Jaune",Installation:"Avec Installation"},price:1200},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"2000K Doré",Installation:"Sans Installation"},price:1100},
      {axes:{Dimension:"50 L x 100 H cm + 45 L x 100 H cm",LED:"2000K Doré",Installation:"Avec Installation"},price:1200}
    ]
  },
  "nova-style-miroir-archway": {
    label: "Archway (Finition / Installation)",
    axis_order: ["Dimension", "Installation", "Finition"],
    axes: {
      Dimension: ["L 74 x H 170 cm","L 60x H 120 cm"],
      Installation: ["Sans Installation","Avec Installation"],
      Finition: ["Bronze","Noir"]
    },
    variants: [
      {axes:{Dimension:"L 74 x H 170 cm",Installation:"Sans Installation",Finition:"Bronze"},price:2400},
      {axes:{Dimension:"L 74 x H 170 cm",Installation:"Sans Installation",Finition:"Noir"},price:2400},
      {axes:{Dimension:"L 74 x H 170 cm",Installation:"Avec Installation",Finition:"Bronze"},price:2500},
      {axes:{Dimension:"L 74 x H 170 cm",Installation:"Avec Installation",Finition:"Noir"},price:2500},
      {axes:{Dimension:"L 60x H 120 cm",Installation:"Sans Installation",Finition:"Bronze"},price:2000},
      {axes:{Dimension:"L 60x H 120 cm",Installation:"Sans Installation",Finition:"Noir"},price:2000},
      {axes:{Dimension:"L 60x H 120 cm",Installation:"Avec Installation",Finition:"Bronze"},price:2100},
      {axes:{Dimension:"L 60x H 120 cm",Installation:"Avec Installation",Finition:"Noir"},price:2100}
    ]
  },
  "nova-style-miroir-vortex": {
    label: "Vortex (Dimension seule)",
    axis_order: ["Dimension"],
    axes: { Dimension: ["60-cm","80-cm","100-cm"] },
    variants: [
      {axes:{Dimension:"60-cm"},price:650},
      {axes:{Dimension:"80-cm"},price:1100},
      {axes:{Dimension:"100-cm"},price:1250}
    ]
  }
};

const CATEGORIES = ["Miroirs SDB Premium","Miroirs SDB Essentiel","Salon & Dressing","Consoles & Entrée","Douches Italiennes","Tables de Séjour"];
const DB = "https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app";

// Utility
const slug = (s) => s.toLowerCase().replace(/[àâä]/g,"a").replace(/[éèêë]/g,"e").replace(/[îï]/g,"i").replace(/[ôö]/g,"o").replace(/[ùûü]/g,"u").replace(/[ç]/g,"c").replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");

function generateAllVariants(axes, axis_order) {
  if (!axis_order.length) return [];
  const result = [{}];
  for (const axis of axis_order) {
    const opts = axes[axis] || [];
    const next = [];
    for (const combo of result) {
      for (const opt of opts) {
        next.push({ ...combo, [axis]: opt });
      }
    }
    result.splice(0, result.length, ...next);
  }
  return result;
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
const steps = ["Info","Copier","Axes","Prix","Exporter"];
function Stepper({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display:"flex", alignItems:"center", flex: i < steps.length-1 ? 1 : "none" }}>
          <div style={{
            width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
            background: i < current ? "#e8194b" : i === current ? "#e8194b" : "#1a1a1a",
            border: i === current ? "2px solid #e8194b" : i < current ? "2px solid #e8194b" : "2px solid #333",
            color: i <= current ? "#fff" : "#555", fontSize:12, fontWeight:800, flexShrink:0
          }}>
            {i < current ? "✓" : i+1}
          </div>
          <span style={{ marginLeft:8, fontSize:11, fontWeight:700, color: i === current ? "#fff" : i < current ? "#e8194b" : "#555", textTransform:"uppercase", letterSpacing:1, flexShrink:0 }}>{s}</span>
          {i < steps.length-1 && <div style={{ flex:1, height:2, background: i < current ? "#e8194b" : "#1e1e1e", margin:"0 12px" }} />}
        </div>
      ))}
    </div>
  );
}

// ─── STEP 1: INFO ─────────────────────────────────────────────────────────────
function StepInfo({ data, onChange, onNext }) {
  const [name, setName] = useState(data.name || "");
  const [slugVal, setSlug] = useState(data.slug || "");
  const [category, setCategory] = useState(data.category || CATEGORIES[0]);
  const [desc, setDesc] = useState(data.desc || "");
  const [seoTitle, setSeoTitle] = useState(data.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(data.seoDesc || "");
  const [imageCount, setImageCount] = useState(data.imageCount || 3);
  const [autoSlug, setAutoSlug] = useState(!data.slug);

  useEffect(() => { if (autoSlug) setSlug("nova-style-" + slug(name)); }, [name, autoSlug]);

  const valid = name.trim() && slugVal.trim();

  const next = () => {
    onChange({ name, slug: slugVal, category, desc, seoTitle, seoDesc, imageCount });
    onNext();
  };

  const inp = { background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"10px 14px", borderRadius:8, fontSize:14, outline:"none", width:"100%", fontFamily:"inherit", boxSizing:"border-box" };
  const lbl = { fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:"1.2px", fontWeight:700, marginBottom:6, display:"block" };

  return (
    <div>
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
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div>
          <label style={lbl}>Catégorie</label>
          <select style={{...inp, cursor:"pointer"}} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Nombre d'images (GitHub)</label>
          <input style={inp} type="number" min={1} max={10} value={imageCount} onChange={e => setImageCount(+e.target.value)} />
          <div style={{ fontSize:10, color:"#555", marginTop:4 }}>/assets/images/{slugVal || "slug"}/1.webp … {imageCount}.webp</div>
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Description produit</label>
        <textarea style={{...inp, minHeight:90, resize:"vertical", lineHeight:1.6}} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description affichée sur la page produit…" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        <div>
          <label style={lbl}>Titre SEO</label>
          <input style={inp} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Miroir LUNE LED salle de bain | Nova Style Maroc" />
          <div style={{ fontSize:10, color: seoTitle.length > 60 ? "#e8194b" : "#555", marginTop:4 }}>{seoTitle.length}/60 caractères</div>
        </div>
        <div>
          <label style={lbl}>Meta Description SEO</label>
          <input style={inp} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Miroir LUNE Nova Style — LED anti-buée, verre AGC Belgique…" />
          <div style={{ fontSize:10, color: seoDesc.length > 160 ? "#e8194b" : "#555", marginTop:4 }}>{seoDesc.length}/160 caractères</div>
        </div>
      </div>
      <button onClick={next} disabled={!valid} style={{ background: valid ? "#e8194b" : "#2a2a2a", color: valid ? "#fff" : "#555", border:"none", padding:"13px 32px", borderRadius:8, fontWeight:800, fontSize:14, cursor: valid ? "pointer" : "not-allowed", transition:"all .2s" }}>
        Suivant → Copier une config
      </button>
    </div>
  );
}

// ─── STEP 2: COPY CONFIG ──────────────────────────────────────────────────────
function StepCopy({ onNext, onBack }) {
  const [selected, setSelected] = useState("");
  const [preview, setPreview] = useState(null);

  const select = (key) => {
    setSelected(key);
    setPreview(REFERENCE_PRODUCTS[key]);
  };

  return (
    <div>
      <p style={{ color:"#888", fontSize:13, marginBottom:20, lineHeight:1.7 }}>
        Choisissez un produit de référence pour copier sa <strong style={{ color:"#f0f0f0" }}>configuration d'axes et de variantes</strong>.<br/>
        Vous pourrez ensuite modifier les dimensions, options et prix dans les étapes suivantes.
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12, marginBottom:20 }}>
        {Object.entries(REFERENCE_PRODUCTS).map(([key, p]) => (
          <div key={key} onClick={() => select(key)} style={{
            background: selected === key ? "#1a0a0e" : "#141414",
            border: selected === key ? "2px solid #e8194b" : "1px solid #2a2a2a",
            borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all .15s"
          }}>
            <div style={{ fontWeight:800, fontSize:13, color: selected === key ? "#e8194b" : "#e0e0e0", marginBottom:8 }}>{p.label}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
              {p.axis_order.map(a => (
                <span key={a} style={{ fontSize:10, padding:"2px 8px", background:"#1e1e1e", border:"1px solid #2a2a2a", borderRadius:4, color:"#888" }}>{a}</span>
              ))}
            </div>
            <div style={{ fontSize:11, color:"#555" }}>
              {p.variants.length} variantes · {Math.min(...p.variants.map(v=>v.price))} – {Math.max(...p.variants.map(v=>v.price))} MAD
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div style={{ background:"#0d0800", border:"1px solid #3a2000", borderRadius:10, padding:16, marginBottom:20 }}>
          <div style={{ fontWeight:700, color:"#ffb300", fontSize:12, marginBottom:10 }}>📋 Aperçu — {preview.label}</div>
          {preview.axis_order.map(axis => (
            <div key={axis} style={{ marginBottom:8 }}>
              <span style={{ fontSize:11, color:"#555", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{axis}: </span>
              <span style={{ fontSize:11, color:"#ccc" }}>{preview.axes[axis].join(" · ")}</span>
            </div>
          ))}
          <div style={{ fontSize:11, color:"#555", marginTop:8 }}>
            {preview.variants.length} variantes générées · Prix: {Math.min(...preview.variants.map(v=>v.price))} – {Math.max(...preview.variants.map(v=>v.price))} MAD
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #2a2a2a", color:"#888", padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>← Retour</button>
        <button onClick={() => onNext(selected ? REFERENCE_PRODUCTS[selected] : null)} style={{ background:"#e8194b", color:"#fff", border:"none", padding:"11px 32px", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer" }}>
          {selected ? "Copier cette config →" : "Continuer sans copier →"}
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
  const updateOption = (ax, i, val) => {
    setAxes(a => ({ ...a, [ax]: a[ax].map((v, j) => j===i ? val : v) }));
  };
  const addOption = (ax) => setAxes(a => ({ ...a, [ax]: [...a[ax], ""] }));
  const removeOption = (ax, i) => setAxes(a => ({ ...a, [ax]: a[ax].filter((_,j) => j!==i) }));

  const totalVariants = axisOrder.reduce((acc, ax) => acc * (axes[ax]?.filter(v=>v.trim()).length || 1), 1);

  const inp = { background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"8px 12px", borderRadius:6, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <p style={{ color:"#888", fontSize:13 }}>Configurez les axes de variantes (dimensions, LED, finitions…)</p>
        <div style={{ fontSize:11, color:"#444", background:"#141414", padding:"5px 12px", borderRadius:20, border:"1px solid #222" }}>
          <span style={{ color:"#e8194b", fontWeight:800 }}>{totalVariants}</span> variantes au total
        </div>
      </div>

      {axisOrder.map((ax) => (
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
        <button onClick={() => onNext({ axis_order: axisOrder, axes: Object.fromEntries(Object.entries(axes).map(([k,v]) => [k, v.filter(x=>x.trim())])) })} style={{ background:"#e8194b", color:"#fff", border:"none", padding:"11px 32px", borderRadius:8, fontWeight:800, fontSize:14, cursor:"pointer" }}>
          Suivant → Configurer les prix ({totalVariants} variantes)
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
      // Try to find matching price from copied product
      if (copied) {
        const match = copied.variants.find(v => {
          return axesConfig.axis_order.every(ax => v.axes[ax] === combo[ax]);
        });
        map[key] = match ? match.price : 0;
      } else {
        map[key] = 0;
      }
    });
    return map;
  };

  const [prices, setPrices] = useState(initPrices);
  const [pctInput, setPctInput] = useState("");
  const [filterAxis, setFilterAxis] = useState("all");
  const [filterVal, setFilterVal] = useState("all");

  const updatePrice = (key, val) => {
    const n = parseFloat(val);
    setPrices(p => ({ ...p, [key]: isNaN(n) ? 0 : n }));
  };

  const applyPct = (filter) => {
    const pct = parseFloat(pctInput);
    if (isNaN(pct)) return;
    const mult = 1 + pct / 100;
    setPrices(p => {
      const next = { ...p };
      allCombos.forEach(combo => {
        const key = JSON.stringify(combo);
        // Apply only if matches filter
        if (filter === "all" || (filterAxis !== "all" && combo[filterAxis] === filterVal)) {
          next[key] = Math.round(p[key] * mult);
        }
      });
      return next;
    });
  };

  const setAllPrices = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return;
    setPrices(p => {
      const next = { ...p };
      allCombos.forEach(combo => { next[JSON.stringify(combo)] = n; });
      return next;
    });
  };

  // Group variants by first axis for display
  const firstAxis = axesConfig.axis_order[0];
  const firstAxisVals = axesConfig.axes[firstAxis] || [];
  const otherAxes = axesConfig.axis_order.slice(1);

  const allPrices = Object.values(prices).filter(v => v > 0);
  const priceMin = allPrices.length ? Math.min(...allPrices) : 0;
  const priceMax = allPrices.length ? Math.max(...allPrices) : 0;

  const inp = { background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"7px 10px", borderRadius:6, fontSize:13, outline:"none", width:90, textAlign:"right", fontFamily:"monospace" };

  return (
    <div>
      {/* Price tools bar */}
      <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1.2, fontWeight:700, marginBottom:12 }}>🔧 Outils de prix</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"flex-end" }}>

          {/* Global % adjuster */}
          <div>
            <div style={{ fontSize:10, color:"#888", marginBottom:5 }}>Augmenter/réduire tous les prix</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"8px 12px", borderRadius:6, width:80, outline:"none", fontSize:14, fontFamily:"monospace", textAlign:"right" }}
                value={pctInput} onChange={e => setPctInput(e.target.value)} placeholder="+10" />
              <span style={{ color:"#555", fontSize:14 }}>%</span>
              <button onClick={() => applyPct("all")} style={{ background:"#e8194b", color:"#fff", border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700, fontSize:12, cursor:"pointer" }}>Appliquer à tous</button>
            </div>
          </div>

          {/* Per-axis filter */}
          {axesConfig.axis_order.length > 1 && (
            <div>
              <div style={{ fontSize:10, color:"#888", marginBottom:5 }}>Appliquer seulement à…</div>
              <div style={{ display:"flex", gap:6 }}>
                <select style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"7px 10px", borderRadius:6, fontSize:12, outline:"none", cursor:"pointer" }}
                  value={filterAxis} onChange={e => { setFilterAxis(e.target.value); setFilterVal("all"); }}>
                  <option value="all">Tous axes</option>
                  {axesConfig.axis_order.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {filterAxis !== "all" && (
                  <select style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"7px 10px", borderRadius:6, fontSize:12, outline:"none", cursor:"pointer" }}
                    value={filterVal} onChange={e => setFilterVal(e.target.value)}>
                    <option value="all">Toutes options</option>
                    {(axesConfig.axes[filterAxis] || []).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
                {filterAxis !== "all" && filterVal !== "all" && (
                  <button onClick={() => applyPct("filter")} style={{ background:"#1e1e1e", border:"1px solid #e8194b30", color:"#e8194b", padding:"7px 14px", borderRadius:6, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                    → Appliquer à {filterVal}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Set all to same price */}
          <div>
            <div style={{ fontSize:10, color:"#888", marginBottom:5 }}>Mettre tous à</div>
            <div style={{ display:"flex", gap:6 }}>
              <input id="bulk-price" style={{ background:"#111", border:"1px solid #2a2a2a", color:"#f0f0f0", padding:"8px 12px", borderRadius:6, width:80, outline:"none", fontSize:14, fontFamily:"monospace", textAlign:"right" }} placeholder="1200" />
              <span style={{ color:"#555", fontSize:14, lineHeight:"36px" }}>MAD</span>
              <button onClick={() => setAllPrices(document.getElementById("bulk-price")?.value)} style={{ background:"#1e1e1e", border:"1px solid #2a2a2a", color:"#888", padding:"8px 14px", borderRadius:6, fontSize:12, cursor:"pointer" }}>OK</button>
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginLeft:"auto", textAlign:"right" }}>
            <div style={{ fontSize:10, color:"#555" }}>Fourchette</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#e8194b" }}>{priceMin} – {priceMax} <span style={{fontSize:11, color:"#555"}}>MAD</span></div>
          </div>
        </div>
      </div>

      {/* Price table grouped by first axis */}
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
              const isNew = i === 0 || JSON.stringify(allCombos[i-1])[firstAxis] !== JSON.stringify(combo)[firstAxis];
              const showDim = i === 0 || allCombos[i-1][firstAxis] !== combo[firstAxis];
              return (
                <tr key={key} style={{ background: i % 2 === 0 ? "#111" : "#0f0f0f", borderBottom:"1px solid #1a1a1a" }}>
                  {axesConfig.axis_order.map((ax, j) => (
                    <td key={ax} style={{ padding:"8px 14px", fontSize:12, color: j===0 ? "#e0e0e0" : "#888", fontWeight: j===0 && showDim ? 700 : 400 }}>
                      {j===0 ? (showDim ? combo[ax] : <span style={{color:"#333"}}>″</span>) : combo[ax]}
                    </td>
                  ))}
                  <td style={{ padding:"6px 14px", textAlign:"right" }}>
                    <input style={inp} type="number" min={0} step={50}
                      value={prices[key] || ""}
                      onChange={e => updatePrice(key, e.target.value)}
                      placeholder="0" />
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

// ─── STEP 5: EXPORT ───────────────────────────────────────────────────────────

// ─── STEP 5: EXPORT & AUTO-PUBLISH ────────────────────────────────────────────
//
// GitHub API helpers
// ─────────────────────────────────────────────────────────────────────────────
const GH_TOKEN_KEY = "nova_gh_pat";
const GH_REPO_KEY  = "nova_gh_repo";
const GH_REPO_DEFAULT = "novastyle-main";

function getGhToken() { return localStorage.getItem(GH_TOKEN_KEY) || ""; }
function setGhToken(t){ localStorage.setItem(GH_TOKEN_KEY, t.trim()); }
function getGhRepo()  { return localStorage.getItem(GH_REPO_KEY)  || GH_REPO_DEFAULT; }
function setGhRepo(r) { localStorage.setItem(GH_REPO_KEY, r.trim()); }

// Resolve "owner/repo" from the token + supplied repo name
async function detectRepo(token, repoName) {
  const r = await fetch("https://api.github.com/user", {
    headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" }
  });
  if (!r.ok) throw new Error("Token GitHub invalide ou expiré (HTTP " + r.status + ")");
  const u = await r.json();
  const name = (repoName || "").trim() || GH_REPO_DEFAULT;
  return u.login + "/" + name;
}

// Fetch all repos accessible to the token (for auto-detect picker)
async function fetchUserRepos(token) {
  const headers = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };
  // Fine-grained tokens: /user/repos  |  Classic tokens: also works
  const r = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", { headers });
  if (!r.ok) throw new Error("Impossible de lister les dépôts (HTTP " + r.status + ")");
  const repos = await r.json();
  return repos.map(repo => repo.full_name); // "owner/repo"
}

// Commit (create or update) a single file via GitHub Contents API
async function ghCommit(token, repo, path, content, message) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  // GET current SHA (needed to update an existing file)
  let sha = undefined;
  const getRes = await fetch(url, { headers });
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  } else if (getRes.status !== 404) {
    throw new Error(`Lecture ${path} échouée (HTTP ${getRes.status})`);
  }

  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))), // UTF-8 → base64
    ...(sha ? { sha } : {})
  };

  const putRes = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(`Commit ${path} échoué (HTTP ${putRes.status}): ${err.message || ""}`);
  }
  return putRes.json();
}

// ② Read → patch → write products.json
async function commitProductsJson(token, repo, entry) {
  const url = `https://api.github.com/repos/${repo}/contents/products.json`;
  const headers = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };

  const getRes = await fetch(url, { headers });
  if (!getRes.ok) throw new Error(`Lecture products.json échouée (HTTP ${getRes.status})`);
  const file = await getRes.json();
  const existing = JSON.parse(decodeURIComponent(escape(atob(file.content.replace(/\n/g, "")))));

  // Remove stale entry with same id, then append fresh one
  existing.products = existing.products.filter(p => (p.id || p.slug) !== entry.id);
  existing.products.push(entry);

  await ghCommit(
    token, repo, "products.json",
    JSON.stringify(existing, null, 2),
    `produit: ajouter ${entry.id} dans products.json`
  );
}

// Build product-page HTML — full template with all values injected
function buildProductPage(info, axesConfig, variants, priceMin, priceMax) {
  const title   = info.seoTitle  || info.name;
  const desc    = info.seoDesc   || "";
  const slug    = info.slug;
  const name    = info.name;
  const imgArr  = Array.from({ length: info.imageCount }, (_, i) => `/assets/images/${slug}/${i+1}.webp`);
  const productJS = JSON.stringify({
    title: name,
    variants,
    axis_order: axesConfig.axis_order,
    axes: axesConfig.axes,
    price_min: priceMin === Infinity  ? 0 : priceMin,
    price_max: priceMax === -Infinity ? 0 : priceMax
  }, null, 2);

  const galleryMain = `<img id="main-img" src="${imgArr[0]}" alt="${name}">`;
  const thumbsHTML  = imgArr.map((src,i) =>
    `<img src="${src}" alt="${name}" onclick="document.getElementById('main-img').src=this.src"${i===0?' class="active"':''}>`
  ).join("");
  const schemaImages = JSON.stringify(imgArr);
  const featuresHTML = `<li>Verre AGC Belgique 6mm</li><li>Traitement anti-buée et anticorrosion</li><li>Garantie 3 ans contre la corrosion</li><li>Fabrication sur mesure à Casablanca</li><li>Livraison partout au Maroc</li>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Miroir Salle de Bain Maroc · Nova Style</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow">
<meta name="author" content="Nova Style">
<meta name="geo.region" content="MA-06">
<meta name="geo.placename" content="Casablanca">
<meta name="geo.position" content="33.5731;-7.5898">
<meta name="ICBM" content="33.5731, -7.5898">
<link rel="canonical" href="https://novastyle.ma/produits/${slug}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${title} | Miroir Salle de Bain Maroc · Nova Style">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://novastyle.ma/produits/${slug}/">
<meta property="og:locale" content="fr_MA">
<meta property="og:image" content="${imgArr[0]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title} | Nova Style">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imgArr[0]}">
<link rel="icon" type="image/png" href="/assets/logo.png">
<link rel="stylesheet" href="/assets/style.css">
<link rel="preconnect" href="https://nova-9ac76-default-rtdb.europe-west1.firebasedatabase.app" crossorigin>
<link rel="preconnect" href="https://www.gstatic.com" crossorigin>
</head>
<body>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"${title}","description":"${desc.replace(/"/g,'\\"')}","image":${schemaImages},"brand":{"@type":"Brand","name":"Nova Style"},"sku":"${slug}"}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://novastyle.ma/"},{"@type":"ListItem","position":2,"name":"Miroirs","item":"https://novastyle.ma/miroir-salle-de-bain/"},{"@type":"ListItem","position":3,"name":"${title}"}]}</script>

<script src="/assets/header.js" defer></script>

<nav class="breadcrumb"><a href="/">Accueil</a> › <a href="/miroir-salle-de-bain/">Miroirs</a> › <span>${title}</span></nav>

<article class="product-page">
<div class="product-gallery">
  ${galleryMain}
  <div class="thumbs">${thumbsHTML}</div>
</div>
<div class="product-info">
  <h1>${title}</h1>
  <p class="p-subtitle">Miroir sur mesure · Fabrication Casablanca · Livraison Maroc</p>
  <div class="p-price" id="current-price"></div>
  <div id="axes-container"></div>
  <div class="p-cta">
    <button class="btn-primary" id="add-to-cart-btn" onclick="addProductToCart()">🛒 Ajouter au panier</button>
    <a class="btn-secondary" href="/cart">Voir panier</a>
  </div>
  <div class="deposit-note">💡 Acompte de 50% requis pour confirmer la commande. Solde à la livraison ou installation.</div>
</div>
</article>

<section class="product-content">
  <h2>Présentation du ${title}</h2>
  <div class="p-desc"><p>${info.desc || ""}</p></div>
  <h2>Caractéristiques techniques</h2>
  <ul class="caracts">${featuresHTML}</ul>
  <h2>Installation et livraison au Maroc</h2>
  <p>Le <strong>${title}</strong> est fabriqué dans notre atelier de Casablanca puis livré partout au Maroc. L'installation est disponible en option à Casablanca et sa région.</p>
  <p>Pour les autres villes — Rabat, Marrakech, Tanger, Fès, Agadir — le miroir est livré avec toutes les fixations nécessaires. Délai : 5 à 10 jours ouvrables.</p>
</section>

<section class="reviews-section">
  <ns-reviews-widget></ns-reviews-widget>
  <script type="module" src="/assets/reviews-widget.js"></script>
</section>

<section class="related">
  <h2>Produits similaires</h2>
  <div class="grid" id="related-grid"></div>
  <script>
  fetch('/products.json').then(r=>r.json()).then(d=>{
    var prods = (d.products||[]).filter(p=>p.category==="${info.category}"&&(p.id||p.slug)!=="${slug}").slice(0,4);
    document.getElementById('related-grid').innerHTML = prods.map(function(p,i){
      var img = p.image || '/assets/images/'+(p.id||p.slug)+'/1.webp';
      var priceObj = p.price; var priceLabel = '';
      if(priceObj && typeof priceObj==='object') priceLabel = priceObj.min ? 'À partir de '+priceObj.min.toLocaleString('fr-MA')+' MAD' : '';
      else if(priceObj) priceLabel = 'À partir de '+Number(priceObj).toLocaleString('fr-MA')+' MAD';
      return '<a class="product-card" href="/produits/'+(p.id||p.slug)+'/">'
        +'<div class="card-img"><img src="'+img+'" alt="'+p.name+'" loading="'+(i===0?'eager':'lazy')+'"></div>'
        +'<div class="card-info"><div class="card-name">'+p.name+'</div>'
        +(priceLabel?'<div class="card-price">'+priceLabel+'</div>':'')
        +'</div></a>';
    }).join('');
  }).catch(()=>{});
  </script>
</section>

<script src="/assets/footer.js" defer></script>
<script type="module" src="/assets/cart.js"></script>
<script>
const PRODUCT = ${productJS};
const WHATSAPP = "212707074748";
let SELECTION = {};

function fmtPrice(v){ return v==null?"":Math.round(v).toLocaleString('fr-FR')+" MAD"; }
function priceRange(){
  if(!PRODUCT.price_min) return "";
  if(PRODUCT.price_min===PRODUCT.price_max||!PRODUCT.price_max) return fmtPrice(PRODUCT.price_min);
  return fmtPrice(PRODUCT.price_min)+" – "+fmtPrice(PRODUCT.price_max);
}
function getVariant(){
  return PRODUCT.variants.find(v=>
    PRODUCT.axis_order.every(a=>v.axes[a]===SELECTION[a])
  );
}
function hasVariant(axis,val){
  return PRODUCT.variants.some(v=>
    v.axes[axis]===val&&PRODUCT.axis_order.filter(a=>a!==axis).every(a=>v.axes[a]===SELECTION[a])
  );
}
function renderAxes(){
  var c=document.getElementById("axes-container");
  if(!c) return;
  c.innerHTML=PRODUCT.axis_order.map(function(axis){
    var opts=PRODUCT.axes[axis]||[];
    return '<div class="axis-group" style="margin-bottom:14px">'
      +'<div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">'+axis+'</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:8px">'+opts.map(function(opt){
        var active=SELECTION[axis]===opt;
        var avail=hasVariant(axis,opt);
        return '<button onclick="SELECTION[\''+axis.replace(/'/g,"\\'")+'\']=\''+opt.replace(/'/g,"\\'")+'\';renderAxes();updatePrice();" '
          +'style="padding:7px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:'+(avail?'pointer':'not-allowed')+';'
          +'border:1px solid '+(active?'#e8194b':'#2a2a2a')+';'
          +'background:'+(active?'#e8194b20':'#1a1a1a')+';'
          +'color:'+(active?'#e8194b':avail?'#ccc':'#444')+';'
          +'opacity:'+(avail?1:0.4)+'">'+opt+'</button>';
      }).join('')+'</div></div>';
  }).join('');
}
function updatePrice(){
  var v=getVariant();
  var el=document.getElementById("current-price");
  if(el) el.textContent=v&&v.price?fmtPrice(v.price):priceRange();
}
for(var axis of PRODUCT.axis_order){
  if(PRODUCT.axes[axis]&&PRODUCT.axes[axis].length) SELECTION[axis]=PRODUCT.axes[axis][0];
}
renderAxes(); updatePrice();

window.addProductToCart=function(){
  var v=getVariant();
  if(PRODUCT.axis_order.length&&!v){alert("Veuillez sélectionner toutes les options.");return;}
  var item={id:"${slug}",name:PRODUCT.title,price:v?v.price:PRODUCT.price_min,axes:Object.assign({},SELECTION),image:"${imgArr[0]}",quantity:1};
  var cart=JSON.parse(localStorage.getItem("nova_style_cart")||"[]");
  var key=JSON.stringify({id:item.id,axes:item.axes});
  var idx=cart.findIndex(function(c){return JSON.stringify({id:c.id,axes:c.axes})===key;});
  if(idx>=0) cart[idx].quantity=(cart[idx].quantity||1)+1;
  else cart.push(item);
  localStorage.setItem("nova_style_cart",JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent("cartUpdated"));
  var btn=document.getElementById("add-to-cart-btn");
  if(btn){btn.textContent="✓ Ajouté !";setTimeout(function(){btn.textContent="🛒 Ajouter au panier";},1800);}
};
</script>
<script type="module" src="/assets/visitor-tracker.js"></script>
</body></html>`;
}

// ─── StepExport component ─────────────────────────────────────────────────────
function StepExport({ info, axesConfig, prices, allCombos, onBack }) {
  const [ghToken,  setGhTokenState] = useState(getGhToken);
  const [ghRepo,   setGhRepoState]  = useState(getGhRepo);
  const [tokenSaved, setTokenSaved] = useState(!!getGhToken());
  const [repoList,   setRepoList]   = useState([]);
  const [detecting,  setDetecting]  = useState(false);

  // Per-action status: "idle" | "running" | "done" | "error"
  const [status, setStatus] = useState({
    firebase: "idle",
    productsJson: "idle",
    productPage: "idle",
    imageFolder: "idle"
  });
  const [errors,  setErrors]  = useState({});
  const [allDone, setAllDone] = useState(false);

  const variants = allCombos.map(combo => ({
    axes: combo,
    price: prices[JSON.stringify(combo)] || 0,
    sku: ""
  }));
  const priceMin = Math.min(...variants.map(v=>v.price).filter(p=>p>0), Infinity);
  const priceMax = Math.max(...variants.map(v=>v.price).filter(p=>p>0), -Infinity);
  const safeMin  = priceMin === Infinity  ? 0 : priceMin;
  const safeMax  = priceMax === -Infinity ? 0 : priceMax;

  const catalogEntry = JSON.stringify({
    title: info.name,
    slug: info.slug,
    category: info.category,
    active: true,
    images: Array.from({ length: info.imageCount }, (_,i) => `/assets/images/${info.slug}/${i+1}.webp`),
    price_min: safeMin,
    price_max: safeMax,
    axis_order: axesConfig.axis_order,
    axes: axesConfig.axes,
    variants,
    description: info.desc,
    seo: { title: info.seoTitle || info.name, description: info.seoDesc }
  }, null, 2);

  const productsFeedEntry = {
    id: info.slug,
    name: info.name,
    price: { min: safeMin, max: safeMax },
    category: info.category,
    image: `/assets/images/${info.slug}/1.webp`
  };

  const setSt  = (key, val) => setStatus(s => ({ ...s, [key]: val }));
  const setErr = (key, msg) => setErrors(e  => ({ ...e, [key]: msg }));

  const handleSaveToken = () => {
    setGhToken(ghToken);
    setGhRepo(ghRepo);
    setTokenSaved(true);
  };

  const handleDetectRepos = async () => {
    if (!ghToken.trim()) { alert("Entrez votre token GitHub d'abord."); return; }
    setDetecting(true);
    setRepoList([]);
    try {
      const repos = await fetchUserRepos(ghToken);
      setRepoList(repos);
    } catch(e) {
      alert("Erreur: " + e.message);
    } finally {
      setDetecting(false);
    }
  };

  const handlePickRepo = (fullName) => {
    const repoName = fullName.split("/")[1];
    setGhRepoState(repoName);
    setGhRepo(repoName);
    setTokenSaved(false);
    setRepoList([]);
  };

  const handlePublish = async () => {
    if (!ghToken.trim()) { alert("Entrez votre token GitHub d'abord."); return; }
    setStatus({ firebase:"running", productsJson:"idle", productPage:"idle", imageFolder:"idle" });
    setErrors({});
    setAllDone(false);

    let repo = "";
    // ① Firebase
    try {
      const fbAuth = window.__NOVA_FIREBASE__?.auth;
      const currentUser = fbAuth?.currentUser;
      if (!currentUser) throw new Error("Non authentifié — reconnectez-vous.");
      const token = await currentUser.getIdToken();
      const res = await fetch(`${DB}/catalog/${info.slug}.json?auth=${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: catalogEntry
      });
      if (!res.ok) throw new Error(`Firebase HTTP ${res.status}`);
      setSt("firebase", "done");
    } catch(e) {
      setSt("firebase", "error");
      setErr("firebase", e.message);
      // Don't abort — continue with GitHub steps
    }

    // Resolve repo owner once
    setSt("productsJson", "running");
    try {
      repo = await detectRepo(ghToken, ghRepo);
    } catch(e) {
      // Mark all GitHub steps as errored
      ["productsJson","productPage","imageFolder"].forEach(k => {
        setSt(k, "error");
        setErr(k, e.message);
      });
      return;
    }

    // ② products.json
    try {
      await commitProductsJson(ghToken, repo, productsFeedEntry);
      setSt("productsJson", "done");
    } catch(e) {
      setSt("productsJson", "error");
      setErr("productsJson", e.message);
    }

    // ③ Product page
    setSt("productPage", "running");
    try {
      const pageHTML = buildProductPage(info, axesConfig, variants, priceMin, priceMax);
      await ghCommit(
        ghToken, repo,
        `produits/${info.slug}/index.html`,
        pageHTML,
        `produit: créer page ${info.slug}`
      );
      setSt("productPage", "done");
    } catch(e) {
      setSt("productPage", "error");
      setErr("productPage", e.message);
    }

    // ④ Image folder placeholder
    setSt("imageFolder", "running");
    try {
      await ghCommit(
        ghToken, repo,
        `assets/images/${info.slug}/.gitkeep`,
        "",
        `produit: créer dossier images ${info.slug}`
      );
      setSt("imageFolder", "done");
    } catch(e) {
      setSt("imageFolder", "error");
      setErr("imageFolder", e.message);
    }

    setAllDone(true);
  };

  const Step = ({ id, icon, label, sub }) => {
    const st  = status[id];
    const err = errors[id];
    const colors = { idle:"#333", running:"#ffb300", done:"#00c853", error:"#e8194b" };
    const icons  = { idle:"○", running:"⏳", done:"✅", error:"❌" };
    return (
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
        <span style={{ fontSize:18, width:22, textAlign:"center", flexShrink:0 }}>{icons[st]}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color: st === "idle" ? "#666" : colors[st] }}>{icon} {label}</div>
          <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{sub}</div>
          {err && <div style={{ fontSize:11, color:"#e8194b", marginTop:4, fontFamily:"monospace" }}>↳ {err}</div>}
        </div>
        {st === "running" && <div style={{ fontSize:11, color:"#ffb300", flexShrink:0, marginTop:3 }}>En cours…</div>}
        {st === "done"    && <div style={{ fontSize:11, color:"#00c853", flexShrink:0, marginTop:3 }}>✓</div>}
      </div>
    );
  };

  const allRunning = Object.values(status).some(s => s === "running");
  const hasStarted = Object.values(status).some(s => s !== "idle");
  const boxStyle   = { background:"#0a0a0a", border:"1px solid #1e1e1e", borderRadius:8, padding:"12px 14px",
    fontFamily:"'Courier New',monospace", fontSize:11, color:"#7ec8e3", lineHeight:1.6,
    maxHeight:160, overflowY:"auto", whiteSpace:"pre", marginTop:8 };

  return (
    <div>
      {/* Summary */}
      <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[["Produit", info.name],["Variantes", variants.length],
            ["Prix min", safeMin ? safeMin + " MAD" : "—"],
            ["Prix max", safeMax ? safeMax + " MAD" : "—"]
          ].map(([l,v]) => (
            <div key={l}>
              <div style={{ fontSize:9, color:"#444", textTransform:"uppercase", letterSpacing:1.5, fontWeight:700 }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:800, color:"#e8194b", marginTop:3 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Token + Repo */}
      <div style={{ background:"#0d0d14", border:"1px solid #1e2a3a", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ fontWeight:800, fontSize:13, color:"#4da6ff", marginBottom:8 }}>🔑 Configuration GitHub</div>

        {/* Token */}
        <div style={{ fontSize:10, color:"#3a3a5a", marginBottom:4, textTransform:"uppercase", letterSpacing:1.5, fontWeight:700 }}>Token personnel</div>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={ghToken}
            onChange={e => { setGhTokenState(e.target.value); setTokenSaved(false); setRepoList([]); }}
            style={{ flex:1, background:"#111", border:"1px solid #2a2a2a", color:"#e0e0e0",
              padding:"9px 12px", borderRadius:6, fontFamily:"monospace", fontSize:12, outline:"none" }}
          />
        </div>

        {/* Repo name + auto-detect */}
        <div style={{ fontSize:10, color:"#3a3a5a", marginBottom:4, textTransform:"uppercase", letterSpacing:1.5, fontWeight:700 }}>Nom du dépôt GitHub</div>
        <div style={{ display:"flex", gap:8, marginBottom: repoList.length ? 8 : 12 }}>
          <input
            type="text"
            placeholder="novastyle-main"
            value={ghRepo}
            onChange={e => { setGhRepoState(e.target.value); setTokenSaved(false); }}
            style={{ flex:1, background:"#111", border:"1px solid #2a2a2a", color:"#e0e0e0",
              padding:"9px 12px", borderRadius:6, fontFamily:"monospace", fontSize:12, outline:"none" }}
          />
          <button onClick={handleDetectRepos} disabled={detecting}
            style={{ background:"#1a1a2e", border:"1px solid #4da6ff44", color: detecting ? "#555" : "#4da6ff",
              padding:"9px 14px", borderRadius:6, fontSize:11, fontWeight:700, cursor: detecting ? "not-allowed" : "pointer", whiteSpace:"nowrap" }}>
            {detecting ? "⏳ Chargement…" : "🔍 Détecter"}
          </button>
          <button onClick={handleSaveToken}
            style={{ background: tokenSaved ? "#091509" : "#1e1e1e",
              border: tokenSaved ? "1px solid #00c85340" : "1px solid #2a2a2a",
              color: tokenSaved ? "#00c853" : "#888",
              padding:"9px 16px", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {tokenSaved ? "✓ Sauvé" : "Sauvegarder"}
          </button>
        </div>

        {/* Repo picker dropdown */}
        {repoList.length > 0 && (
          <div style={{ background:"#111", border:"1px solid #2a2a2a", borderRadius:6, marginBottom:12, maxHeight:180, overflowY:"auto" }}>
            <div style={{ fontSize:10, color:"#555", padding:"6px 12px", borderBottom:"1px solid #1e1e1e", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>
              {repoList.length} dépôt{repoList.length > 1 ? "s" : ""} trouvé{repoList.length > 1 ? "s" : ""} — cliquez pour sélectionner
            </div>
            {repoList.map(fullName => (
              <div key={fullName} onClick={() => handlePickRepo(fullName)}
                style={{ padding:"9px 12px", fontSize:12, color: fullName.endsWith("/" + ghRepo) ? "#00c853" : "#ccc",
                  background: fullName.endsWith("/" + ghRepo) ? "#091509" : "transparent",
                  borderBottom:"1px solid #1a1a1a", cursor:"pointer", fontFamily:"monospace",
                  transition:"background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background = fullName.endsWith("/" + ghRepo) ? "#0b1e0b" : "#1a1a1a"}
                onMouseLeave={e => e.currentTarget.style.background = fullName.endsWith("/" + ghRepo) ? "#091509" : "transparent"}>
                {fullName.endsWith("/" + ghRepo) ? "✓ " : ""}{fullName}
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize:10, color:"#444", marginTop:4 }}>
          💡 Token → github.com › Settings › Developer settings › Fine-grained tokens › Contents: Read &amp; Write &nbsp;|&nbsp;
          Cliquez <strong style={{color:"#4da6ff"}}>Détecter</strong> pour lister vos dépôts automatiquement.
        </div>
      </div>

      {/* Action steps */}
      <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ fontWeight:800, fontSize:13, color:"#f0f0f0", marginBottom:12 }}>🚀 Publication automatique</div>
        <Step id="firebase"     icon="🔥" label="Enregistrer dans Firebase /catalog"    sub={`Rend le produit accessible immédiatement · catalog/${info.slug}`} />
        <Step id="productsJson" icon="📄" label="Mettre à jour products.json"           sub="Ajoute l'entrée dans le tableau — les pages catégories se mettent à jour automatiquement" />
        <Step id="productPage"  icon="🌐" label={`Créer produits/${info.slug}/index.html`} sub="Page produit complète avec SEO, variantes, galerie, avis, related products" />
        <Step id="imageFolder"  icon="🗂️" label={`Créer assets/images/${info.slug}/`}   sub="Dossier prêt pour l'upload des images (1.webp, 2.webp…)" />

        {allDone && (
          <div style={{ marginTop:14, padding:"12px 14px", background:"#091509", border:"1px solid #00c85340", borderRadius:8 }}>
            <div style={{ fontWeight:800, color:"#00c853", marginBottom:6 }}>✅ Terminé — GitHub Pages reconstruit en ~60 secondes</div>
            <div style={{ fontSize:11, color:"#666", lineHeight:1.7 }}>
              ① Uploadez les images dans <code style={{color:"#ccc"}}>assets/images/{info.slug}/</code> sur GitHub<br/>
              ② La page sera live sur <code style={{color:"#ccc"}}>novastyle.ma/produits/{info.slug}/</code>
            </div>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
          <button
            onClick={handlePublish}
            disabled={allRunning || (allDone && Object.values(status).every(s => s === "done"))}
            style={{ background: allDone ? "#00c853" : "#e8194b", color:"#fff", border:"none",
              padding:"12px 28px", borderRadius:8, fontWeight:800, fontSize:14,
              cursor: allRunning ? "not-allowed" : "pointer",
              opacity: allRunning ? 0.6 : 1 }}>
            {allRunning ? "⏳ Publication en cours…" : allDone ? "✓ Publié" : "🚀 Publier le produit"}
          </button>
        </div>
      </div>

      {/* Collapsible: Firebase catalog JSON for reference */}
      <details style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:12, padding:16, marginBottom:20 }}>
        <summary style={{ fontWeight:700, fontSize:12, color:"#555", cursor:"pointer" }}>
          ▸ Voir le JSON Firebase (référence)
        </summary>
        <div style={boxStyle}>{catalogEntry.substring(0,600)}…</div>
      </details>

      <div style={{ display:"flex", gap:12, marginTop:8 }}>
        <button onClick={onBack}
          style={{ background:"none", border:"1px solid #2a2a2a", color:"#888",
            padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>← Retour</button>
        <button onClick={() => window.location.reload()}
          style={{ background:"#141414", border:"1px solid #e8194b30", color:"#e8194b",
            padding:"11px 24px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>
          + Nouveau produit
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({});
  const [copied, setCopied] = useState(null);
  const [axesConfig, setAxesConfig] = useState(null);
  const [prices, setPrices] = useState(null);
  const [allCombos, setAllCombos] = useState(null);

  return (
    <div style={{ background:"#0f0f0f", minHeight:"100vh", color:"#f0f0f0", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding:"0 0 60px" }}>
      {/* Header */}
      <div style={{ background:"#141414", borderBottom:"2px solid #e8194b", padding:"14px 24px", display:"flex", alignItems:"center", gap:16, marginBottom:32 }}>
        <span style={{ fontSize:20, fontWeight:900, color:"#e8194b", letterSpacing:-1 }}>NOVA STYLE</span>
        <span style={{ fontSize:10, color:"#333", letterSpacing:3, textTransform:"uppercase", marginTop:2 }}>Nouveau Produit</span>
        <div style={{ marginLeft:"auto", fontSize:11, color:"#555", background:"#111", padding:"4px 12px", borderRadius:12, border:"1px solid #1e1e1e" }}>
          Étape {step+1} / {steps.length}
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 24px" }}>
        <Stepper current={step} />

        {step === 0 && <StepInfo data={info} onChange={setInfo} onNext={() => setStep(1)} />}
        {step === 1 && <StepCopy onBack={() => setStep(0)} onNext={(ref) => { setCopied(ref); setStep(2); }} />}
        {step === 2 && <StepAxes copied={copied} onBack={() => setStep(1)} onNext={(cfg) => { setAxesConfig(cfg); setStep(3); }} />}
        {step === 3 && <StepPrix axesConfig={axesConfig} copied={copied} onBack={() => setStep(2)} onNext={(p, combos) => { setPrices(p); setAllCombos(combos); setStep(4); }} />}
        {step === 4 && <StepExport info={info} axesConfig={axesConfig} prices={prices} allCombos={allCombos} onBack={() => setStep(3)} />}
      </div>
    </div>
  );
}
