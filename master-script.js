import { auth, db } from "./firebase-config.js";
import { FirebaseServices } from "./firebase-services.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ─────────────────────────────
// ESPERAR DOM (🔥 CRÍTICO)
// ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // ELEMENTOS DOM
  const userName = document.getElementById("userName");
  const usuariosList = document.getElementById("usuariosList");
  const pedidosGlobalList = document.getElementById("pedidosGlobalList");
  const filterOrderStatus = document.getElementById("filterOrderStatus");
  const filterUserOrders = document.getElementById("filterUserOrders");
  const totalVendedores = document.getElementById("totalVendedores");
  const totalIngresosGlobal = document.getElementById("totalIngresosGlobal");
  const totalVentasGlobal = document.getElementById("totalVentasGlobal");
  const totalDiamantes = document.getElementById("totalDiamantes");
  const topVendedoresList = document.getElementById("topVendedoresList");
  const saveGlobalConfig = document.getElementById("saveGlobalConfig");
  const logoutAdmin = document.getElementById("logoutAdmin");

  let currentUser = null;
  let allUsers = [];
  let allOrders = [];

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

    await loadAllUsers();
    await loadAllOrders();

    loadDashboardGlobal();
    fillUserFilter();
  });

  // ─────────────────────────────
  // LOAD USERS
  // ─────────────────────────────
  async function loadAllUsers() {
    const snap = await getDocs(collection(db, "users"));

    allUsers = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderUsuarios(allUsers);
  }

  // ─────────────────────────────
  // LOAD ORDERS
  // ─────────────────────────────
  async function loadAllOrders() {
    const snap = await getDocs(collection(db, "pedidos"));

    allOrders = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderPedidosGlobal(allOrders);
  }

  // ─────────────────────────────
  // DASHBOARD
  // ─────────────────────────────
  function loadDashboardGlobal() {

    let totalIngresos = 0;
    let totalVentas = 0;
    let totalDiamantesCount = 0;

    const vendedoresMap = {};

    allOrders.forEach(order => {

      const total = order.total || 0;

      totalIngresos += total;
      totalVentas++;

      totalDiamantesCount += (order.productos || [])
        .reduce((a,b)=>a+(b.diamantes||0),0);

      if (!vendedoresMap[order.userId]) {
        vendedoresMap[order.userId] = {
          ventas: 0,
          ingresos: 0
        };
      }

      vendedoresMap[order.userId].ventas++;
      vendedoresMap[order.userId].ingresos += total;
    });

    totalVendedores.textContent = allUsers.length;
    totalIngresosGlobal.textContent = "$" + totalIngresos;
    totalVentasGlobal.textContent = totalVentas;
    totalDiamantes.textContent = totalDiamantesCount;

    renderTopVendedores(vendedoresMap);
  }

  // ─────────────────────────────
  // TOP VENDEDORES
  // ─────────────────────────────
  function renderTopVendedores(map) {

    const data = Object.entries(map)
      .map(([id, stats]) => {
        const user = allUsers.find(u => u.id === id);

        return {
          nombre: user?.nombreTienda || "Tienda",
          ...stats
        };
      })
      .sort((a,b)=>b.ingresos-a.ingresos);

    topVendedoresList.innerHTML = data.map(v=>`
      <div class="order-row">
        <b>${v.nombre}</b> — $${v.ingresos}
      </div>
    `).join("");
  }

  // ─────────────────────────────
  // USUARIOS
  // ─────────────────────────────
  function renderUsuarios(users) {

    usuariosList.innerHTML = users.map(u => {

      const link = `${window.location.origin}/index.html?user=${u.id}`;

      return `
        <div class="order-row">
          <b>${u.nombreTienda}</b> (${u.email})<br>

          <button onclick="copyLink('${link}')">🔗 Copiar</button>
          <button onclick="copyCredentials('${u.email}','${link}')">📋 Credenciales</button>
          <button onclick="sendWhatsApp('${u.email}','${link}','${u.id}')">📲 WhatsApp</button>
          <button onclick="toggleUserStatus('${u.id}','${u.estado}')">⚡ Estado</button>
        </div>
      `;
    }).join("");
  }

  // ─────────────────────────────
  // PEDIDOS
  // ─────────────────────────────
  function renderPedidosGlobal(orders) {

    pedidosGlobalList.innerHTML = orders.map(o => `
      <div class="order-row">
        ${o.nombreCliente} — $${o.total}
      </div>
    `).join("");
  }

  // ─────────────────────────────
  // FILTROS
  // ─────────────────────────────
  filterOrderStatus?.addEventListener("change", (e)=>{
    const val = e.target.value;
    if (!val) return renderPedidosGlobal(allOrders);

    renderPedidosGlobal(allOrders.filter(o=>o.estado===val));
  });

  filterUserOrders?.addEventListener("change", (e)=>{
    const userId = e.target.value;
    if (!userId) return renderPedidosGlobal(allOrders);

    renderPedidosGlobal(allOrders.filter(o => o.userId === userId));
  });

  function fillUserFilter() {
    filterUserOrders.innerHTML = `<option value="">Todos</option>` +
      allUsers.map(u => `<option value="${u.id}">${u.nombreTienda}</option>`).join("");
  }

  // ─────────────────────────────
  // CONFIG GLOBAL
  // ─────────────────────────────
  saveGlobalConfig?.addEventListener("click", async () => {

    await setDoc(doc(db,"configuracion_global","settings"), {
      updatedAt: new Date()
    });

    alert("Guardado ✅");
  });

  // ─────────────────────────────
  // CREAR USUARIO
  // ─────────────────────────────
  document.getElementById("createUserFirestore")?.addEventListener("click", async () => {

    const uid = document.getElementById("newUserUID").value.trim();
    const email = document.getElementById("newAdminEmail").value.trim();
    const tienda = document.getElementById("newAdminTienda").value.trim();

    if (!uid || !email || !tienda) return alert("Faltan datos");

    await setDoc(doc(db, "users", uid), {
      email,
      nombreTienda: tienda,
      estado: "activo",
      createdAt: new Date()
    });

    alert("Usuario creado ✅");
    loadAllUsers();
  });

  // ─────────────────────────────
  // NOTIFICACIONES FAKE
  // ─────────────────────────────
  document.getElementById("sendPush")?.addEventListener("click", async () => {

    const title = document.getElementById("pushTitle").value;
    const body = document.getElementById("pushBody").value;

    await addDoc(collection(db, "notificaciones"), {
      titulo: title,
      mensaje: body,
      userId: "ALL",
      fecha: new Date()
    });

    alert("Notificación enviada 🚀");
  });

  // ─────────────────────────────
  // LOGOUT
  // ─────────────────────────────
  logoutAdmin?.addEventListener("click", async () => {
    await FirebaseServices.Auth.logout();
    location.href = "login.html";
  });

});

// ─────────────────────────────
// FUNCIONES GLOBALES
// ─────────────────────────────
window.copyLink = (link) => {
  navigator.clipboard.writeText(link);
  alert("Link copiado");
};

window.copyCredentials = (email, link) => {
  navigator.clipboard.writeText(`Link: ${link}\nUser: ${email}`);
  alert("Credenciales copiadas");
};

window.sendWhatsApp = (email, link, uid) => {
  const msg = `Tu tienda:\n${link}\nUsuario: ${email}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
};

window.toggleUserStatus = async (id, estado) => {
  const nuevo = estado === "activo" ? "suspendido" : "activo";
  await updateDoc(doc(db,"users",id), { estado: nuevo });
  location.reload();
};
