const express = require("express");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const { check, validationResult } = require("express-validator");
const multer = require("multer"); // Importar Multer para subir archivos
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
      user.profileImage = req.file.path; // Guardar la ruta del archivo
      await user.save();

      res.json({
        message: "Imagen de perfil subida exitosamente",
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
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
        profileImage: user.profileImage, // Incluir la imagen de perfil en los datos del usuario
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

module.exports = router;
