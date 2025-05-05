// auth.js

export function verificarSesion() {
  const usuario = localStorage.getItem("usuario");
  const rol = localStorage.getItem("rol");
  if (!usuario || !rol) {
    alert("Sesión no iniciada. Por favor, inicia sesión.");
    window.location.href = "index.html";
  }
}

export function ocultarLinksPorRol() {
  window.addEventListener("load", () => {
    const rol = localStorage.getItem("rol");
    console.log("🟡 Rol leído desde localStorage:", rol);

    if (rol === "Vendedor") {
      console.log("🟠 Usuario es Vendedor, ocultando enlaces...");

      const links = [
        'a[href="usuarios.html"]',
        'a[href="reportes.html"]',
        'a[href="inventario.html"]',
        'a[href="compras.html"]'
      ];

      links.forEach(selector => {
        try {
          const link = document.querySelector(selector);
          console.log(`🔍 Buscando: ${selector}`, link);
          if (link) {
            link.style.display = "none";
            console.log(`✅ Ocultado: ${selector}`);
          } else {
            console.warn(`❌ No se encontró el enlace: ${selector}`);
          }
        } catch (err) {
          console.error(`⚠️ Error con el selector ${selector}:`, err.message);
        }
      });
    } else {
      console.log("🔵 Usuario con rol permitido:", rol);
    }
  });
}
