# LatamPay Backend API

API REST para LatamPay - Plataforma de pagos y transferencias en Latinoamérica.

## Requisitos Previos

- Node.js 16+
- PostgreSQL 12+

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```
Actualiza los valores en `.env` con tus credenciales locales.

3. **Crear y poblar la base de datos:**
```bash
psql -U postgres -d latampay_db -f sql/schema.sql
psql -U postgres -d latampay_db -f sql/seed.sql
```

## Iniciar el Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints Principales

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener datos del usuario (requiere token) |

### Ejemplo: Register
```json
POST http://localhost:3000/api/auth/register
{
  "name": "Tu Nombre",
  "email": "tumail@example.com",
  "password": "TuContraseña123"
}
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente junto a su billetera y balances 🚀",
  "data": {
    "user": {
      "id": "uuid-generado",
      "name": "Tu Nombre",
      "email": "tumail@example.com",
      "role": "user"
    },
    "wallet": {
      "id": "uuid-generado",
      "cbu": "cbu-generado",
      "alias": "alias-generado"
    }
  }
}
```

### Ejemplo: Login
```json
POST http://localhost:3000/api/auth/login
{
  "email": "admin@latampay.com",
  "password": "Password123"
}
```

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Facundo Cliente",
      "email": "admin@latampay.com",
      "role": "user"
    },
    "token": "eyJhbGc..."
  }
}
```

## Estructura del Proyecto

```
Backend/
├── sql/               # Scripts SQL
│   ├── schema.sql     # Esquema de BD
│   └── seed.sql       # Datos de prueba
├── src/
│   ├── controllers/   # Lógica de endpoints
│   ├── services/      # Lógica de negocio
│   ├── routes/        # Definición de rutas
│   ├── middlewares/   # Middlewares (auth, admin)
│   ├── db/            # Conexión a BD
│   └── app.ts         # Configuración Express
├── package.json
├── .env.example       # Variables de entorno
└── README.md
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor en modo desarrollo
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor compilado
- `npm test` - Ejecuta tests

## Tecnologías

- Express.js
- TypeScript
- PostgreSQL
- Bcrypt (encriptación de contraseñas)
- JWT (tokens)

## Autor

Facundo - LatamPay Team 🚀
