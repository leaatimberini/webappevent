// client/src/pages/EventDetails.js
import React, { useEffect, useState } from "react";
import { getEventById } from "../services/eventService";
import { useParams } from "react-router-dom";
import axios from "axios";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initPoint, setInitPoint] = useState(null); // Para almacenar el link de MercadoPago
  const [tipoEntrada, setTipoEntrada] = useState("general"); // Tipo de entrada
  const [cantidad, setCantidad] = useState(1); // Cantidad de entradas

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const data = await getEventById(id);
        setEvent(data);
      } catch (err) {
        setError("Error al cargar los detalles del evento");
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleBuyTicket = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/tickets",
        {
          eventId: id,
          tipo: tipoEntrada, // Enviar el tipo de entrada seleccionado
          precio: event.precio * cantidad, // Calcular el precio según la cantidad seleccionada
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Asegúrate de tener el token del usuario
          },
        }
      );

      if (response.data.init_point) {
        setInitPoint(response.data.init_point); // Guardar el enlace de MercadoPago
      } else {
        setError("Error: No se pudo generar el enlace de pago.");
      }
    } catch (err) {
      console.error("Error al procesar la compra:", err.response || err);
      setError("Error al procesar la compra");
    }
    setLoading(false);
  };

  if (!event) {
    return <p>Cargando detalles del evento...</p>;
  }

  return (
    <div>
      <h2>{event.nombre}</h2>
      <p>{event.descripcion}</p>
      <p>Fecha: {new Date(event.fecha).toLocaleDateString()}</p>
      <p>Precio por entrada: ${event.precio}</p>

      {error && <p>{error}</p>}

      <div>
        {/* Selección del tipo de entrada */}
        <label htmlFor="tipoEntrada">Tipo de Entrada:</label>
        <select
          id="tipoEntrada"
          value={tipoEntrada}
          onChange={(e) => setTipoEntrada(e.target.value)}>
          <option value="general">General</option>
          <option value="vip">VIP</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div>
        {/* Selección de la cantidad de entradas */}
        <label htmlFor="cantidad">Cantidad:</label>
        <input
          type="number"
          id="cantidad"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
      </div>

      {/* Si ya tenemos el initPoint, mostramos un link para pagar */}
      {initPoint ? (
        <a href={initPoint} target="_blank" rel="noopener noreferrer">
          Ir a Pagar
        </a>
      ) : (
        <button onClick={handleBuyTicket} disabled={loading}>
          {loading ? "Procesando..." : "Comprar Entradas"}
        </button>
      )}
    </div>
  );
};

export default EventDetails;
