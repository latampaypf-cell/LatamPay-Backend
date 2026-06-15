-- ====================================================================
-- LatamPay - Schema de Base de Datos
-- ====================================================================

-- 1. Tabla de Monedas
CREATE TABLE currencies (
    code     VARCHAR(10)  PRIMARY KEY,
    name     VARCHAR(50)  NOT NULL,
    type     VARCHAR(20)  NOT NULL DEFAULT 'fiat' CHECK (type IN ('fiat', 'crypto')),
    decimals INT          NOT NULL DEFAULT 2
);

-- 2. Tabla de Tasas de Cambio
CREATE TABLE exchange_rates (
    id            UUID         PRIMARY KEY,
    from_currency VARCHAR(10)  NOT NULL REFERENCES currencies(code),
    to_currency   VARCHAR(10)  NOT NULL REFERENCES currencies(code),
    rate          NUMERIC(19, 8) NOT NULL CHECK (rate > 0),
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_currency_pair UNIQUE (from_currency, to_currency)
);

-- 3. Tabla de Usuarios
CREATE TABLE users (
    id            UUID          PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    name          VARCHAR(100)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Billeteras
CREATE TABLE wallets (
    id         UUID         PRIMARY KEY,
    user_id    UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    cbu        VARCHAR(22)  NOT NULL UNIQUE,
    alias      VARCHAR(50)  NOT NULL UNIQUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Saldos (Balances)
CREATE TABLE balances (
    id            UUID           PRIMARY KEY,
    wallet_id     UUID           NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    currency_code VARCHAR(10)    NOT NULL REFERENCES currencies(code),
    amount        NUMERIC(19, 8) NOT NULL DEFAULT 0.00000000 CHECK (amount >= 0),
    CONSTRAINT unique_wallet_currency UNIQUE (wallet_id, currency_code)
);

-- 6. Tabla de Transacciones
CREATE TABLE transactions (
    id             UUID           PRIMARY KEY,
    type           VARCHAR(20)    NOT NULL CHECK (type IN ('deposit', 'withdraw', 'transfer', 'swap')),
    status         VARCHAR(20)    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    from_wallet_id UUID           REFERENCES wallets(id) ON DELETE SET NULL,
    to_wallet_id   UUID           REFERENCES wallets(id) ON DELETE SET NULL,
    from_currency  VARCHAR(10)    REFERENCES currencies(code),
    to_currency    VARCHAR(10)    REFERENCES currencies(code),
    from_amount    NUMERIC(19, 8) NOT NULL CHECK (from_amount > 0),
    to_amount      NUMERIC(19, 8) NOT NULL CHECK (to_amount > 0),
    fee            NUMERIC(19, 8) DEFAULT 0,
    exchange_rate  NUMERIC(19, 8) CHECK (exchange_rate > 0), -- Nullable: no aplica en depósitos/retiros simples
    description    VARCHAR(255),
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- 7. Índices
CREATE INDEX idx_balances_wallet_id ON balances(wallet_id);
CREATE INDEX idx_transactions_from_wallet ON transactions(from_wallet_id);
CREATE INDEX idx_transactions_to_wallet ON transactions(to_wallet_id);