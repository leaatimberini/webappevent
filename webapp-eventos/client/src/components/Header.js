// client/src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/register">Registrarse</Link>
        <Link to="/profile">Perfil</Link>
      </nav>
    </header>
  );
};

export default Header;
