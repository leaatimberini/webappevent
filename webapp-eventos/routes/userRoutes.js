const express = require("express");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const crypto = require("crypto"); // Importar crypto para generar tokens
const nodemailer = require("../utils/nodemailer"); // Importar nodemailer para el envío de emails
const path = require("path");
const router = express.Router();
const { Op } = require("sequelize");

// Configurar Multer para almacenar imágenes en una carpeta "uploads/"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Registrar un nuevo usuario con validación y asignación de rol
router.post(
  "/register",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("email", "Debe ser un email válido").isEmail(),
    check(
      "password",
      "La contraseña debe tener al menos 6 caracteres"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, password, rol = "user" } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        nombre,
        email,
        password: hashedPassword,
        rol,
      });

      const token = jwt.sign(
        { id: newUser.id, rol: newUser.rol },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          email: newUser.email,
          rol: newUser.rol,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error al crear el usuario", error: error.message });
    }
  }
);

// Subir imagen de perfil de usuario (solo usuarios autenticados)
router.post(
  "/upload-profile",
  auth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });

      // Guardar la ruta de la imagen en la base de datos
      user.profileImage = req.file.path;
      await user.save();

      res.json({
        message: "Imagen de perfil subida exitosamente",
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al subir la imagen de perfil",
        error: error.message,
      });
    }
  }
);

// Iniciar sesión
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});

// Ruta para solicitar restablecimiento de contraseña
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Guardar token y fecha de expiración en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await user.save();

    // Enviar email al usuario con el enlace de restablecimiento
    const resetUrl = `http://localhost:5000/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Solicitud de restablecimiento de contraseña",
      text: `Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla: ${resetUrl}`,
    };

    nodemailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error al enviar el correo:", err);
        return res
          .status(500)
          .json({ message: "Error al enviar el correo de restablecimiento" });
      }
      res.json({ message: "Correo de restablecimiento enviado con éxito" });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});

// Ruta para restablecer la contraseña
router.post(
  "/reset-password/:token",
  [
    check(
      "password",
      "La contraseña debe tener al menos 6 caracteres"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { password } = req.body;

    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { [Op.gt]: Date.now() }, // Asegurarse de que el token no haya expirado
        },
      });

      if (!user)
        return res.status(400).json({ message: "Token inválido o expirado" });

      // Actualizar la contraseña del usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await user.save();

      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
  }
);

module.exports = router;
