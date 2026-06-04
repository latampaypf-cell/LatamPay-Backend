-- 1. Insertar las tres monedas oficiales de LatamPay (Clasificadas como FIAT)
INSERT INTO currencies (code, name, type, decimals) VALUES
('ARS', 'Peso Argentino', 'FIAT', 2),
('COP', 'Peso Colombiano', 'FIAT', 2),
('VES', 'Bolívar Soberano', 'FIAT', 2);

-- 2. Insertar un único usuario de prueba
-- Credenciales para el Login:
-- email: 'admin@latampay.com' 
-- contraseña: 'Password123' (Hasheada con bcrypt)
INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111', 
    'admin@latampay.com', 
    '$2b$10$gsbGdCtIyosuUgsBI//st.gnHFyZUODHpbZJo41GqLyCjJaSmBDua', 
    'Facundo Cliente', 
    'user', 
    '2026-06-03 12:00:00'
);

-- 3. Crear la Billetera (Wallet) asociada a tu usuario de prueba
INSERT INTO wallets (id, user_id, cbu, alias, created_at) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111', -- Referencia exacta al id de users
    '1234567890123456789012',                -- CBU simulado de 22 dígitos
    'latampay.facundo',                     -- Alias simulado
    '2026-06-03 12:00:00'
);

-- 4. Crear los saldos iniciales (Balances) de la billetera en cero
-- Uno para cada una de tus tres monedas oficiales
INSERT INTO balances (id, wallet_id, currency_code, amount) VALUES
-- Balance en Pesos Argentinos (ARS)
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'ARS', 0.00000000),

-- Balance en Pesos Colombianos (COP)
('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'COP', 0.00000000),

-- Balance en Bolívares Soberanos (VES)
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'VES', 0.00000000);