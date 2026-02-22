# Registro de Trabajo – Backend API

## Descripción

Registro de Trabajo es una API REST desarrollada con Node.js, Express y MongoDB.  
Permite registrar, consultar, modificar y eliminar viajes y horas trabajadas por usuarios autenticados.

La API implementa:

- Autenticación con JWT
- Protección de rutas
- CRUD completo
- Arquitectura MVC
- Manejo centralizado de errores

Cada usuario autenticado solo puede operar sobre sus propios registros.
---

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- dotenv
- cors
- ZOD
---

## Validación y manejo de errores

La API utiliza Zod para validar los datos de entrada en los endpoints.
Si los datos no cumplen el esquema definido, se devuelve un error 400 con el detalle correspondiente.

El manejo de errores está centralizado mediante un middleware global.

## Arquitectura

El proyecto sigue el patrón MVC:

- models → estructura y validación de datos
- controllers → lógica de negocio
- routes → definición de endpoints
- middlewares → autenticación y manejo de errores

Estructura del proyecto:
```
src/
├── config/
├── models/
├── controllers/
├── routes/
├── services/
├── middlewares/
├── app.js
└── index.js
```
---

# Instalación

## Requisitos

- Node.js instalado
- MongoDB local o MongoDB Atlas
---

## Paso 1 – Instalar dependencias

```bash
npm install
```
---

## Paso 2 – Crear archivo .env

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
PORT=3002
MONGO_URI=TU_URI_DE_MONGO
JWT_SECRET=TU_CLAVE_SECRETA
```
---

## Paso 3 – Levantar el servidor

```bash
npm run dev
```

El servidor quedará disponible en:

```
http://localhost:3002
```

---

# Autenticación

Antes de utilizar cualquier ruta protegida es necesario realizar login.

## Login

Endpoint:

```
POST /auth/login
```

Body:

```json
{
  "usuario": "TU_USUARIO",
  "password": "TU_PASSWORD"
}
```

Respuesta esperada:

```json
{
  "token": "JWT_TOKEN"
}
```

Copiar el token.

Todas las rutas protegidas requieren el siguiente header:

```
Authorization: Bearer JWT_TOKEN
```

# Cómo probar el CRUD

El CRUD puede probarse utilizando cualquier cliente HTTP (Thunder, Postman, Bruno, etc.).

Además, el proyecto incluye archivos: test/trips, test/hours, test/users.
---

# Cómo probar el sistema

1. Levantar el backend con `npm run dev`
2. Realizar login en `/auth/login`
3. Copiar el token
4. Enviar el header `Authorization: Bearer TOKEN`
5. Ejecutar las operaciones CRUD

Puede probarse con:

- Thunder Client
- Postman
- Bruno
- curl

El proyecto incluye opcionalmente una carpeta `/tests` con archivos `.http` para ejecutar requests desde VSCode usando REST Client.

---

# Resultado final

El sistema implementa correctamente:

- Autenticación JWT
- Protección de rutas por usuario
- CRUD completo en Trips, Hours y Users
- Persistencia en MongoDB
- Arquitectura MVC
- Manejo centralizado de errores

Todos los endpoints fueron verificados localmente.

---

Trabajo práctico final.