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
*   **Emailing:** AWS SES (Amazon Simple Email Service) con soporte para modo Mock
*   **Procesos en Segundo Plano:** node-cron (Worker para sincronización horaria de divisas)
*   **Testing:** Vitest 3+ & Supertest (Tests de integración pasando)
*   **Logs & Tooling:** ts-node-dev, dotenv, CORS modularizado

## 🚀 Instalación y Configuración (Local)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/LatamPay-Backend.git
cd LatamPay-Backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example` y completa los valores requeridos (Database URL, JWT Secret, Gemini API Key, etc.).

### 4. Inicializar la Base de Datos (PostgreSQL)
Asegúrate de tener PostgreSQL corriendo y crea una base de datos llamada `latampay_db`. Luego, ejecuta los scripts en el siguiente orden:

```bash
# 1. Crear la estructura de tablas
psql -U postgres -d latampay_db -f sql/schema.sql

# 2. Cargar datos básicos y usuarios de prueba
psql -U postgres -d latampay_db -f sql/seed.sql

> ⚠️ **Seguridad:** El seed incluye un administrador por defecto (`admin@latampay.com` / `Password123`). Estas credenciales son **solo para desarrollo**. En producción, se debe cambiar la contraseña inmediatamente tras el despliegue.

# 3. (Opcional) Cargar historial de cotizaciones de 30 días para gráficos
psql -U postgres -d latampay_db -f sql/seed-cotizacion.sql
```

### 5. Iniciar el servidor
```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm run build
npm start
```

## 🧪 Testing

La suite de pruebas utiliza **Vitest**. Para ejecutar los tests:

```bash
# Correr todos los tests
npm run test

# Correr tests con reporte de cobertura
npm run test:coverage
```

## 📖 Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de Swagger en:
`http://localhost:3000/api-docs`

## 🏗️ Arquitectura del Proyecto (SOLID & Clean Architecture)

El proyecto sigue una arquitectura de capas modularizada para garantizar el desacoplamiento y la facilidad de mantenimiento:

*   **`src/routes`**: Definición de endpoints con validación automática mediante middleware genérico.
*   **`src/controllers`**: Orquestación de peticiones y respuestas (Thin Controllers).
*   **`src/services`**: Lógica de negocio pura dividida por dominios (SRP):
    *   `transaction.service.ts`: Depósitos, retiros, transferencias e historial (con enriquecimiento de datos del emisor/receptor y notificaciones por email).
    *   `exchange.service.ts`: Sincronización de tasas, swaps de divisas y avisos por correo.
    *   `auth.service.ts`: Gestión de usuarios, login, registro y actualización de perfil unificado.
    *   `email.service.ts`: Proveedor de correos modular (SES/Mock).
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
5.  **`transactions`**: Historial completo con registro de comisiones (`fee`).
6.  **`exchange_rates`**: Tasas de cambio en tiempo real entre divisas.

### 💰 Modelo de Monetización
La plataforma implementa un margen de ganancia automático mediante comisiones:
*   **Comisión Fija:** 3% sobre el monto de la operación.
*   **Operaciones Sujetas a Cargo:** Retiros (`withdraw`) e Intercambios de divisa (`swap`).
*   **Flujo de Tesorería:** Las comisiones se acreditan automáticamente en tiempo real a la billetera del **Usuario Administrador** (`ADMIN_ID: 11111111...`), permitiendo una trazabilidad completa de los ingresos de la plataforma por cada moneda soportada.

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
        NUMERIC fee
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
*   **Notificaciones Automáticas (Email)**: Sistema de avisos integrado para eventos críticos:
    *   **Bienvenida**: Al registrarse.
    *   **Seguridad**: Al actualizar la contraseña del perfil.
    *   **Transacciones**: Confirmación de depósitos, alertas de retiros (con desglose de comisión del 3%), comprobantes de envío y avisos de recepción de dinero.
    *   **Conversiones**: Resumen detallado de intercambios de divisa (Swaps) con cálculo de tasa y comisión aplicada.
*   **Transparencia Financiera**: En todas las operaciones sujetas a cargos (Retiros y Swaps), el sistema garantiza la precisión mediante redondeo a 2 decimales y comunica el costo del servicio tanto en la respuesta de la API como en las notificaciones automáticas al usuario.
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
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=tu_aws_key
    AWS_SECRET_ACCESS_KEY=tu_aws_secret
    AWS_SES_FROM_EMAIL=tu_email_verificado@ejemplo.com
    ENABLE_EMAIL_MOCK=true
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

| Método | Ruta | Acceso | Datos Requeridos | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Público | - | Verificación del estado del servidor. |
| `GET` | `/health` | Público | - | Health Check para monitoreo. |
| `POST` | `/api/auth/register` | Público | `email, name, password` | Registro de usuario y billetera. |
| `POST` | `/api/auth/login` | Público | `email, password` | Login y obtención de JWT. |
| `GET` | `/api/auth/me` | Privado | - | Verificación rápida de sesión. |
| `PATCH` | `/api/auth/profile` | Privado | `name?, alias?, password?` | Actualizar perfil unificado. |
| `POST` | `/api/support/info` | Público | `message, history?` | Chat de ayuda para visitantes. |
| `POST` | `/api/support/chat` | Privado | `message, history?` | Chat de ayuda con datos del usuario. |
| `GET` | `/api/exchange/rates` | Público | - | Ver tasas (ARS, COP, VES). |
| `GET` | `/api/exchange/history` | Público | `from, to` (query) | Historial para gráficos de cotización. |
| `POST` | `/api/exchange/swap` | Privado | `from, to, amount` | Cambiar de moneda (ej: ARS a COP). |
| `POST` | `/api/exchange/sync` | Admin | - | Forzar actualización de tasas. |
| `GET` | `/api/wallets/me` | Privado | - | Ver CBU, Alias y saldos. |
| `GET` | `/api/wallets/lookup/:identifier` | Privado | `:identifier` (CBU/Alias) | Buscar destinatario. |
| `GET` | `/api/wallets/contacts` | Privado | - | Ver contactos frecuentes. |
| `POST` | `/api/transactions/deposit` | Privado | `amount, currency_code` | Cargar fondos. |
| `POST` | `/api/transactions/withdraw` | Privado | `amount, currency_code` | Retirar fondos. |
| `POST` | `/api/transactions/transfer` | Privado | `to_id, amount, currency` | Enviar dinero a otro usuario. |
| `GET` | `/api/transactions/history` | Privado | `page?, limit?` (query) | Historial paginado. |

### 💡 Tips para el Frontend
1.  **Seguridad:** Todas las rutas marcadas como `Privado` requieren el header `Authorization: Bearer [TOKEN]`.
2.  **Manejo de Decimales:** El backend redondea todos los montos y comisiones a **2 decimales**. Se recomienda que el frontend aplique la misma lógica para evitar discrepancias visuales.
3.  **Validación de Destinatario:** Antes de transferir, usa el endpoint de `lookup` para mostrar el nombre del dueño del CBU/Alias.
4.  **Historial Dinámico:** El historial devuelve la dirección `direction: 'sent' | 'received'`, facilitando el uso de colores (Rojo/Verde).

---

## 🤖 Funcionamiento del Chatbot (IA)

El asistente virtual utiliza Google Gemini y opera en dos modalidades de **Alta Disponibilidad** (sin límites de frecuencia) para asistir al usuario:

*   **Chat Público (`/api/support/info`)**:
    *   **Uso**: Ideal para la Landing Page o antes del Login.
    *   **Contexto**: Solo tiene información general sobre LatamPay.
    *   **Historial**: El Frontend puede enviar un array `history` para que la IA recuerde los mensajes anteriores de la sesión actual.
*   **Chat Privado (`/api/support/chat`)**:
    *   **Uso**: Dentro del Dashboard del usuario.
    *   **Contexto**: La IA recibe automáticamente el **Nombre, Alias, CBU y Saldos Reales** del usuario.
    *   **Capacidad**: Puede responder preguntas como "¿Cuál es mi CBU?", "¿Cuánto tengo en pesos argentinos?" o "¿Cómo puedo transferir?".
    *   **Seguridad**: La IA tiene prohibido realizar transacciones; solo informa.

---

## 📧 Eventos de Correo Electrónico

El backend dispara correos automáticos (vía AWS SES) en los siguientes eventos. El Frontend no necesita llamar a ningún endpoint extra para enviarlos:

| Evento | Destinatario | Contenido del Correo |
| :--- | :--- | :--- |
| **Registro** | Usuario nuevo | Bienvenida a la plataforma y confirmación de creación de billetera. |
| **Seguridad** | Usuario logueado | Aviso inmediato cuando se cambia la contraseña desde el perfil. |
| **Depósito** | Dueño de la cuenta | Confirmación de que los fondos se han acreditado exitosamente. |
| **Retiro** | Dueño de la cuenta | Alerta de seguridad informando que se ha extraído dinero. |
| **Intercambio (Swap)** | Dueño de la cuenta | Resumen de la conversión realizada (ej. ARS a COP) con la tasa aplicada. |
| **Transferencia (Envío)** | Emisor | Comprobante digital de la transferencia con los datos del destino. |
| **Transferencia (Recepción)** | Receptor | Notificación de "Dinero Recibido" con el nombre de quién lo envió. |

---

## 🎨 Personalización de Correos (Diseño)

El diseño de todos los correos electrónicos está centralizado para facilitar cambios de marca o estilo por parte del equipo de Frontend o Diseño.

*   **Archivo Maestro**: `src/utils/email-templates.ts`
*   **Layout Base**: Existe una función `baseLayout` que define el encabezado, pie de página, tipografía y colores globales. Cambiar el color aquí afectará a todos los correos.
*   **Variables Dinámicas**: Al editar el HTML, se deben respetar los nombres de las variables inyectadas (ej: `${name}`, `${amount}`, `${currency}`) para que la información real de la base de datos siga apareciendo.
*   **Previsualización**: Si el backend tiene `ENABLE_EMAIL_MOCK=true`, el HTML resultante se imprimirá en la terminal cada vez que se dispare un evento. Se puede copiar ese código a un archivo `.html` para verlo en el navegador.

---

## ✅ Funcionalidades Implementadas
*   [x] **Autenticación y Perfil**: JWT, Registro automático de billetera y edición de perfil (Nombre/Alias).
*   [x] **Billetera Multidivisa**: Gestión de balances independientes en ARS, COP y VES.
*   [x] **Notificaciones por Email**: Sistema automático vía AWS SES para transacciones, bienvenida y seguridad.
*   [x] **Asistente de IA (Gemini)**: Chat inteligente público y privado con contexto de usuario.
*   [x] **Transacciones Atómicas**: Depósitos, Retiros y Transferencias con garantía de integridad SQL.
*   [x] **Enriquecimiento de Datos**: Historial con nombres y CBUs de contrapartes para máxima claridad.
*   [x] **Intercambio de Divisas (Swap)**: Conversiones instantáneas con tasas reales sincronizadas.
*   [x] **Buscador y Agenda**: Validación de destinatarios en tiempo real y lista de contactos recientes.
*   [x] **Historial Avanzado**: Movimientos paginados con indicador de dirección (sent/received).
*   [x] **Automatización**: Cron Job horario para la actualización de tasas de cambio.
*   [x] **Arquitectura Profesional**: Modularización basada en SOLID y Clean Architecture.
*   [x] **Calidad de Código**: Cobertura de tests modularizada (**51 tests exitosos**).
*   [x] **Seguridad**: Hasheo de passwords, protección de rutas y sistema Type-Safe completo.


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

Esta estructura está diseñada siguiendo patrones de **Clean Architecture** y desacoplamiento de capas para garantizar que el sistema sea fácil de escalar y testear:

```
LatamPay-Backend/
├── sql/               # Scripts SQL (Schema & Seed)
├── src/
│   ├── config/        # Configuración (Zod Validation)
│   ├── controllers/   # Controladores (Thin Controllers)
│   ├── db/            # Infraestructura de DB
│   ├── docs/          # Configuración Swagger
│   ├── middlewares/   # Seguridad, Auth y Errores
│   ├── routes/        # Definición de Contratos (Endpoints)
│   ├── schemas/       # Validaciones Zod (Single Source of Truth)
│   ├── services/      # Lógica de Negocio (Dominio)
│   ├── tests/         # Suite de Pruebas Automáticas
│   ├── types/         # Definiciones Estrictas de TS
│   ├── utils/         # Helpers, Cron Jobs y Templates
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
| `AWS_REGION` | Región de AWS para SES | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Access Key de AWS | `tu_access_key` |
| `AWS_SECRET_ACCESS_KEY` | Secret Key de AWS | `tu_secret_key` |
| `AWS_SES_FROM_EMAIL` | Email origen verificado en SES | `noreply@tusitio.com` |
| `ENABLE_EMAIL_MOCK` | Simular envío de correos en consola | `true` / `false` |
