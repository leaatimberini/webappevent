const nodemailer = require("nodemailer");

// Crear un transportador de correo
const transporter = nodemailer.createTransport({
  service: "gmail", // Puedes usar cualquier servicio de correo compatible (SendGrid, Gmail, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Tu correo electrónico
    pass: process.env.EMAIL_PASS, // Tu contraseña o clave de aplicación
  },
});

module.exports = transporter;
