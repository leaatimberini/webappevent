const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RRPP = sequelize.define("RRPP", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comision: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0, // Porcentaje de comisión
  },
});

module.exports = RRPP;
