# LatamPay Backend API 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18+-68a063?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6+-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-ffbb00?style=flat-square&logo=vitest)](https://vitest.dev/)
[![SOLID](https://img.shields.io/badge/Principles-SOLID-red?style=flat-square)](https://en.wikipedia.org/wiki/SOLID)

API REST robusta para **LatamPay**, una plataforma de pagos y transferencias diseñada para el mercado latinoamericano. Construida con un enfoque en escalabilidad, seguridad, tipos estrictos y **principios SOLID**.

## 🛠️ Tecnologías y Herramientas

*   **Runtime:** Node.js (v18+)
*   **Lenguaje:** TypeScript 6+
*   **Framework:** Express 5.2+ (Fast & Minimalist)
*   **Base de Datos:** PostgreSQL (Pool de conexiones gestionado)
*   **Autenticación:** JWT (JSON Web Tokens) & Bcrypt.js
*   **Validación de Datos:** Zod (Middleware de validación centralizado)
*   **Documentación:** Swagger (OpenAPI 3.0) con componentes reutilizables
*   **Asistente IA:** Google Gemini (Respuestas personalizadas y públicas)
*   **Testing:** Vitest 3+ & Supertest (34 tests de integración pasando)
*   **Tareas Programadas:** node-cron (Sincronización horaria de divisas)
*   **Logs & Tooling:** ts-node-dev, dotenv, CORS modularizado

## 🏗️ Arquitectura del Proyecto (SOLID & Clean Architecture)

El proyecto sigue una arquitectura de capas modularizada para garantizar el desacoplamiento y la facilidad de mantenimiento:

*   **`src/routes`**: Definición de endpoints con validación automática mediante middleware genérico.
*   **`src/controllers`**: Orquestación de peticiones y respuestas (Thin Controllers).
*   **`src/services`**: Lógica de negocio pura dividida por dominios (SRP):
    *   `transaction.service.ts`: Depósitos, retiros, transferencias e historial (con enriquecimiento de datos del emisor/receptor).
    *   `exchange.service.ts`: Sincronización de tasas y swaps de divisas.
    *   `wallet.service.ts`: Gestión de cuentas, búsqueda y contactos.
    *   `public-support.service.ts` y `user-support.service.ts`: Asistencia inteligente con IA para visitantes y usuarios registrados.
*   **`src/middlewares`**: Seguridad (Auth), validación (Zod) y gestión global de errores.
*   **`src/docs`**: Documentación interactiva Swagger modularizada con esquemas compartidos.
*   **`src/db`**: Capa de infraestructura para PostgreSQL con soporte para SSL en producción.
*   **`src/schemas`**: Definición de contratos de validación con Zod.
*   **`src/tests`**: Suite completa de pruebas de integración modularizada.
*   **`src/utils`**: Generadores (CBU/Alias) y tareas programadas.
*   **`src/types`**: Contratos de datos estrictos para asegurar el flujo de información (Type-Safe).

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
        VARCHAR description
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

1.  **`users` (Usuarios) y `wallets` (Billeteras) [1:1]**:
    *   **Relación**: Un registro en `users` tiene una única correspondencia en `wallets`.
    *   **Implementación**: La tabla `wallets` tiene una clave foránea `user_id` con una restricción `UNIQUE`.
    *   **Regla de Negocio**: Al eliminar un usuario, su billetera se elimina automáticamente (`ON DELETE CASCADE`). No puede haber una billetera sin dueño ni un usuario con dos billeteras.
2.  **`wallets` (Billeteras) y `balances` (Saldos) [1:N]**:
    *   **Relación**: Una `wallet` tiene múltiples registros en `balances` (uno por cada moneda).
    *   **Implementación**: La tabla `balances` referencia a `wallet_id`.
    *   **Regla de Negocio**: Un usuario puede ver sus fondos en ARS, COP y VES por separado. La restricción `unique_wallet_currency` evita que una misma billetera tenga dos balances para la misma moneda.
3.  **`currencies` (Monedas) y `balances` (Saldos) [1:N]**:
    *   **Relación**: Una `currency` está presente en muchos registros de `balances`.
    *   **Implementación**: `balances.currency_code` referencia a `currencies.code`.
    *   **Regla de Negocio**: Solo se pueden crear balances para monedas que existan previamente en la tabla `currencies`.
4.  **`wallets` (Billeteras) y `transactions` (Transacciones) [1:N]**:
    *   **Relación**: Una `wallet` puede ser el origen (`from_wallet_id`) o el destino (`to_wallet_id`) de muchas `transactions`.
    *   **Implementación**: La tabla `transactions` tiene dos claves foráneas que apuntan a `wallets(id)`.
    *   **Regla de Negocio**: Si una billetera se elimina, la transacción se conserva con el campo en nulo (`ON DELETE SET NULL`) para auditoría histórica.
5.  **`currencies` (Monedas) y `exchange_rates` (Tasas de Cambio) [1:N]**:
    *   **Relación**: Una `currency` participa en múltiples pares de `exchange_rates` (como origen o destino).
    *   **Implementación**: `exchange_rates` usa `from_currency` y `to_currency` apuntando a `currencies.code`.
    *   **Regla de Negocio**: Existe una restricción `unique_currency_pair` para asegurar una única tasa oficial por par de divisas.

### Lógica de Negocio Detallada

*   **Identidad y Billetera**: Cada usuario tiene una relación **1:1** con su billetera. Al registrarse, el sistema genera automáticamente un **CBU de 22 dígitos** y un **Alias único**, siguiendo estándares reales.
*   **Gestión Multi-Moneda**: Uso de una tabla de `balances` segregada para soportar múltiples divisas (ARS, COP, VES, etc.) por billetera.
*   **Transacciones Atómicas**: Registro de usuarios y operaciones financieras envueltos en transacciones SQL (**BEGIN/COMMIT**) para garantizar la integridad.
*   **Historial de Transacciones Enriquecido**: Para mayor claridad y trazabilidad, el historial de transferencias ahora incluye datos clave del emisor y receptor (nombre completo, alias y CBU).
*   **Sincronización de Divisas (API Externa)**: El sistema consume la API de [ExchangeRate-API](https://www.exchangerate-api.com/) para obtener tasas en tiempo real. Un **Cron Job** automatizado actualiza estos valores cada hora, permitiendo realizar conversiones (Swaps) precisas entre ARS, COP y VES.
*   **Asistente de Soporte con IA (Gemini)**: Se integra un chatbot inteligente para mejorar la experiencia del usuario, con dos modos de operación:
    *   **Chat Público**: Responde preguntas generales sobre el funcionamiento de LatamPay a visitantes no registrados, basado en un prompt con información clave del negocio.
    *   **Chat Privado**: Ofrece asistencia personalizada a usuarios autenticados, accediendo a su información de cuenta (nombre, alias, saldos) para dar respuestas precisas y contextuales sobre sus finanzas, sin poder realizar operaciones.
*   **Seguridad**: Hasheo de contraseñas con **Bcrypt.js** y protección de rutas mediante **JWT**.

## 🚀 Instalación y Configuración

### Entorno Local (Desarrollo)

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`.
    ```env
    PORT=3000
    DATABASE_URL=postgres://usuario:password@localhost:5432/latampay_db
    JWT_SECRET=tu_secreto_super_seguro
    NODE_ENV=development
    FRONTEND_URL=http://localhost:5173
    SERVER_URL=http://localhost:3000
    EXCHANGE_RATE_API_KEY=tu_api_key_de_exchangerate_api
    GEMINI_API_KEY=tu_gemini_api_key_aqui
    MOCK_BOT=true
    ```

3.  **Preparar Base de Datos:**
    Asegúrate de tener PostgreSQL corriendo y ejecuta los scripts:
    ```bash
    psql -U postgres -d latampay_db -f sql/schema.sql
    psql -U postgres -d latampay_db -f sql/seed.sql
    ```

4.  **Iniciar Servidor:**
    ```bash
    npm run dev
    ```

### 📜 Scripts Disponibles

*   `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática (`ts-node-dev`).
*   `npm run build`: Compila el código TypeScript a JavaScript plano en la carpeta `/dist`.
*   `npm start`: Ejecuta la versión compilada del proyecto (usado en producción).
*   `npm test`: Inicia la suite de tests en modo interactivo con Vitest.
*   `npm run test:run`: Ejecuta todos los tests una sola vez y entrega el reporte final de éxito.

---

## 🌐 Guía de Despliegue

### Backend (Railway)
*   **Repo:** Conecta tu repositorio de GitHub.
*   **Variables:** Configura `DATABASE_URL`, `JWT_SECRET`, `EXCHANGE_RATE_API_KEY` y `FRONTEND_URL` en el dashboard.
*   **PostgreSQL:** Puedes usar el plugin de Postgres de Railway.
*   **Comando de Inicio:** El sistema usará `npm start` automáticamente.

### Frontend (Vercel)
*   **Variables:** Define la URL de tu API de Railway en el frontend.
*   **CORS:** Asegúrate de que el dominio de Vercel esté en la lista de `FRONTEND_URL` del backend.

---

## 🔐 API Endpoints

La documentación interactiva completa está disponible en: 👉 **`http://localhost:3000/api-docs`**
--- | :--- | :--- | :--- |
| `GET` | `/` | Público | Verificación del estado del servidor. |
| `POST` | `/api/auth/register` | Público | Registro de usuario y billetera. |
| `POST` | `/api/auth/login` | Público | Login y obtención de JWT. |
| `POST` | `/api/support/public` | Público | Chat de ayuda para visitantes. |
| `POST` | `/api/support/user` | Privado | Chat de ayuda para usuarios logueados
| `GET` | `/` | Público | Verificación del estado del servidor. |
| `POST` | `/api/auth/register` | Público | Registro de usuario y billetera. |
| `POST` | `/api/auth/login` | Público | Login y obtención de JWT. |
| `GET` | `/api/auth/me` | Privado | Datos del perfil del usuario. |
| `GET` | `/api/exchange/rates` | Público | Ver tasas (ARS, COP, VES). |
| `POST` | `/api/exchange/swap` | Privado | Cambiar de moneda (ej: ARS a COP). |
| `POST` | `/api/exchange/sync` | Admin | Forzar actualización de tasas. |
| `GET` | `/api/wallets/me` | Privado | Ver CBU, Alias y saldos. |
| `GET` | `/api/wallets/lookup/:id` | Privado | Buscar destinatario por CBU o Alias. |
| `GET` | `/api/wallets/contacts` | Privado | Ver contactos frecuentes (ya transferidos). |
| `POST` | `/api/transactions/deposit` | Privado | Cargar fondos a la billetera (Simulado). |
| `POST` | `/api/transactions/withdraw` | Privado | Retirar fondos de la billetera (Simulado). |
| `POST` | `/api/transactions/transfer` | Privado | Enviar dinero a otro usuario. |
| `GET` | `/api/transactions/history` | Privado | Historial de transacciones paginado. |

### 💡 Tips para el Frontend
1.  **Seguridad:** Todas las rutas marcadas como `Privado` requieren el header `Authorization: Bearer [TOKEN]`.
2.  **Validación de Destinatario:** Antes de transferir, usa el endpoint de `lookup` para mostrar el nombre del dueño del CBU/Alias y dar seguridad al usuario.
3.  **Historial Dinámico:** El historial devuelve la dirección `direction: 'sent' | 'received'`, lo que permite pintar fácilmente los montos en Rojo o Verde.

---

## ✅ Funcionalidades Implementadas
*   [x] Autenticación JWT y Registro con creación automática de billetera.
*   [x] Billetera multidivisa (ARS, COP, VES).
*   [x] **Asistente de IA (Gemini)** con chat público y privado.
*   [x] Historial de transacciones con **datos enriquecidos** (nombre, alias y CBU del destinatario).
*   [x] Depósitos y **Retiros** de fondos con transacciones atómicas.
*   [x] Cambio de divisas (Swap) con tasas reales sincronizadas.
*   [x] Transferencias entre usuarios por CBU o Alias.
*   [x] **Buscador de destinatarios** y Agenda de contactos frecuentes.
*   [x] **Historial de transacciones** con paginación y dirección (sent/received).
*   [x] Tarea programada (Cron Job) para actualización de divisas.
*   [x] **Modularización basada en SOLID** y Clean Architecture.
*   [x] Cobertura de tests modularizada (**34 tests exitosos**).
*   [x] Sistema 100% **Type-Safe** (Eliminación de `any` y tipado estricto en servicios/DB).


## 🔒 Seguridad e Integridad
*   **Aislamiento de Transacciones:** Todas las operaciones que involucran dinero usan el motor de transacciones de PostgreSQL (`BEGIN/COMMIT/ROLLBACK`), garantizando que no se pierdan fondos ante fallos.
*   **Validación de Contratos:** Uso de **Zod** para asegurar que toda información entrante cumpla con los tipos y formatos requeridos antes de tocar la DB.
*   **Protección de Identidad:** Hasheo de passwords con **Bcrypt** y gestión de sesiones mediante **JWT** con tiempos de expiración configurables.
*   **CORS:** Configuración granular para permitir solo dominios autorizados y entornos de preview (Vercel).

---

## 🧪 Testing
```bash
# Ejecutar suite completa modularizada (Vitest + Supertest)
npm run test:run
```

---

## 📂 Estructura del Proyecto
```
LatamPay-Backend/
├── sql/               # Scripts SQL (Schema & Seed)
├── src/
│   ├── config/        # Configuración (Zod Validation)
│   ├── controllers/   # Controladores de la API
│   ├── db/            # Pool de conexiones
│   ├── docs/          # Configuración Swagger
│   ├── middlewares/   # Seguridad y Errores
│   ├── routes/        # Definición de Endpoints
│   ├── schemas/       # Validaciones de Entrada
│   ├── services/      # Lógica de Negocio y Transacciones
│   ├── tests/         # Suite de Pruebas Automáticas
│   ├── types/         # Definiciones de Tipos de TypeScript
│   ├── utils/         # Helpers y Cron Jobs
│   └── server.ts      # Punto de entrada
└── package.json       # Dependencias y Scripts
```

---

## ⚙️ Variables de Entorno (Tabla Completa)

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | URL de PostgreSQL | `postgres://user:pass@host:port/db` |
| `JWT_SECRET` | Llave para tokens | `mi_secreto_seguro_32_chars` |
| `NODE_ENV` | Entorno | `development` / `production` |
| `FRONTEND_URL` | Orígenes CORS permitidos | `http://localhost:5173` |
| `SERVER_URL` | URL base del servidor para Swagger | `http://localhost:3000` |
| `EXCHANGE_RATE_API_KEY` | Clave API de ExchangeRate | `tu_api_key_aqui` |
| `GEMINI_API_KEY` | Clave API de Google Gemini | `tu_gemini_api_key_aqui` |
| `MOCK_BOT` | Activa respuestas de prueba del bot | `true` / `false` |
