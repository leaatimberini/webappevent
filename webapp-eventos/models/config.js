const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Config = sequelize.define("Config", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_pagina: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dominio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  formas_pago: {
    type: DataTypes.JSON, // Ejemplo: ['Mercado Pago', 'Transferencia', 'Efectivo']
    allowNull: false,
  },
  titulo_seo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion_seo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  meta_pixel: {
    type: DataTypes.STRING, // Código del pixel de Meta (opcional)
    allowNull: true,
  },
  google_analytics: {
    type: DataTypes.STRING, // Código de Google Analytics (opcional)
    allowNull: true,
  },
});

module.exports = Config;
