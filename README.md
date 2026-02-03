# 📘 Registro de Trabajo – Backend API

## 📌 Introducción

**Registro de Trabajo** es una API REST desarrollada con **Node.js, Express y MongoDB**, cuyo objetivo es permitir el registro, consulta, modificación y eliminación de información relacionada con **horas trabajadas** y **viajes realizados** por usuarios autenticados.

El sistema implementa operaciones **CRUD completas (Create, Read, Update, Delete)** sobre entidades protegidas, aplicando autenticación segura mediante **JSON Web Tokens (JWT)** y siguiendo el patrón de arquitectura **MVC (Modelo – Controlador – Rutas)**.

Cada usuario autenticado solo puede operar sobre sus propios registros, garantizando control de acceso y seguridad desde el backend.

---

##  Objetivos del proyecto

### Objetivo general
Desarrollar una API REST segura y modular que implemente operaciones CRUD completas sobre entidades asociadas a usuarios autenticados.

### Objetivos específicos
- Integrar **Express** con **MongoDB** utilizando **Mongoose**.
- Implementar autenticación segura con **JWT** y encriptación de contraseñas con **bcrypt**.
- Aplicar correctamente el patrón de arquitectura **MVC**.
- Desarrollar endpoints públicos y privados.
- Implementar **CRUD completo** sobre entidades protegidas.
- Proteger los recursos según el usuario autenticado.
- Centralizar el manejo de errores mediante middleware.
- Documentar correctamente la API y su funcionamiento.

---

##  Tecnologías utilizadas

- **Node.js** – Entorno de ejecución JavaScript.
- **Express** – Framework para la creación de APIs REST.
- **MongoDB** – Base de datos NoSQL.
- **Mongoose** – ODM para modelado y validación de datos.
- **JSON Web Tokens (JWT)** – Autenticación basada en tokens.
- **bcrypt** – Hashing de contraseñas.
- **dotenv** – Manejo de variables de entorno.
- **cors** – Control de acceso.
- **Thunder Client** – Testing de endpoints.

---

##  Arquitectura 

El proyecto sigue el patrón **MVC**, separando responsabilidades de la siguiente manera:

- **Modelos**: Definen la estructura de los datos y validaciones.
- **Controladores**: Implementan la lógica de negocio y las operaciones CRUD.
- **Rutas**: Exponen los endpoints HTTP.
- **Middlewares**: Manejan autenticación, autorización y errores.

### Estructura de carpetas

```txt
src/
├── config/          # Configuración de MongoDB
├── models/          # Modelos de Mongoose (User, Company, Hour, Trip)
├── controllers/     # Lógica de negocio y CRUD
├── routes/          # Endpoints de la API
├── services/        # Lógica reutilizable
├── middlewares/     # Autenticación y manejo de errores
├── app.js           # Configuración principal de Express
└── index.js         # Punto de entrada del servidor
