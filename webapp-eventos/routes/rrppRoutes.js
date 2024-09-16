const express = require("express");
const { RRPP, Ticket } = require("../models");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const router = express.Router();

// Crear un nuevo RRPP (solo administradores)
router.post("/", auth, checkRole(["admin"]), async (req, res) => {
  const { nombre, comision } = req.body;

  try {
    const newRRPP = await RRPP.create({ nombre, comision });
    res.status(201).json(newRRPP);
  } catch (error) {
    res.status(400).json({ message: "Error al crear RRPP", error });
  }
});

// Obtener todos los RRPP (solo administradores)
router.get("/", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const rrpp = await RRPP.findAll();
    res.json(rrpp);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener RRPP", error });
  }
});

// Ver las ventas de un RRPP específico (solo RRPP o administradores)
router.get(
  "/:id/ventas",
  auth,
  checkRole(["rrpp", "admin"]),
  async (req, res) => {
    try {
      const rrpp = await RRPP.findByPk(req.params.id);
      if (!rrpp) return res.status(404).json({ message: "RRPP no encontrado" });

      const ventas = await Ticket.findAll({ where: { rrppId: req.params.id } });
      if (!ventas.length)
        return res
          .status(404)
          .json({ message: "No se encontraron ventas para este RRPP" });

      const totalVentas = ventas.reduce((acc, venta) => acc + venta.precio, 0);
      const comision = totalVentas * (rrpp.comision / 100); // Calcular comisión

      res.json({
        rrpp: rrpp.nombre,
        total_ventas: totalVentas,
        comision,
        ventas,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener ventas", error });
    }
  }
);

module.exports = router;
