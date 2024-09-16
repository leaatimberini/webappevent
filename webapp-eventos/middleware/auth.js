const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res
      .status(401)
      .json({ message: "Acceso denegado. No se proporcionó token." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Adjunta el usuario verificado a la solicitud
    next(); // Continúa a la siguiente función (la ruta protegida)
  } catch (error) {
    res.status(400).json({ message: "Token inválido." });
  }
};

module.exports = auth;
