import { auth, db } from "./firebase-config.js";
import { FirebaseServices } from "./firebase-services.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
// DASHBOARD GLOBAL
// ─────────────────────────────
function loadDashboardGlobal() {

  let totalIngresos = 0;
  let totalVentas = 0;
  let totalDiamantes = 0;
  let totalGananciaSistema = 0;

  const vendedoresMap = {};

  allOrders.forEach(order => {

    const total = order.total || 0;
    const comision = 0.15;

    const gananciaSistema = total * comision;
    const gananciaVendedor = total - gananciaSistema;

    totalIngresos += total;
    totalVentas++;
    totalGananciaSistema += gananciaSistema;

    totalDiamantes += (order.productos || [])
      .reduce((a,b)=>a+(b.diamantes||0),0);

    if (!vendedoresMap[order.userId]) {
      vendedoresMap[order.userId] = {
        ventas: 0,
        ingresos: 0,
        ganancia: 0
      };
    }

    vendedoresMap[order.userId].ventas++;
    vendedoresMap[order.userId].ingresos += total;
    vendedoresMap[order.userId].ganancia += gananciaVendedor;
  });

  totalVendedores.textContent = allUsers.length;
  totalIngresosGlobal.textContent = "$" + totalIngresos.toLocaleString("es-AR");
  totalVentasGlobal.textContent = totalVentas;
  totalDiamantes.textContent = totalDiamantes;

  console.log("💰 Ganancia sistema:", totalGananciaSistema);

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
      <b>${v.nombre}</b>
      | Ventas: ${v.ventas}
      | Total: $${v.ingresos}
      | Ganancia: $${Math.floor(v.ganancia)}
    </div>
  `).join("");
}

// ─────────────────────────────
// USUARIOS
// ─────────────────────────────
function renderUsuarios(users) {

  usuariosList.innerHTML = users.map(u => {

    const link = `${window.location.origin}/index.html?user=${u.id}`;
    const vencimiento = u.expiraEn
      ? new Date(u.expiraEn.seconds * 1000).toLocaleDateString()
      : "∞";

    const estado = u.estado || "activo";

    return `
      <div class="order-row">

        <b>${u.nombreTienda}</b> (${u.email}) <br>

        📦 Plan: ${u.plan || "free"} <br>
        📅 Vence: ${vencimiento} <br>
        ⚡ Estado: ${estado} <br>

        🔗 <a href="${link}" target="_blank">${link}</a>

        <br><br>

        <!-- 🔥 BOTONES PRO -->
        <button onclick="copyLink('${link}')">🔗 Copiar Link</button>

        <button onclick="copyCredentials('${u.email}','${link}')">
          📋 Copiar Credenciales
        </button>

        <button onclick="sendWhatsApp('${u.email}','${link}','${u.id}')">
          📲 Enviar WhatsApp
        </button>

        <br><br>

        <button onclick="toggleUserStatus('${u.id}','${estado}')">
          ${estado === "activo" ? "🚫 Suspender" : "✅ Activar"}
        </button>

      </div>
    `;
  }).join("");
}
// ─────────────────────────────
// TOGGLE USER
// ─────────────────────────────
window.toggleUserStatus = async (id, estado) => {

  const nuevo = estado === "activo" ? "suspendido" : "activo";

  await updateDoc(doc(db,"users",id), {
    estado: nuevo
  });

  loadAllUsers();
};

// ─────────────────────────────
// PEDIDOS GLOBAL
// ─────────────────────────────
function renderPedidosGlobal(orders) {

  pedidosGlobalList.innerHTML = orders.map(o => {

    const user = allUsers.find(u => u.id === o.userId);

    return `
      <div class="order-row">
        ${user?.nombreTienda || "Tienda"} —
        ${o.nombreCliente} —
        $${o.total} —
        <span class="badge ${o.estado}">${o.estado}</span>
      </div>
    `;
  }).join("");
}

// ─────────────────────────────
// FILTRO ESTADO
// ─────────────────────────────
filterOrderStatus.addEventListener("change", (e)=>{
  const val = e.target.value;
  if (!val) return renderPedidosGlobal(allOrders);

  renderPedidosGlobal(allOrders.filter(o=>o.estado===val));
});

// ─────────────────────────────
// FILTRO USUARIO
// ─────────────────────────────
function fillUserFilter() {

  filterUserOrders.innerHTML = `<option value="">Todos</option>` +
    allUsers.map(u => `
      <option value="${u.id}">
        ${u.nombreTienda}
      </option>
    `).join("");
}

filterUserOrders.addEventListener("change", (e)=>{
  const userId = e.target.value;

  if (!userId) return renderPedidosGlobal(allOrders);

  renderPedidosGlobal(allOrders.filter(o => o.userId === userId));
});

// ─────────────────────────────
// CONFIG GLOBAL
// ─────────────────────────────
saveGlobalConfig.addEventListener("click", async () => {

  const data = {
    comision: Number(comisionGlobal.value),
    limiteFree: Number(limiteFree.value),
    maintenanceMsg: maintenanceMsg.value,
    updatedAt: new Date()
  };

  await setDoc(doc(db,"configuracion_global","settings"), data);

  alert("Configuración guardada ✅");
});

// ─────────────────────────────
// 🔥 CREAR USUARIO POR UID
// ─────────────────────────────
createUserFirestore.addEventListener("click", async () => {

  const uid = newUserUID.value.trim();
  const email = newAdminEmail.value.trim();
  const tienda = newAdminTienda.value.trim();
  const telefono = newTelefono.value.trim();
  const color = newColor.value;
  const plan = newPlan.value;
  const dias = parseInt(newDuracion.value) || 30;

  if (!uid || !email || !tienda) {
    alert("UID, Email y Tienda obligatorios");
    return;
  }

  try {

    const expira = new Date(Date.now() + dias * 86400000);

    await setDoc(doc(db, "users", uid), {
      id: uid,
      email,
      nombre: email,
      nombreTienda: tienda,
      telefono,
      plan,
      estado: "activo",
      colorTema: color,
      createdAt: new Date(),
      expiraEn: expira,
      config: {
        mostrarSorteos: true,
        mostrarPromociones: false
      }
    });

    alert("Usuario vinculado ✅");

    newUserUID.value = "";
    newAdminEmail.value = "";
    newAdminTienda.value = "";
    newTelefono.value = "";

    loadAllUsers();

  } catch (err) {
    console.error(err);
    alert("Error al crear usuario");
  }
});

// ─────────────────────────────
// LOGOUT
// ─────────────────────────────
logoutAdmin.onclick = async () => {
  await FirebaseServices.Auth.logout();
  location.href = "login.html";
};

// ─────────────────────────────
// TABS
// ─────────────────────────────
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;

    document.querySelectorAll(".tab-content").forEach(t => t.classList.add("hidden"));
    document.getElementById(tab + "-tab").classList.remove("hidden");

  });
});

// ─────────────────────────────
// 🔥 COPIAR LINK
// ─────────────────────────────
window.copyLink = (link) => {
  navigator.clipboard.writeText(link);
  alert("Link copiado ✅");
};

// ─────────────────────────────
// 🔥 COPIAR CREDENCIALES
// ─────────────────────────────
window.copyCredentials = (email, link) => {

  const texto = `
🔥 ACCESO A TU TIENDA

🔗 Link: ${link}
📧 Usuario: ${email}

👉 Ingresá y empezá a vender 🚀
`;

  navigator.clipboard.writeText(texto);
  alert("Credenciales copiadas ✅");
};

// ─────────────────────────────
// 🔥 WHATSAPP READY
// ─────────────────────────────
window.sendWhatsApp = (email, link, uid) => {

  const welcome = `${window.location.origin}/welcome.html?user=${uid}`;

  const mensaje = `🔥 Tu tienda está lista!

👉 Acceso inicial:
${welcome}

🔗 Tu tienda:
${link}

📧 Usuario: ${email}

🚀 Empezá a vender ahora`;

  window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`);
};

import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("sendPush").addEventListener("click", async () => {

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