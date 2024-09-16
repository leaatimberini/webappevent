const User = require("./User");
const Event = require("./Event");
const Ticket = require("./Ticket");
const RRPP = require("./RRPP");
const Config = require("./config"); // Importar Config

// Relación de Usuario con Entradas
User.hasMany(Ticket, { foreignKey: "userId" });
Ticket.belongsTo(User, { foreignKey: "userId" });

// Relación de Evento con Entradas
Event.hasMany(Ticket, { foreignKey: "eventId" });
Ticket.belongsTo(Event, { foreignKey: "eventId" });

// Relación de RRPP con Entradas (ventas hechas por RRPP)
RRPP.hasMany(Ticket, { foreignKey: "rrppId" });
Ticket.belongsTo(RRPP, { foreignKey: "rrppId" });

// Exportar todos los modelos en un solo bloque
module.exports = { User, Event, Ticket, RRPP, Config };
