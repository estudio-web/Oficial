import { auth } from "./firebase-config.js";
import { FirebaseServices } from "./firebase-services.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;
let allOrders = [];
let currentTab = "dashboard";

// ─────────────────────────────
// TABS
// ─────────────────────────────
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    currentTab = tab;

    document.querySelectorAll(".tab-content").forEach(t => t.classList.add("hidden"));
    document.getElementById(tab + "-tab").classList.remove("hidden");

    document.getElementById("pageTitle").textContent =
      tab.charAt(0).toUpperCase() + tab.slice(1);
  });
});

// ─────────────────────────────
// AUTH
// ─────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  userName.textContent = user.email;

  await loadConfig();
  await loadDashboard();
  await loadProductos();
  await loadPedidos();
});

// ─────────────────────────────
// 🔥 DASHBOARD REAL
// ─────────────────────────────
async function loadDashboard() {
  const result = await FirebaseServices.Order.getUserOrders(currentUser.uid);
  if (!result.success) return;

  const orders = result.data;

  totalVentas.textContent = orders.length;
  totalIngresos.textContent = "$" + orders.reduce((a,b)=>a+b.total,0);

  const pendientes = orders.filter(o => o.estado === "pendiente").length;
  const entregados = orders.filter(o => o.estado === "entregado").length;

  document.getElementById("totalPendientes").textContent = pendientes;
  document.getElementById("totalEntregados").textContent = entregados;

  // últimos pedidos
  document.getElementById("recentOrdersList").innerHTML = orders.slice(0,5).map(o => `
    <div class="order-row">
      <span>${o.nombreCliente}</span>
      <span>$${o.total}</span>
      <span class="badge ${o.estado}">${o.estado}</span>
    </div>
  `).join("");
}



// ─────────────────────────────
// PRODUCTOS
// ─────────────────────────────
async function loadProductos() {
  const result = await FirebaseServices.Product.getProducts();
  if (!result.success) return;

  productosList.innerHTML = result.data.map(p => `
    <div style="border:1px solid #333;padding:10px;margin:5px">
      ${p.diamantes} 💎 - $${p.precioBase}
      <button onclick="deleteProducto('${p.id}')">❌</button>
    </div>
  `).join("");
}

// ➕ AGREGAR
addProducto.addEventListener("click", async () => {

  const diamantes = parseInt(prodDiamantes.value);
  const precio = parseInt(prodPrecio.value);

  if (!diamantes || !precio) return alert("Completar campos");

  const result = await FirebaseServices.Product.createProduct({
    diamantes,
    precioBase: precio,
    activo: true
  });

  if (result.success) {
    prodDiamantes.value = "";
    prodPrecio.value = "";
    loadProductos();
  }
});

// ❌ BORRAR
window.deleteProducto = async (id) => {
  await FirebaseServices.Product.deleteProduct(id);
  loadProductos();
};

// ─────────────────────────────
// 🔥 PEDIDOS + ESTADOS + BOTONES
// ─────────────────────────────
async function loadPedidos() {
  const result = await FirebaseServices.Order.getUserOrders(currentUser.uid);

  if (result.success) {
    allOrders = result.data;

    renderPedidos(allOrders);
  }
}

function renderPedidos(orders) {
  pedidosList.innerHTML = orders.map(o => `
    <div style="border-bottom:1px solid #333;padding:10px">
      <strong>${o.nombreCliente}</strong> - $${o.total}
      
      <div style="margin-top:5px">
        <span class="badge ${o.estado}">${o.estado}</span>
      </div>

      <div style="margin-top:10px">
        ${o.estado === "pendiente" ? `<button onclick="updateEstado('${o.id}','pagado')">💳 Marcar Pagado</button>` : ""}
        ${o.estado === "pagado" ? `<button onclick="updateEstado('${o.id}','entregado')">📦 Entregar</button>` : ""}
        <button onclick="updateEstado('${o.id}','cancelado')">❌ Cancelar</button>
      </div>
    </div>
  `).join("");
}

// 🔥 UPDATE ESTADO
window.updateEstado = async (id, estado) => {
  await FirebaseServices.Order.updateOrderStatus(id, estado);
  loadPedidos();
  loadDashboard();
};

// ─────────────────────────────
// 🔥 CONFIGURACIÓN (FIX TOTAL)
// ─────────────────────────────
async function loadConfig() {
  const res = await FirebaseServices.User.getUserProfile(currentUser.uid);

  if (!res.success || !res.data) return;

  const data = res.data;

  nombreTienda.value = data.nombreTienda || "";
  descripcion.value = data.descripcion || "";
  telefonoWA.value = data.telefono || "";

  colorTema.value = data.colorTema || "#FF6B00";
  colorValue.textContent = colorTema.value;

  mostrarSorteos.checked = data.config?.mostrarSorteos ?? true;
  mostrarPromociones.checked = data.config?.mostrarPromociones ?? false;
}

// 🔥 COLOR PICKER FIX
colorTema.addEventListener("input", () => {
  colorValue.textContent = colorTema.value;
});

// 🔥 GUARDAR CONFIG
saveConfig.addEventListener("click", async () => {

  const updates = {
    nombreTienda: nombreTienda.value,
    descripcion: descripcion.value,
    telefono: telefonoWA.value,
    colorTema: colorTema.value,
    config: {
      mostrarSorteos: mostrarSorteos.checked,
      mostrarPromociones: mostrarPromociones.checked
    }
  };

  const res = await FirebaseServices.User.updateUserProfile(currentUser.uid, updates);

  if (res.success) {
    alert("Configuración guardada ✅");
  }
});

// 🔥 GUARDAR PERSONALIZACIÓN
document.getElementById("saveExtras").addEventListener("click", async () => {

  const bannerTexto = document.getElementById("bannerTexto").value;
  const mensajePromo = document.getElementById("mensajePromo").value;
  const file = document.getElementById("logoInput").files[0];

  let logoUrl = null;

  // 🔥 SUBIR LOGO
  if (file) {
    const storageRef = FirebaseServices.storage.ref();
    const ref = storageRef.child("logos/" + currentUser.uid);

    await ref.put(file);
    logoUrl = await ref.getDownloadURL();
  }

  const updates = {
    bannerTexto,
    mensajePromo
  };

  if (logoUrl) updates.logoUrl = logoUrl;

  const res = await FirebaseServices.User.updateUserProfile(currentUser.uid, updates);

  if (res.success) {
    alert("Personalización guardada ✅");
  }
});

// ─────────────────────────────
// LOGOUT
// ─────────────────────────────
logoutAdmin.onclick = async () => {
  await FirebaseServices.Auth.logout();
  location.href = "login.html";
};

