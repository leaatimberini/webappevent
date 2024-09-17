// Middleware para verificar el rol de usuario
module.exports = function checkRole(rolesPermitidos) {
  return function (req, res, next) {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ message: "Acceso denegado. No tienes permisos suficientes." });
    }
    next(); // Si el rol es permitido, continuar
  };
};
