const express = require("express");
const { User, RefreshToken } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const router = express.Router();

// Configurar Multer para almacenar imágenes en una carpeta "uploads/"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

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
        { expiresIn: "15m" }
      );

      const refreshToken = crypto.randomBytes(40).toString("hex");
      const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 semana
      await RefreshToken.create({
        token: refreshToken,
        userId: newUser.id,
        expires,
      });

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          email: newUser.email,
          rol: newUser.rol,
        },
        token,
        refreshToken,
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
      { expiresIn: "15m" }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 semana
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expires,
    });

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
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
});

// Obtener el perfil del usuario autenticado
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "nombre", "email", "rol", "profileImage"], // Asegúrate de que 'nombre' esté incluido
    });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user); // Devuelve los datos del usuario
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener el perfil", error: error.message });
  }
});

module.exports = router;
