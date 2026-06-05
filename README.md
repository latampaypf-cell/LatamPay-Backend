# LatamPay Backend API 🚀

API REST robusta para **LatamPay**, una plataforma de pagos y transferencias diseñada para el mercado latinoamericano. Construida con un enfoque en escalabilidad, seguridad y tipos estrictos.

## 🛠️ Tecnologías y Herramientas

*   **Runtime:** Node.js (v18+)
*   **Lenguaje:** TypeScript 5+
*   **Framework:** Express 5 (Beta)
*   **Base de Datos:** PostgreSQL
*   **Autenticación:** JWT (JSON Web Tokens) & Bcrypt.js
*   **Validación de Datos:** Zod
*   **Documentación:** Swagger (OpenAPI 3.0)
*   **Testing:** Vitest & Supertest
*   **Logs & Tooling:** ts-node-dev, dotenv, CORS

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura de capas clara para separar responsabilidades:

*   **`src/routes`**: Definición de endpoints y mapeo a controladores.
*   **`src/controllers`**: Orquestación de la petición, validación de entrada con Zod y envío de respuestas.
*   **`src/services`**: Lógica de negocio pura y comunicación con la base de datos (incluye manejo de transacciones).
*   **`src/middlewares`**: Protección de rutas, validación de roles y manejador global de errores.
*   **`src/db`**: Configuración del pool de conexiones a PostgreSQL.
*   **`src/utils`**: Clases de error personalizadas y generadores (CBU, Alias).

## 🗄️ Modelo de Datos (PostgreSQL)

La base de datos está diseñada para manejar múltiples divisas y transacciones atómicas:

1.  **`users`**: Almacena usuarios con roles (`user`, `admin`).
2.  **`wallets`**: Cada usuario posee una billetera única con CBU y Alias.
3.  **`currencies`**: Soporte para ARS, COP, VES (fiat) y extensible a crypto.
4.  **`balances`**: Saldos segregados por moneda dentro de cada billetera.
5.  **`transactions`**: Historial de depósitos, retiros, transferencias y swaps.
6.  **`exchange_rates`**: Tasas de cambio en tiempo real entre divisas.

### Diseño y Relaciones

#### Diagrama de Entidad-Relación

```mermaid
erDiagram
    %% --- FLUJO PRINCIPAL: USUARIO A BILLETERA ---
    users ||--|| wallets : "posee (1:1)"

    %% --- FLUJO DE FONDOS Y MOVIMENTOS ---
    wallets ||--o{ balances : "tiene (1:N)"
    wallets ||--o{ transactions : "envia (1:N)"
    wallets ||--o{ transactions : "recibe (1:N)"

    %% --- CONFIGURACIÓN DE MONEDAS (Separadas abajo) ---
    currencies ||--o{ exchange_rates : "de_moneda (1:N)"
    currencies ||--o{ exchange_rates : "a_moneda (1:N)"
    currencies ||--o{ balances : "moneda (1:N)"

    users {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR name
        VARCHAR role
        TIMESTAMP created_at
    }
    wallets {
        UUID id PK
        UUID user_id FK, UK
        VARCHAR cbu UK
        VARCHAR alias UK
        TIMESTAMP created_at
    }
    balances {
        UUID id PK
        UUID wallet_id FK
        VARCHAR currency_code FK
        NUMERIC amount
    }
    currencies {
        VARCHAR code PK
        VARCHAR name
        VARCHAR type
        INT decimals
    }
    exchange_rates {
        UUID id PK
        VARCHAR from_currency FK
        VARCHAR to_currency FK
        NUMERIC rate
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    transactions {
        UUID id PK
        VARCHAR type
        VARCHAR status
        UUID from_wallet_id FK
        UUID to_wallet_id FK
        VARCHAR from_currency
        VARCHAR to_currency
        NUMERIC from_amount
        NUMERIC to_amount
        NUMERIC exchange_rate
        TIMESTAMP created_at
    }
```

#### Resumen de Relaciones

| Tabla Origen | Tabla Destino | Cardinalidad | Clave Foránea | Comportamiento |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `wallets` | 1:1 | `user_id` | `CASCADE` (Borra todo) |
| `wallets` | `balances` | 1:N | `wallet_id` | `CASCADE` |
| `currencies` | `balances` | 1:N | `currency_code` | `RESTRICT` |
| `wallets` | `transactions` | 1:N | `from_wallet_id` | `SET NULL` (Historial) |
| `currencies` | `exchange_rates`| 1:N | `from_currency` | `RESTRICT` |

#### Descripción Detallada de Relaciones

1.  **Usuarios y Billeteras (1:1)**:
    *   **Relación**: Un Usuario tiene una única Billetera.
    *   **Implementación**: La tabla `wallets` tiene una clave foránea `user_id` con una restricción `UNIQUE`.
    *   **Regla de Negocio**: Al eliminar un usuario, su billetera se elimina automáticamente (`ON DELETE CASCADE`). No puede haber una billetera sin dueño ni un usuario con dos billeteras.
2.  **Billeteras y Balances (1:N)**:
    *   **Relación**: Una Billetera tiene múltiples Balances (uno por cada moneda).
    *   **Implementación**: La tabla `balances` referencia a `wallet_id`.
    *   **Regla de Negocio**: Un usuario puede ver sus fondos en ARS, COP y VES por separado. La restricción `unique_wallet_currency` evita que una misma billetera tenga dos registros para la misma moneda (ej. no puede tener dos balances de ARS).
3.  **Monedas y Balances (1:N)**:
    *   **Relación**: Una Moneda (Currency) está presente en muchos Balances.
    *   **Implementación**: `balances.currency_code` referencia a `currencies.code`.
    *   **Regla de Negocio**: Solo se pueden crear balances para monedas que existan previamente en la tabla `currencies`.
4.  **Billeteras y Transacciones (1:N)**:
    *   **Relación**: Una Billetera puede ser el origen (`from_wallet_id`) o el destino (`to_wallet_id`) de muchas Transacciones.
    *   **Implementación**: La tabla `transactions` tiene dos claves foráneas que apuntan a `wallets(id)`.
    *   **Regla de Negocio**: Si una billetera se elimina, la transacción no se borra, pero el campo se vuelve nulo (`ON DELETE SET NULL`) para mantener el historial contable.
### Descripción Detallada de Relaciones

1.  **Usuarios y Billeteras (1:1)**:
    *   **Relación**: Un Usuario tiene una única Billetera.
    *   **Implementación**: La tabla `wallets` tiene una clave foránea `user_id` con una restricción `UNIQUE`.
    *   **Regla de Negocio**: Al eliminar un usuario, su billetera se elimina automáticamente (`ON DELETE CASCADE`). No puede haber una billetera sin dueño ni un usuario con dos billeteras.
2.  **Billeteras y Balances (1:N)**:
    *   **Relación**: Una Billetera tiene múltiples Balances (uno por cada moneda).
    *   **Implementación**: La tabla `balances` referencia a `wallet_id`.
    *   **Regla de Negocio**: Un usuario puede ver sus fondos en ARS, COP y VES por separado. La restricción `unique_wallet_currency` evita que una misma billetera tenga dos registros para la misma moneda (ej. no puede tener dos balances de ARS).
3.  **Monedas y Balances (1:N)**:
    *   **Relación**: Una Moneda (Currency) está presente en muchos Balances.
    *   **Implementación**: `balances.currency_code` referencia a `currencies.code`.
    *   **Regla de Negocio**: Solo se pueden crear balances para monedas que existan previamente en la tabla `currencies`.
4.  **Billeteras y Transacciones (1:N)**:
    *   **Relación**: Una Billetera puede ser el origen (`from_wallet_id`) o el destino (`to_wallet_id`) de muchas Transacciones.
    *   **Implementación**: La tabla `transactions` tiene dos claves foráneas que apuntan a `wallets(id)`.
    *   **Regla de Negocio**: Si una billetera se elimina, la transacción no se borra, pero el campo se vuelve nulo (`ON DELETE SET NULL`) para mantener el historial contable.
5.  **Monedas y Tasas de Cambio (1:N)**:
    *   **Relación**: Una Moneda participa en múltiples pares de Tasas de Cambio (como origen o como destino).
    *   **Implementación**: `exchange_rates` usa `from_currency` y `to_currency` apuntando a `currencies.code`.
    *   **Regla de Negocio**: Existe una restricción `unique_currency_pair` para asegurar que solo haya una tasa oficial para el par ARS -> COP, por ejemplo.

### Lógica de Negocio Detallada

*   **Identidad y Billetera**: Cada usuario tiene una relación **1:1** con su billetera. Al registrarse, el sistema genera automáticamente un **CBU de 22 dígitos** y un **Alias único**, siguiendo estándares reales.
*   **Gestión Multi-Moneda**: Uso de una tabla de `balances` segregada para soportar múltiples divisas (ARS, COP, VES, etc.) por billetera.
*   **Transacciones Atómicas**: Registro de usuarios y operaciones financieras envueltos en transacciones SQL (**BEGIN/COMMIT**) para garantizar la integridad.
*   **Seguridad**: Hasheo de contraseñas con **Bcrypt.js** y protección de rutas mediante **JWT**.

## 🚀 Instalación y Configuración

1.  **Clonar el repositorio e instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Variables de Entorno:**
    Crea un archivo `.env` basado en `.env.example`:
    ```env
    PORT=3000
    DATABASE_URL=postgres://usuario:password@localhost:5432/latampay_db
    JWT_SECRET=tu_secreto_super_seguro
    NODE_ENV=development
    ```

3.  **Base de Datos:**
    Ejecuta los scripts SQL en orden para crear el schema y los datos iniciales:
    ```bash
    psql -U postgres -d latampay_db -f sql/schema.sql
    psql -U postgres -d latampay_db -f sql/seed.sql
    ```

4.  **Modo Desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Build y Producción:**
    ```bash
    # Transpilar a JavaScript
    npm run build
    
    # Iniciar en producción
    npm start
    ```

## 🧪 Testing

El proyecto cuenta con una suite de pruebas automatizadas utilizando **Vitest** y **Supertest**, cubriendo integración y unidad.

*   **Tests de Integración**: Flujos completos de registro, login y perfiles protegidos.
*   **Tests de Middlewares**: Validación de tokens JWT, control de acceso de administradores y manejo global de errores.
*   **Tests Unitarios**: Generadores de CBU/Alias y utilidades.

Para ejecutar los tests:
```bash
# Ejecución única (Modo CI)
npm run test:run

# Modo observación (Desarrollo)
npm test
```

## 🔐 API Endpoints (Principales)

La documentación interactiva y detallada de la API (Swagger) está disponible en:
👉 **`http://localhost:3000/api-docs`**

### Autenticación (`/api/auth`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Público | Crea usuario + billetera + balances iniciales. |
| `POST` | `/login` | Público | Valida credenciales y retorna JWT. |
| `GET` | `/me` | Privado | Retorna el perfil del usuario autenticado. |

#### Ejemplos de Uso

**1. Registro de Usuario (`POST /register`)**
*   **Body:**
    ```json
    {
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "password": "Password123"
    }
    ```
*   **Respuesta (201):**
    ```json
    {
      "status": "success",
      "message": "Usuario registrado exitosamente junto a su billetera y balances 🚀",
      "data": {
        "user": { "id": "uuid", "name": "Juan Pérez", "email": "juan@example.com", "role": "user" },
        "wallet": { "id": "uuid", "cbu": "22-dígitos", "alias": "latampay.juanperez.123" }
      }
    }
    ```

**2. Inicio de Sesión (`POST /login`)**
*   **Body:**
    ```json
    {
      "email": "juan@example.com",
      "password": "Password123"
    }
    ```
*   **Respuesta (200):**
    ```json
    {
      "status": "success",
      "data": {
        "user": { "id": "uuid", "name": "Juan Pérez", "email": "juan@example.com", "role": "user" },
        "token": "eyJhbGciOiJIUzI1NiI..."
      }
    }
    ```

**3. Perfil de Usuario (`GET /me`)**
*   **Headers:** `Authorization: Bearer <token>`
*   **Respuesta (200):**
    ```json
    {
      "status": "success",
      "message": "¡Acceso concedido! Tu sesión es válida 🔐",
      "user": { "id": "uuid", "email": "juan@example.com", "role": "user" }
    }
    ```

---

## 📂 Estructura del Proyecto

```
LatamPay-Backend/
├── sql/               # Scripts de Base de Datos
│   ├── schema.sql     # Definición de tablas e índices
│   └── seed.sql       # Datos iniciales (Monedas, Tasas, Admin)
├── src/
│   ├── config/        # Variables de entorno y constantes
│   ├── controllers/   # Manejo de peticiones y respuestas
│   ├── db/            # Pool de conexiones a Postgres
│   ├── docs/          # Configuración de Swagger/OpenAPI
│   ├── middlewares/   # Auth, Admin y Error Handler
│   ├── routes/        # Definición de rutas Express
│   ├── schemas/       # Validaciones con Zod
│   ├── services/      # Lógica de negocio y queries SQL
│   ├── tests/         # Suite de pruebas (Vitest + Supertest)
│   ├── types/         # Definiciones de TypeScript
│   ├── utils/         # Helpers (AppError, Generators)
│   ├── app.ts         # Configuración del servidor
│   └── server.ts      # Punto de entrada (Listen)
├── tsconfig.json      # Configuración de TypeScript
└── package.json       # Scripts y dependencias
```

## ⚙️ Variables de Entorno

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto donde corre el servidor | `3000` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgres://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Llave secreta para firmar tokens | `mi_secreto_123` |
| `NODE_ENV` | Entorno (development/production) | `development` |
| `FRONTEND_URL` | URL permitida por CORS (Soporta múltiples URLs separadas por coma) | `http://localhost:5173,https://tu-app.vercel.app` |

---

