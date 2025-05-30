function validarSesion() {
  const uid = localStorage.getItem("uid");
  const nombre = localStorage.getItem("usuario");
  const rol = localStorage.getItem("rol");

  if (!uid || !nombre || !rol) {
    window.location.href = "index.html"; // Redirige si no hay sesión
    return;
  }

  document.getElementById("usuario-logueado").textContent = `Bienvenido, ${nombre}`;
  document.getElementById("rol-logueado").textContent = `Rol: ${rol}`;

  mostrarOpcionesPermitidas(rol);
}

function mostrarOpcionesPermitidas(rolUsuario) {
  const links = document.querySelectorAll('.sidebar a');
  links.forEach(link => {
    const rolesPermitidos = link.getAttribute('data-rol');
    if (!rolesPermitidos || rolesPermitidos === "todos") return;
    const listaRoles = rolesPermitidos.split(',').map(r => r.trim().toLowerCase());
    if (!listaRoles.includes(rolUsuario.toLowerCase())) {
      link.parentElement.style.display = "none";
    }
  });
}

// Ejecutar la validación inmediatamente
validarSesion();
