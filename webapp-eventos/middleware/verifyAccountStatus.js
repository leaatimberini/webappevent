module.exports = (req, res, next) => {
  if (!req.user.active) {
    return res
      .status(403)
      .json({
        message: "Tu cuenta está inactiva, no puedes realizar esta acción.",
      });
  }
  next();
};
