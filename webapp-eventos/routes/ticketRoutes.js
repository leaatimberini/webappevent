const express = require("express");
const { Ticket, Event } = require("../models");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const verifyAccountStatus = require("../middleware/verifyAccountStatus"); // Agregar el middleware de estado de cuenta
const mercadopago = require("mercadopago");
const router = express.Router();

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// Comprar una nueva entrada (solo usuarios autenticados con cuenta activa)
router.post("/", auth, verifyAccountStatus, async (req, res) => {
  const { tipo, precio, eventId } = req.body;

  try {
    const event = await Event.findByPk(eventId);
    if (!event)
      return res.status(404).json({ message: "Evento no encontrado" });

    // Crear preferencia de pago
    let preference = {
      items: [
        {
          title: `Entrada para ${event.nombre}`,
          unit_price: parseFloat(precio),
          quantity: 1,
        },
      ],
      payer: {
        email: req.user.email,
      },
      back_urls: {
        success: "http://localhost:5000/success",
        failure: "http://localhost:5000/failure",
        pending: "http://localhost:5000/pending",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);

    // Crear entrada en la base de datos
    const newTicket = await Ticket.create({
      tipo,
      precio,
      eventId,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Entrada creada exitosamente",
      ticket: newTicket,
      init_point: response.body.init_point, // URL para pagar en Mercado Pago
    });
  } catch (error) {
    console.error("Error al crear la entrada:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor, no se pudo crear la entrada." });
  }
});

// Obtener todas las entradas con paginación (solo administradores)
router.get("/", auth, checkRole(["admin"]), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    const { rows: tickets, count } = await Ticket.findAndCountAll({
      offset,
      limit: parseInt(limit),
    });

    res.json({
      total: count,
      page: parseInt(page),
      per_page: parseInt(limit),
      total_pages: Math.ceil(count / limit),
      tickets,
    });
  } catch (error) {
    console.error("Error al obtener las entradas:", error);
    res.status(500).json({
      message: "Error en el servidor, no se pudieron obtener las entradas.",
    });
  }
});

// Validar una entrada por ID (solo administradores)
router.put("/:id/validate", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket)
      return res.status(404).json({ message: "Entrada no encontrada" });

    ticket.validada = true;
    await ticket.save();

    res.json({ message: "Entrada validada exitosamente", ticket });
  } catch (error) {
    console.error("Error al validar la entrada:", error);
    res.status(500).json({
      message: "Error en el servidor, no se pudo validar la entrada.",
    });
  }
});

module.exports = router;
