// client/src/services/eventService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/events";

// Obtener todos los eventos
export const getAllEvents = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Crear un nuevo evento
export const createEvent = async (eventData) => {
  const response = await axios.post(API_URL, eventData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

// Obtener detalles de un evento por ID
export const getEventById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};
