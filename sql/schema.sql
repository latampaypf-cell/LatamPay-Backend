-- 1. Tabla de Monedas
CREATE TABLE currencies (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50),
    type VARCHAR(20),
    decimals INT
);

-- 2. Tabla de Usuarios (Con columna 'role' para Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user', -- Diferencia entre 'user' y 'admin'
    created_at TIMESTAMP
);

-- 3. Tabla de Billeteras
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    cbu VARCHAR(22) UNIQUE,
    alias VARCHAR(50) UNIQUE,
    created_at TIMESTAMP
);

-- 4. Tabla de Saldos
CREATE TABLE balances (
    id UUID PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id),
    currency_code VARCHAR(10) REFERENCES currencies(code),
    amount NUMERIC(19, 8)
);

-- 5. Tabla de Transacciones
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    type VARCHAR(20),
    from_wallet_id UUID REFERENCES wallets(id),
    to_wallet_id UUID REFERENCES wallets(id),
    from_currency VARCHAR(10) REFERENCES currencies(code),
    to_currency VARCHAR(10) REFERENCES currencies(code),
    from_amount NUMERIC(19, 8),
    to_amount NUMERIC(19, 8),
    exchange_rate NUMERIC(19, 8),
    created_at TIMESTAMP
);