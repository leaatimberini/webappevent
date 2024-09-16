const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tipo: {
    type: DataTypes.STRING, // Ej: General, VIP, etc.
    allowNull: false,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  codigo_qr: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Ticket;
