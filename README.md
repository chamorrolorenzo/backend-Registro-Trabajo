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
- bcryptjs
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
src/
├── config        → conexión DB / env
├── controllers  → lógica de negocio
├── interfaces   → tipado TS
├── middlewares  → auth / errores
├── models       → mongoose schemas
├── routes       → endpoints
├── schemas      → validaciones Zod   
├── services     → lógica separada
├── types        → tipos globales
├── utils        → helpers
├── App.ts
└── index.ts

---

# Instalación

## Requisitos

- Node.js instalado
- MongoDB local o MongoDB Atlas
---

## Paso 1 – Instalar dependencias

```npm install
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

```npm run dev
```

El servidor quedará disponible en:

```
http://localhost:3002
```
---
---

## Registro de usuarios

El sistema implementa una validación adicional por lógica de negocio real.
Para poder registrarse correctamente, el campo `company` debe contener exactamente el siguiente valor:
"Vial Jaime"

Esta validación simula una condición empresarial utilizada actualmente en un entorno real de prueba.
Si el valor enviado en `company` es diferente, el registro será rechazado.

### Ejemplo de registro válido

POST /auth/register

```json
{
  "username": "usuario",
  "password": "123456",
  "company": "Vial Jaime"
}

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

```Authorization: Bearer JWT_TOKEN
```

---

# Filtrado mediante Query Params

La API permite filtrar resultados utilizando por parámetros de consulta (query params) en las rutas GET.
Esto permite recuperar registros específicos sin necesidad de crear nuevos endpoints, aplicando filtros dinámicos sobre los datos almacenados.

## Ejemplos

### Filtrar viajes por rango de fechas

GET /trips?startDate=2026-01-01&endDate=2026-01-31
Devuelve únicamente los viajes comprendidos dentro del rango de fechas indicado.

---

## Implementación

Los parámetros enviados en `req.query` son procesados en el controlador y utilizados para construir dinámicamente el objeto de búsqueda en MongoDB.

Esto permite:
- Filtrado dinámico
- Consultas más eficientes
- Mayor flexibilidad sin crear nuevos endpoints

### Ejemplo de uso de Query Params

Filtrar horas trabajadas por rango de fechas:
GET /hours?from=2026-01-01&to=2026-01-31
Este request devuelve únicamente los registros comprendidos dentro del período indicado.
También es posible combinar parámetros para realizar búsquedas más específicas sin crear nuevos endpoints, aprovechando el filtrado dinámico implementado en el backend.

# Cómo probar el CRUD

El CRUD puede probarse utilizando cualquier cliente HTTP (Thunder, Postman, Bruno, etc.).
Además, el proyecto incluye archivos: test/trips, test/hours, test/users.

---

## Carpeta /test

El proyecto incluye una carpeta `/test` con archivos `.http` para probar los endpoints directamente desde VSCode (usando la extensión REST Client) o como referencia para otros clientes HTTP.

Contiene:
- users.http → registro y login de usuarios  
- hours.http → operaciones CRUD sobre horas trabajadas  
- trips.http → operaciones CRUD sobre viajes  

Estos archivos permiten ejecutar requests rápidamente sin necesidad de Postman o Bruno, facilitando el testing manual de la API durante el desarrollo.

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

---

# Resultado final

El sistema implementa correctamente:
- Autenticación JWT
- Protección de rutas por usuario
- CRUD completo
- Persistencia en MongoDB
- Arquitectura MVC
- Manejo centralizado de errores

Todos los endpoints fueron verificados localmente.

---

Trabajo práctico final.