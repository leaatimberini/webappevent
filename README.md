# WebApp de Eventos

Este proyecto es una aplicación web para la gestión de eventos, venta de entradas y administración de usuarios. La plataforma permite a los usuarios autenticarse, registrarse en eventos, comprar entradas, y gestionar su perfil, mientras que los administradores y organizadores pueden crear y gestionar eventos.

## Características Principales

- **Gestión de usuarios**: Registro, inicio de sesión, y cambio de contraseña.
- **Venta de entradas**: Integración con MercadoPago para comprar entradas a eventos.
- **Gestión de eventos**: Creación, actualización y eliminación de eventos.
- **Autenticación y roles**: Autenticación JWT con roles de usuario y administrador.
- **Panel de administración**: Funcionalidades adicionales para usuarios con rol de administrador.
- **Recuperación de contraseña**: Solicitud y restablecimiento de contraseña por email.
- **Imagen de perfil**: Subida y visualización de imágenes de perfil de usuario.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de datos**: MySQL con Sequelize ORM
- **Autenticación**: JWT (JSON Web Token)
- **Emailing**: Nodemailer para envío de emails
- **Pagos**: MercadoPago para procesamiento de pagos
- **Subida de archivos**: Multer para manejo de archivos de usuario (imágenes de perfil)
- **Validación**: Express-validator para validar entradas de datos
- **Frontend**: Se puede integrar con cualquier framework de frontend (React, Angular, etc.)

## Requisitos

- Node.js v14 o superior
- MySQL
- Cuenta de MercadoPago
- Variables de entorno (ver archivo `.env`)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/leaatimberini/webappevent.git
   ```
