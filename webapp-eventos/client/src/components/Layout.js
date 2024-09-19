// client/src/components/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Renderiza el contenido de las rutas */}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
