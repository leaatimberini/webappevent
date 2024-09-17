const express = require("express");
const { Event } = require("../models");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const { check, validationResult } = require("express-validator");
const router = express.Router();

// Crear un nuevo evento con validaciones (solo administradores u organizadores)
router.post(
  "/",
  auth,
  checkRole(["admin", "organizador"]),
  [
    check("nombre", "El nombre del evento es obligatorio").not().isEmpty(),
    check("descripcion", "La descripción es obligatoria").not().isEmpty(),
    check(
      "fecha",
      "La fecha del evento es obligatoria y debe ser válida"
    ).isISO8601(),
    check("precio", "El precio debe ser un número válido").isFloat({ gt: 0 }),
    check("organizador", "El nombre del organizador es obligatorio")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, descripcion, fecha, precio, organizador } = req.body;

    try {
      const newEvent = await Event.create({
        nombre,
        descripcion,
        fecha,
        precio,
        organizador,
      });

      res.status(201).json({
        message: "Evento creado exitosamente",
        event: newEvent,
      });
    } catch (error) {
      console.error("Error al crear el evento:", error);
      res
        .status(500)
        .json({ message: "Error en el servidor, no se pudo crear el evento." });
    }
  }
);

// Obtener todos los eventos
router.get("/", async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    console.error("Error al obtener los eventos:", error);
    res
      .status(500)
      .json({
        message: "Error en el servidor, no se pudieron obtener los eventos.",
      });
  }
});

// Obtener un evento por su ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado." });
    }
    res.json(event);
  } catch (error) {
    console.error("Error al obtener el evento:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor, no se pudo obtener el evento." });
  }
});

// Actualizar un evento (solo administradores u organizadores)
router.put(
  "/:id",
  auth,
  checkRole(["admin", "organizador"]),
  [
    check("nombre", "El nombre del evento es obligatorio")
      .optional()
      .not()
      .isEmpty(),
    check("descripcion", "La descripción es obligatoria")
      .optional()
      .not()
      .isEmpty(),
    check("fecha", "La fecha del evento debe ser válida")
      .optional()
      .isISO8601(),
    check("precio", "El precio debe ser un número válido")
      .optional()
      .isFloat({ gt: 0 }),
    check("organizador", "El nombre del organizador es obligatorio")
      .optional()
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Evento no encontrado." });
      }

      const { nombre, descripcion, fecha, precio, organizador } = req.body;

      // Actualizar el evento
      event.nombre = nombre || event.nombre;
      event.descripcion = descripcion || event.descripcion;
      event.fecha = fecha || event.fecha;
      event.precio = precio || event.precio;
      event.organizador = organizador || event.organizador;

      await event.save();

      res.json({ message: "Evento actualizado exitosamente", event });
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      res
        .status(500)
        .json({
          message: "Error en el servidor, no se pudo actualizar el evento.",
        });
    }
  }
);

// Eliminar un evento (solo administradores)
router.delete("/:id", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado." });
    }

    await event.destroy();
    res.json({ message: "Evento eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    res
      .status(500)
      .json({
        message: "Error en el servidor, no se pudo eliminar el evento.",
      });
  }
});

module.exports = router;
