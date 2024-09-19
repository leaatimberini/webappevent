// client/src/pages/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

const Register = () => {
  const [nombre, setNombre] = useState(""); // Cambiar "name" a "nombre"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      // Cambiar "name" a "nombre"
      await register({ nombre, email, password });
      navigate("/login"); // Redirigir al login tras el registro exitoso
    } catch (err) {
      setError("Error al registrar. Inténtalo de nuevo.");
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre} // Cambiar "name" a "nombre"
          onChange={(e) => setNombre(e.target.value)} // Cambiar "setName" a "setNombre"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Registrarse</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Register;
