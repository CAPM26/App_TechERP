const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Función para crear usuario (solo para administradores)
exports.crearUsuario = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  // Obtener datos del usuario que hace la solicitud
  const userDoc = await db.collection("usuarios").doc(uid).get();
  const userData = userDoc.data();

  if (!userData || userData.rol !== "Administrador") {
    throw new functions.https.HttpsError("permission-denied", "No tienes permisos para crear usuarios.");
  }

  const { email, password, nombre, telefono, rol, estado } = data;

  if (!email || !password || !nombre || !telefono || !rol || !estado) {
    throw new functions.https.HttpsError("invalid-argument", "Todos los campos son obligatorios.");
  }

  try {
    // Crear cuenta en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password
    });

    // Guardar información adicional en Firestore
    await db.collection("usuarios").doc(userRecord.uid).set({
      nombre,
      correo: email,
      telefono,
      rol,
      estado
    });

    return {
      success: true,
      uid: userRecord.uid
    };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
