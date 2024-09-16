const express = require("express");
const { Config } = require("../models");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const router = express.Router();

// Obtener la configuración actual (solo administradores)
router.get("/", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config)
      return res.status(404).json({ message: "Configuración no encontrada" });

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener configuración", error });
  }
});

// Actualizar la configuración (solo administradores)
router.put("/", auth, checkRole(["admin"]), async (req, res) => {
  const {
    nombre_pagina,
    dominio,
    formas_pago,
    titulo_seo,
    descripcion_seo,
    meta_pixel,
    google_analytics,
  } = req.body;

  try {
    const config = await Config.findOne();
    if (!config)
      return res.status(404).json({ message: "Configuración no encontrada" });

    config.nombre_pagina = nombre_pagina || config.nombre_pagina;
    config.dominio = dominio || config.dominio;
    config.formas_pago = formas_pago || config.formas_pago;
    config.titulo_seo = titulo_seo || config.titulo_seo;
    config.descripcion_seo = descripcion_seo || config.descripcion_seo;
    config.meta_pixel = meta_pixel || config.meta_pixel;
    config.google_analytics = google_analytics || config.google_analytics;

    await config.save();
    res.json(config);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar configuración", error });
  }
});

module.exports = router;
