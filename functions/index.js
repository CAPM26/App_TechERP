const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // O especifica tu dominio

admin.initializeApp();
const db = admin.firestore();

exports.crearUsuario = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send("Método no permitido");
    }

    try {
      const { email, password, nombre, telefono, rol, estado, uidSolicitante } = req.body;

      if (!uidSolicitante) {
        return res.status(401).json({ error: "Falta el UID del solicitante." });
      }

      const userDoc = await db.collection("usuarios").doc(uidSolicitante).get();
      const userData = userDoc.data();

      if (!userData || userData.rol !== "Administrador") {
        return res.status(403).json({ error: "No tienes permisos para crear usuarios." });
      }

      const userRecord = await admin.auth().createUser({ email, password });

      await db.collection("usuarios").doc(userRecord.uid).set({
        nombre,
        correo: email,
        telefono,
        rol,
        estado
      });

      return res.status(200).json({ success: true, uid: userRecord.uid });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
