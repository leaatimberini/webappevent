// client/src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // Actualizar a '/api/users'

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// client/src/services/authService.js
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);

  // Guardar el token en el localStorage
  localStorage.setItem("token", response.data.token);

  return response.data;
};

export const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};
