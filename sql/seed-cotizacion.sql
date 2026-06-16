-- ====================================================================
-- Seed de Cotizaciones Históricas (Simulado para 30 días)
-- Inyectar manualmente en la base de datos
-- ====================================================================

-- Limpiar datos previos si es necesario
-- DELETE FROM exchange_rates;

DO $$
DECLARE
    curr_from TEXT;
    curr_to TEXT;
    base_rate NUMERIC;
    variation NUMERIC;
    i INTEGER;
    j INTEGER;
    target_date TIMESTAMP;
    currencies TEXT[] := ARRAY['ARS', 'COP', 'VES'];
BEGIN
    FOR i IN 0..2 LOOP -- Moneda origen
        FOR j IN 0..2 LOOP -- Moneda destino
            IF i <> j THEN
                curr_from := currencies[i+1];
                curr_to := currencies[j+1];
                
                -- Establecer una tasa base realista
                IF curr_from = 'ARS' AND curr_to = 'COP' THEN base_rate := 4.25;
                ELSIF curr_from = 'ARS' AND curr_to = 'VES' THEN base_rate := 0.041;
                ELSIF curr_from = 'COP' AND curr_to = 'ARS' THEN base_rate := 0.235;
                ELSIF curr_from = 'COP' AND curr_to = 'VES' THEN base_rate := 0.0096;
                ELSIF curr_from = 'VES' AND curr_to = 'ARS' THEN base_rate := 24.39;
                ELSIF curr_from = 'VES' AND curr_to = 'COP' THEN base_rate := 104.16;
                ELSE base_rate := 1.0;
                END IF;

                -- Generar 30 días de datos
                FOR day_idx IN 0..30 LOOP
                    target_date := NOW() - (day_idx || ' days')::INTERVAL;
                    -- Variación aleatoria entre -1.5% y +1.5%
                    variation := 1 + (random() * 0.03 - 0.015);
                    base_rate := base_rate * variation;

                    INSERT INTO exchange_rates (id, from_currency, to_currency, rate, created_at, updated_at)
                    VALUES (gen_random_uuid(), curr_from, curr_to, base_rate, target_date, target_date);
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;
