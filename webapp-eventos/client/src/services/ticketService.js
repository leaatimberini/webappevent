// client/src/services/ticketService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/tickets";

// Comprar una entrada
export const buyTicket = async (ticketData) => {
  const response = await axios.post(API_URL, ticketData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};
