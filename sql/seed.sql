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