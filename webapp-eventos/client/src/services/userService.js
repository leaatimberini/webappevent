// client/src/services/userService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // Asegúrate de que la URL sea correcta

// Obtener el perfil del usuario autenticado
export const getUserProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Actualizar el perfil del usuario
export const updateUserProfile = async (userData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_URL}/profile`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
