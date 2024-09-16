// Middleware para verificar el rol de usuario
module.exports = function (rolesPermitidos) {
  return (req, res, next) => {
    const { rol } = req.user; // Supone que el usuario ya está autenticado y tiene el campo "rol"

    if (!rolesPermitidos.includes(rol)) {
      return res
        .status(403)
        .json({
          message: "Acceso denegado: No tienes los permisos suficientes",
        });
    }

    next();
  };
};
