// 🔥 IMPORTS MODERNOS
import { db } from "./firebase-config.js";
import { FirebaseServices } from "./firebase-services.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ─────────────────────────────
   🔥 OBTENER USER DESDE URL
───────────────────────────── */
const params = new URLSearchParams(window.location.search);
const STORE_USER_ID = params.get("user");

/* CONFIG DEFAULT */
const STORE_CONFIG_DEFAULT = {
  tiendaNombre: "ARG STORE",
  tiendaDescripcion: "Recarga de diamantes Free Fire instantánea",
  telefonoWhatsApp: "5492646706973",
  colorTema: "#FF6B00",
  mostrarSorteos: true,
  mostrarPromociones: false
};

let STORE_CONFIG = { ...STORE_CONFIG_DEFAULT };
let PRODUCTOS = [];
let CURRENT_USER_ID = null;

/* ─────────────────────────────
   🔥 CARGAR CONFIG
───────────────────────────── */
async function loadStoreConfig(userId) {
  try {
    if (!userId) return false;

    const snap = await getDoc(doc(db, "users", userId));

    if (snap.exists()) {
      const userData = snap.data();

      STORE_CONFIG = {
        tiendaNombre: userData.nombreTienda || STORE_CONFIG_DEFAULT.tiendaNombre,
        tiendaDescripcion: userData.descripcion || STORE_CONFIG_DEFAULT.tiendaDescripcion,
        telefonoWhatsApp: userData.telefono || STORE_CONFIG_DEFAULT.telefonoWhatsApp,
        colorTema: userData.colorTema || STORE_CONFIG_DEFAULT.colorTema,
        mostrarSorteos: userData.config?.mostrarSorteos ?? true,
        mostrarPromociones: userData.config?.mostrarPromociones ?? false,
        logoUrl: userData.logoUrl || null,
        bannerTexto: userData.bannerTexto || "",
        mensajePromo: userData.mensajePromo || ""
      };

      // 🔥 LOGO
if (STORE_CONFIG.logoUrl) {
  const logo = document.getElementById("logoImg");
  if (logo) logo.src = STORE_CONFIG.logoUrl;
}

// 🔥 BANNER
if (STORE_CONFIG.bannerTexto) {
  const banner = document.getElementById("promoBanner");
  if (banner) {
    banner.textContent = STORE_CONFIG.bannerTexto;
    banner.style.display = "block";
  }
}

// 🔥 MENSAJE PROMO
if (STORE_CONFIG.mensajePromo) {
  const promo = document.getElementById("promoMsg");
  if (promo) promo.textContent = STORE_CONFIG.mensajePromo;
}
      // 🔥 APLICAR COLOR REAL
      applyColorTheme(STORE_CONFIG.colorTema);

      // UI
      const logo = document.getElementById("logoText");
      if (logo) logo.textContent = STORE_CONFIG.tiendaNombre;

      document.title = STORE_CONFIG.tiendaNombre + " — Diamantes";

      console.log("🎨 Color aplicado:", STORE_CONFIG.colorTema);

      return true;
    }

  } catch (e) {
    console.error("❌ Error config:", e);
  }

  return false;
}

/* ─────────────────────────────
   🎨 COLOR DINÁMICO REAL (FIX)
───────────────────────────── */
function applyColorTheme(color) {

  const root = document.documentElement;

  // 🔥 IMPORTANTE → usamos tu CSS real
  root.style.setProperty("--orange", color);
  root.style.setProperty("--orange-hot", lighten(color, 15));
  root.style.setProperty("--orange-glow", color + "66");

}

/* ─────────────────────────────
   🔧 HELPER COLOR
───────────────────────────── */
function lighten(hex, percent) {
  const num = parseInt(hex.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;

  return "#" + (
    0x1000000 +
    (R<255?R<0?0:R:255)*0x10000 +
    (G<255?G<0?0:G:255)*0x100 +
    (B<255?B<0?0:B:255)
  ).toString(16).slice(1);
}

/* ─────────────────────────────
   📦 PRODUCTOS
───────────────────────────── */
async function loadProducts() {
  try {
    const result = await FirebaseServices.Product.getProducts();

    if (result.success) {
      PRODUCTOS = result.data;
      console.log("📦 Productos cargados:", PRODUCTOS);
    }

  } catch (e) {
    console.error("❌ Error productos:", e);
  }
}

/* ─────────────────────────────
   🚀 INIT STORE
───────────────────────────── */
(async () => {

  if (!STORE_USER_ID) {
    console.warn("⚠️ Abriste sin ?user=ID");
    return;
  }

  CURRENT_USER_ID = STORE_USER_ID;

  await loadStoreConfig(STORE_USER_ID);
  await loadProducts();

})();

/* ─────────────────────────────
   📤 EXPORT
───────────────────────────── */
export {
  STORE_CONFIG,
  PRODUCTOS,
  CURRENT_USER_ID
};