import {
  getFirestore, collection, getDocs, doc, addDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { app } from "./firebase.js";

const db = getFirestore(app);
const auth = getAuth();
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const nombreContadoInput = document.getElementById("nombreContado");
const clienteNITInput = document.getElementById("clienteNIT");

const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'GTQ'
});

document.getElementById("btnConfirmarVenta").addEventListener("click", async () => {
  if (carrito.length === 0) {
    mostrarMensaje("⚠️ El carrito está vacío.", "error");
    return;
  }

  const total = carrito.reduce((acc, item) => acc + item.cantidad * item.precio, 0);
  const clienteNombre = nombreContadoInput.value.trim() || "C/F";
  const clienteNIT = clienteNITInput.value.trim() || "C/F";
  const facturaID = `FAC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()}`;

  const productosFactura = carrito.map(item => ({
    producto: item.nombre,
    cantidad: item.cantidad,
    precioUnitario: item.precio,
    subtotal: item.precio * item.cantidad
  }));

  for (const item of carrito) {
    await addDoc(collection(db, "ventas"), {
      producto: item.nombre,
      cantidad: item.cantidad,
      total: item.precio * item.cantidad,
      fecha: new Date()
    });
  }

  await addDoc(collection(db, "facturas"), {
    numero: facturaID,
    cliente: clienteNombre,
    nit: clienteNIT,
    total,
    formaPago: "contado",
    cuotas: 0,
    productos: productosFactura,
    fecha: new Date()
  });

  localStorage.removeItem("carrito");
  mostrarMensaje("✅ Venta registrada con éxito.", "success");
  document.querySelector("#tablaResumen tbody").innerHTML = "";
  document.getElementById("totalVenta").textContent = "Q0.00";
  mostrarFactura(clienteNombre, clienteNIT, productosFactura);
});

function mostrarFactura(nombre, nit, productos) {
  document.getElementById("facturaClienteNombre").textContent = nombre;
  document.getElementById("facturaClienteNIT").textContent = nit;
  document.getElementById("facturaFecha").textContent = new Date().toLocaleString();

  const tbody = document.getElementById("facturaBody");
  tbody.innerHTML = "";
  let total = 0;

  productos.forEach(item => {
    const subtotal = item.subtotal;
    total += subtotal;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.producto}</td>
      <td>${item.cantidad}</td>
      <td>${formatter.format(item.precioUnitario)}</td>
      <td>${formatter.format(subtotal)}</td>`;
    tbody.appendChild(row);
  });

  document.getElementById("facturaTotal").textContent = formatter.format(total);
  document.getElementById("factura").style.display = "block";
}

function mostrarMensaje(msg, tipo) {
  const mensaje = document.getElementById("mensaje");
  mensaje.textContent = msg;
  mensaje.className = `mensaje ${tipo}`;
}

function renderizarTabla() {
  const tbody = document.querySelector("#tablaResumen tbody");
  tbody.innerHTML = "";
  let total = 0;
  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>${formatter.format(item.precio)}</td>
      <td>${formatter.format(subtotal)}</td>`;
    tbody.appendChild(row);
  });
  document.getElementById("totalVenta").textContent = formatter.format(total);
}

function cerrarSesion() {
  localStorage.clear();
  auth.signOut().then(() => window.location.href = "index.html");
}

async function cargarDatosEmpresa() {
  try {
    const ref = doc(db, "configuracion_factura", "empresa");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("empresaNombre").textContent = data.nombre || "Mi Empresa";
      document.getElementById("empresaNIT").textContent = "NIT: " + (data.nit || "-");
      document.getElementById("empresaDireccion").textContent = data.direccion || "Dirección";
      document.getElementById("empresaTelefono").textContent = data.telefono || "-";
    }
  } catch (err) {
    console.error("❌ Error al cargar datos de empresa:", err);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "index.html";
  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return window.location.href = "index.html";
  const data = snap.data();

  document.getElementById("usuario-logueado").textContent = `Bienvenido, ${data.nombre}`;
  document.getElementById("rol-logueado").textContent = `Rol: ${data.rol}`;
  document.getElementById("fecha-hoy").textContent = new Date().toLocaleDateString('es-ES');

  await cargarDatosEmpresa();
  renderizarTabla();
});

window.ventas = {
  cerrarSesion
};
