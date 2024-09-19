// client/src/pages/Home.js
import React, { useEffect, useState } from "react";
import { getAllEvents } from "../services/eventService";
import { Link } from "react-router-dom";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        console.log(data); // Verificar los datos recibidos
        setEvents(data.events); // Acceder a la clave 'events' en la respuesta
      } catch (err) {
        setError("Error al cargar los eventos");
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h2>Lista de Eventos</h2>
      {error && <p>{error}</p>}
      <ul>
        {events.length > 0 ? (
          events.map((event) => (
            <li key={event.id}>
              <h3>{event.nombre}</h3>
              <p>{event.descripcion}</p>
              <p>Fecha: {new Date(event.fecha).toLocaleDateString()}</p>
              <p>Organizador: {event.organizador}</p>
              <p>Precio: ${event.precio}</p>
              <Link to={`/events/${event.id}`}>Ver detalles</Link>
            </li>
          ))
        ) : (
          <p>No hay eventos disponibles.</p>
        )}
      </ul>
    </div>
  );
};

export default Home;
