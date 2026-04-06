import { FirebaseServices } from "./firebase-services.js";
import { STORE_CONFIG, PRODUCTOS, CURRENT_USER_ID } from "./store-config.js";

// 🛒 CARRITO
let carrito = [];

// ─────────────────────────────
// RENDER PRODUCTOS
// ─────────────────────────────
function renderProductos() {
  const contenedor = document.getElementById("productos");

  contenedor.innerHTML = PRODUCTOS.map(p => `
    <div class="card">
     <img class="product-img" src="${p.imagen || 'https://latingm.com/wp-content/uploads/2021/02/Diamantes-Free-Fire-Latinoamerica.jpg'}">
      <div class="card-body">
        <div class="cantidad">💎 ${p.diamantes} 💎</div>
        <div class="precio">$ ${p.precioBase}</div>
        <button class="btn" onclick="addToCart('${p.id}')">
          Comprar
        </button>
      </div>
    </div>
  `).join("");
}

// ─────────────────────────────
// AGREGAR AL CARRITO
// ─────────────────────────────
window.addToCart = (id) => {
  const producto = PRODUCTOS.find(p => p.id === id);
  if (!producto) return;

  carrito.push(producto);

  updateCartUI();
  openCart();
};

// ─────────────────────────────
// ACTUALIZAR UI CARRITO
// ─────────────────────────────
function updateCartUI() {
  document.getElementById("cartCount").textContent = carrito.length;

  const items = document.getElementById("cartItems");
  const totalEl = document.getElementById("totalAmount");

  if (carrito.length === 0) {
    items.innerHTML = "";
    totalEl.textContent = "$0";
    return;
  }

  items.innerHTML = carrito.map(p => `
    <div style="display:flex;justify-content:space-between;margin:10px 0">
      <span>${p.diamantes} 💎</span>
      <span>$${p.precioBase}</span>
    </div>
  `).join("");

  const total = carrito.reduce((a,b)=>a+b.precioBase,0);
  totalEl.textContent = "$" + total;
}

// ─────────────────────────────
// MODAL CARRITO
// ─────────────────────────────
const cartModal = document.getElementById("cartModal");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");

function openCart() {
  cartModal.classList.remove("hidden");
}

function closeCartModal() {
  cartModal.classList.add("hidden");
}

// eventos
cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartModal);

cartModal.addEventListener("click", (e)=>{
  if(e.target === cartModal) closeCartModal();
});

// limpiar carrito
document.getElementById("clearCart").addEventListener("click", ()=>{
  carrito = [];
  updateCartUI();
});

// ─────────────────────────────
// 🔥 MÉTODO DE PAGO (FIX COMPLETO)
// ─────────────────────────────
document.querySelectorAll(".pago-opt").forEach(opt => {
  opt.addEventListener("click", () => {

    document.querySelectorAll(".pago-opt").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");

    const radio = opt.querySelector("input");
    if (radio) radio.checked = true;
  });
});

// ✔ Seleccionar por defecto visualmente
const firstPago = document.querySelector(".pago-opt");
if (firstPago) {
  firstPago.classList.add("selected");

  const radio = firstPago.querySelector("input");
  if (radio) radio.checked = true;
}

// ─────────────────────────────
// ESPERAR FIREBASE Y RENDER
// ─────────────────────────────
setTimeout(renderProductos, 1000);

// ─────────────────────────────
// FINALIZAR COMPRA
// ─────────────────────────────
document.getElementById("finalizar").addEventListener("click", async () => {

  const nombre = document.getElementById("nombre").value.trim();
  const edad = document.getElementById("edad").value.trim();
  const uidJugador = document.getElementById("uidJugador").value.trim();

  // 🔥 FIX DEFINITIVO
  let pago = document.querySelector('input[name="pago"]:checked')?.value;

  if (!pago) {
    pago = "Transferencia"; // fallback seguro
  }

  if (!nombre || carrito.length === 0) {
    alert("Completa todos los datos");
    return;
  }

  try {
    const total = carrito.reduce((a, b) => a + b.precioBase, 0);

    let orderId = null;

    if (CURRENT_USER_ID) {
      const result = await FirebaseServices.Order.createOrder(CURRENT_USER_ID, {
        nombreCliente: nombre,
        uidJugador,
        edadCliente: parseInt(edad),
        metodoPago: pago,
        productos: carrito,
        total
      });

      if (result.success) orderId = result.orderId;
    }

    const mensaje = `Pedido\nTotal: $${total}\nNombre: ${nombre}\nUID: ${uidJugador}\nPago: ${pago}`;

    window.open(`https://wa.me/${STORE_CONFIG.telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`);

    carrito = [];
    updateCartUI();
    closeCartModal();

  } catch (e) {
    console.error(e);
  }
});

document.getElementById("finalizar").addEventListener("click", async () => {

  const nombre = document.getElementById("nombre").value.trim();
  const edad = document.getElementById("edad").value.trim();
  const uidJugador = document.getElementById("uidJugador").value.trim();

  let pago = document.querySelector('input[name="pago"]:checked')?.value;

  if (!pago) pago = "Transferencia";

  if (!nombre || carrito.length === 0) {
    alert("Completa todos los datos");
    return;
  }

  try {
    const total = carrito.reduce((a, b) => a + b.precioBase, 0);

    let orderId = null;

    if (CURRENT_USER_ID) {
      const result = await FirebaseServices.Order.createOrder(CURRENT_USER_ID, {
        nombreCliente: nombre,
        uidJugador,
        edadCliente: parseInt(edad),
        metodoPago: pago,
        productos: carrito,
        total,
        fecha: new Date().toISOString() // 🔥 FIX
      });

      console.log("Pedido guardado:", result);

      if (result.success) orderId = result.orderId;
    }

    const mensaje = `Pedido\nTotal: $${total}\nNombre: ${nombre}\nUID: ${uidJugador}\nPago: ${pago}`;

    window.open(`https://wa.me/${STORE_CONFIG.telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`);

    carrito = [];
    updateCartUI();
    closeCartModal();

  } catch (e) {
    console.error(e);
  }
});

listenNotifications(CURRENT_USER_ID);

import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function listenNotifications(userId) {

  console.log("👂 Escuchando notificaciones para:", userId);

  onSnapshot(collection(db, "notificaciones"), (snapshot) => {

    snapshot.docChanges().forEach(change => {

      if (change.type === "added") {

        const data = change.doc.data();

        console.log("📩 Notificación recibida:", data);

        if (data.userId === "ALL" || data.userId === userId) {
          showNotification(data.titulo, data.mensaje);
        }

      }

    });

  });

}

function showNotification(title, message) {

  const div = document.createElement("div");

  div.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #111;
    color: white;
    padding: 15px;
    border-radius: 10px;
    z-index: 9999;
    box-shadow: 0 0 10px #000;
  `;

  div.innerHTML = `
    <strong>${title}</strong><br>
    ${message}
  `;

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 5000);
}
