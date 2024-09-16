const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Servir archivos estáticos

// Importar rutas
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const rrppRoutes = require("./routes/rrppRoutes");
const adminConfigRoutes = require("./routes/adminConfigRoutes"); // Importar rutas de configuración administrativa

// Usar las rutas
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/rrpp", rrppRoutes);
app.use("/api/admin/config", adminConfigRoutes); // Usar las rutas de configuración administrativa

// Rutas (Ejemplo básico)
app.get("/", (req, res) => {
  res.send("Bienvenido a la webapp de eventos");
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Sincroniza modelos con la base de datos
const sequelize = require("./config/database");
const { User, Event, Ticket, RRPP, Config, RefreshToken } = require("./models"); // Importar el modelo de RefreshToken

// Inicializar configuración por defecto
const initConfig = async () => {
  await Config.sync({ force: false }); // Solo crea la tabla si no existe
  const configExists = await Config.findOne();
  if (!configExists) {
    await Config.create({
      nombre_pagina: "Mi Webapp de Eventos",
      dominio: "localhost",
      formas_pago: JSON.stringify(["Mercado Pago", "Transferencia"]),
      titulo_seo: "Mi Webapp de Eventos - Inicio",
      descripcion_seo: "Bienvenido a la mejor webapp de eventos",
      meta_pixel: "",
      google_analytics: "",
    });
    console.log("Configuración inicializada");
  }
};

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  if (req.url === "/favicon.ico") {
    return res.status(204); // Ignorar solicitudes de favicon
  }
  console.error(err.stack); // Imprimir el error en la consola
  res.status(500).json({
    message: "Ocurrió un error en el servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {}, // Mostrar detalles solo en desarrollo
  });
});

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initConfig(); // Inicializar configuración al arrancar el servidor
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  await sequelize.sync({ force: false }); // Sincronizar base de datos, incluyendo RefreshToken
});
