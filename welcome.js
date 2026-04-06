import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 obtener userId desde URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("user");

const nombreEl = document.getElementById("nombreTienda");
const linkEl = document.getElementById("linkTienda");

let storeLink = "";

// ─────────────────────────────
// CARGAR DATA
// ─────────────────────────────
async function init() {

  if (!userId) {
    nombreEl.textContent = "Error: sin usuario";
    return;
  }

  const snap = await getDoc(doc(db, "users", userId));

  if (!snap.exists()) {
    nombreEl.textContent = "Usuario no encontrado";
    return;
  }

  const data = snap.data();

  nombreEl.textContent = data.nombreTienda;

  storeLink = `${window.location.origin}/index.html?user=${userId}`;
  linkEl.textContent = storeLink;
}

init();

// ─────────────────────────────
// BOTONES
// ─────────────────────────────
document.getElementById("copyLink").onclick = () => {
  navigator.clipboard.writeText(storeLink);
  alert("Link copiado ✅");
};

document.getElementById("goStore").onclick = () => {
  window.open(storeLink, "_blank");
};