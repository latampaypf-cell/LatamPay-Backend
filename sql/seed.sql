-- ====================================================================
-- LatamPay - Datos de prueba (Seed)
-- ====================================================================

-- 1. Monedas FIAT oficiales de LatamPay
INSERT INTO currencies (code, name, type, decimals) VALUES
('ARS', 'Peso Argentino',    'fiat', 2),
('COP', 'Peso Colombiano',   'fiat', 2),
('VES', 'Bolívar Soberano',  'fiat', 2);

-- 2. Tasas de cambio iniciales (referencia, actualizar según mercado)
INSERT INTO exchange_rates (id, from_currency, to_currency, rate) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ARS', 'COP', 0.00350000),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ARS', 'VES', 0.04200000),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'COP', 'ARS', 285.71000000),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'COP', 'VES', 12.00000000),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'VES', 'ARS', 23.81000000),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'VES', 'COP', 0.08300000);

-- ====================================================================
-- USUARIO ADMINISTRADOR
-- email: admin@latampay.com | contraseña: Password123
-- ====================================================================
INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'admin@latampay.com',
    '$2b$10$gsbGdCtIyosuUgsBI//st.gnHFyZUODHpbZJo41GqLyCjJaSmBDua',
    'Facundo Administrador',
    'admin',
    '2026-06-03 12:00:00'
);

-- Billetera del Administrador (Tesorería)
INSERT INTO wallets (id, user_id, cbu, alias, created_at) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '0000000000000000000000',
    'latampay.admin',
    '2026-06-03 12:00:00'
);

-- Saldos iniciales para el Admin
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'ARS', 0.00);
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'COP', 0.00);
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'VES', 0.00);

-- ====================================================================
-- USUARIO CLIENTE ESTÁNDAR
-- email: facundo@latampay.com | contraseña: Password123
-- ====================================================================
INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    'facundo@latampay.com',
    '$2b$10$gsbGdCtIyosuUgsBI//st.gnHFyZUODHpbZJo41GqLyCjJaSmBDua',
    'Facundo Cliente',
    'user',
    '2026-06-03 12:05:00'
);

-- Billetera del usuario cliente
INSERT INTO wallets (id, user_id, cbu, alias, created_at) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    '1234567890123456789012',
    'latampay.facundo',
    '2026-06-03 12:05:00'
);


-- Saldos iniciales en cero para cada moneda
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'ARS', 0.00000000);
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'COP', 0.00000000);
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'VES', 0.00000000);


-- ====================================================================
-- SEGUNDO USUARIO CLIENTE (Para probar transferencias)
-- email: roberto@example.com | contraseña: Password123
-- ====================================================================
INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES
(
    '287dfb3d-ff05-4071-bdc5-5239596c8779',
    'roberto@example.com',
    '$2b$10$gsbGdCtIyosuUgsBI//st.gnHFyZUODHpbZJo41GqLyCjJaSmBDua',
    'Roberto Gomez',
    'user',
    '2026-06-05 10:00:00'
);

INSERT INTO wallets (id, user_id, cbu, alias, created_at) VALUES
(
    '88888888-8888-8888-8888-888888888888',
    '287dfb3d-ff05-4071-bdc5-5239596c8779',
    '9876543210987654321098',
    'roberto.gomez.lp',
    '2026-06-05 10:00:00'
);

-- Saldos para Roberto (Le damos algo de plata inicial para que pueda transferir)
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('99999999-9999-9999-9999-999999999991', '88888888-8888-8888-8888-888888888888', 'ARS', 5000.00);
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('99999999-9999-9999-9999-999999999992', '88888888-8888-8888-8888-888888888888', 'COP', 0.00);
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES ('99999999-9999-9999-9999-999999999993', '88888888-8888-8888-8888-888888888888', 'VES', 0.00);

-- ====================================================================
-- TRANSACCIONES DE EJEMPLO
-- ====================================================================

-- 1. Depósito de Facundo
INSERT INTO transactions (id, type, status, to_wallet_id, to_currency, from_amount, to_amount, description, created_at) VALUES
(
    '11111111-2222-3333-4444-555555555555',
    'deposit',
    'completed',
    '22222222-2222-2222-2222-222222222222', -- Wallet Facundo
    'ARS',
    10000.00,
    10000.00,
    'Carga inicial de saldo ARS',
    '2026-06-10 12:00:00'
);

-- 2. Transferencia de Roberto a Facundo
INSERT INTO transactions (id, type, status, from_wallet_id, to_wallet_id, from_currency, to_currency, from_amount, to_amount, description, created_at) VALUES
(
    '22222222-3333-4444-5555-666666666666',
    'transfer',
    'completed',
    '88888888-8888-8888-8888-888888888888', -- Roberto
    '22222222-2222-2222-2222-222222222222', -- Facundo
    'ARS',
    'ARS',
    1500.00,
    1500.00,
    'Pago por servicios de diseño',
    '2026-06-11 09:30:00'
);

-- 3. Un Swap de Facundo (ARS a COP)
INSERT INTO transactions (id, type, status, from_wallet_id, to_wallet_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, description, created_at) VALUES
(
    '33333333-4444-5555-6666-777777777777',
    'swap',
    'completed',
    '22222222-2222-2222-2222-222222222222', -- Misma wallet
    '22222222-2222-2222-2222-222222222222',
    'ARS',
    'COP',
    500.00,
    1.75, -- Basado en rate 0.0035
    0.0035,
    'Cambio para viaje a Colombia',
    '2026-06-11 11:00:00'
);
