// client/src/utils/axiosInstance.js
import axios from "axios";

// Crear una instancia de Axios con la configuración base del backend
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000/api", // Asegúrate que esta URL sea la del backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Añadir interceptor para adjuntar el token de autenticación en cada request (si existe)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtener token de localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
