const express = require("express");
const { Ticket, Event } = require("../models");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const { check, validationResult } = require("express-validator"); // Importar express-validator
const mercadopago = require("mercadopago");
const router = express.Router();

// Configurar Mercado Pago
mercadopago.configurations = {
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
};

// Validaciones para crear una entrada
router.post(
  "/",
  auth,
  [
    check("tipo", "El tipo de entrada es obligatorio").not().isEmpty(),
    check("precio", "El precio debe ser un número válido").isFloat({ gt: 0 }),
    check("codigo_qr", "El código QR es obligatorio").not().isEmpty(),
    check("userId", "El ID de usuario es obligatorio").isInt(),
    check("eventId", "El ID del evento es obligatorio").isInt(),
    check("rrppId", "El ID de RRPP es obligatorio").isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tipo, precio, codigo_qr, userId, eventId, rrppId } = req.body;

    try {
      const event = await Event.findByPk(eventId);
      if (!event)
        return res.status(404).json({ message: "Evento no encontrado" });

      const newTicket = await Ticket.create({
        tipo,
        precio,
        codigo_qr,
        userId,
        eventId,
        rrppId,
      });

      res.status(201).json({
        message: "Entrada creada exitosamente",
        ticket: newTicket,
      });
    } catch (error) {
      res.status(400).json({ message: "Error al crear la entrada", error });
    }
  }
);

// Obtener todas las entradas (solo administradores)
router.get("/", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las entradas", error });
  }
});

module.exports = router;
