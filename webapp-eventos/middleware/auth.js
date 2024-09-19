const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Acceso denegado. No se proporcionó token." });
  }

  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    ); // Verificar el token
    req.user = verified; // Guardar datos del token en req.user
    next();
  } catch (error) {
    res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = auth;
