import { randomUUID } from 'crypto';
import pool from '../db';
import config from '../config';
import { AppError } from '../utils/AppError';
import { sendEmail } from './email.service';
import { getSwapTemplate } from '../utils/email-templates';

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const COMMISSION_RATE = 0.03;

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

/**
 * Obtiene las tasas de cambio actuales desde la API externa y las guarda en la base de datos.
 */
export const syncExchangeRates = async (): Promise<void> => {
  const currenciesToSync = ['ARS', 'COP', 'VES'];
  
  try {
    console.log('🔄 Sincronizando tasas de cambio...');

    // Usamos ARS como base (podría ser cualquiera de las tres)
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${config.exchangeRateApiKey}/latest/ARS`
    );

    if (!response.ok) {
      throw new Error(`Error al consultar la API de tasas: ${response.statusText}`);
    }

    const data = (await response.json()) as ExchangeRateResponse;

    if (data.result !== 'success') {
      throw new Error('La API de tasas no devolvió un resultado exitoso.');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Iteramos sobre las combinaciones de monedas
      for (const from of currenciesToSync) {
        for (const to of currenciesToSync) {
          if (from === to) continue;

          // Calculamos la tasa relativa si la base no es 'from'
          // Tasa (from -> to) = (Base -> to) / (Base -> from)
          const rateFromBase = data.conversion_rates[from];
          const rateToBase = data.conversion_rates[to];
          const finalRate = rateToBase / rateFromBase;

          await client.query(
            `INSERT INTO exchange_rates (id, from_currency, to_currency, rate, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (from_currency, to_currency) 
             DO UPDATE SET rate = EXCLUDED.rate, updated_at = NOW()`,
            [randomUUID(), from, to, finalRate]
          );
        }
      }

      await client.query('COMMIT');
      console.log('✅ Tasas de cambio actualizadas correctamente.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error sincronizando tasas:', message);
    // No lanzamos error para no romper procesos en segundo plano, solo logueamos
  }
};

/**
 * Obtiene todas las tasas de cambio almacenadas en la base de datos.
 */
export const getStoredExchangeRates = async () => {
  const result = await pool.query<{ from_currency: string; to_currency: string; rate: number; updated_at: Date }>(
    'SELECT from_currency, to_currency, rate, updated_at FROM exchange_rates'
  );
  return result.rows;
};

/**
 * Realiza un intercambio de divisas (Swap)
 */
export const swapCurrency = async (userId: string, fromCurrency: string, toCurrency: string, amount: number, userDescription?: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const walletRes = await client.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
    if (walletRes.rows.length === 0) throw new AppError('Billetera no encontrada.', 404);
    const walletId = walletRes.rows[0].id;

    // 1. Verificar saldo suficiente
    const balanceRes = await client.query(
      'SELECT amount FROM balances WHERE wallet_id = $1 AND currency_code = $2',
      [walletId, fromCurrency]
    );
    const currentBalance = balanceRes.rows[0]?.amount || 0;
    if (Number(currentBalance) < amount) throw new AppError('Saldo insuficiente.', 400);

    // 2. Obtener tasa de cambio
    const rateRes = await client.query(
      'SELECT rate FROM exchange_rates WHERE from_currency = $1 AND to_currency = $2',
      [fromCurrency, toCurrency]
    );
    if (rateRes.rows.length === 0) throw new AppError('Tasa de cambio no disponible.', 404);
    const rate = Number(rateRes.rows[0].rate);
    
    const amountBeforeFee = amount * rate;
    const fee = Number((amountBeforeFee * COMMISSION_RATE).toFixed(2));
    const toAmount = Number((amountBeforeFee - fee).toFixed(2));

    if (toAmount <= 0) throw new AppError('El monto convertido es demasiado bajo para cubrir la comisión.', 400);

    // 3. Ejecutar el swap (restar uno, sumar otro)
    await client.query(
      'UPDATE balances SET amount = amount - $1 WHERE wallet_id = $2 AND currency_code = $3',
      [amount, walletId, fromCurrency]
    );

    await client.query(
      `INSERT INTO balances (id, wallet_id, currency_code, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (wallet_id, currency_code)
       DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
      [randomUUID(), walletId, toCurrency, toAmount]
    );

    // Acreditar comisión al Administrador (en la moneda de destino)
    const adminRes = await client.query('SELECT id FROM wallets WHERE user_id = $1', [ADMIN_ID]);
    let adminWalletId;
    if (adminRes.rows.length === 0) {
      // Si el admin no tiene wallet, la creamos (usando una lógica similar a ensureWallet pero aquí estamos en otro archivo)
      // Para simplificar, asumimos que el admin debe tener wallet o usamos una query directa
      // Mejor aún, podríamos importar ensureWallet si estuviera exportada, pero no lo está en transaction.service.ts
      // Por ahora, lanzamos error si no existe o la creamos manualmente aquí
      throw new AppError('Billetera de administración no configurada.', 500);
    } else {
      adminWalletId = adminRes.rows[0].id;
    }

    await client.query(
      `INSERT INTO balances (id, wallet_id, currency_code, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (wallet_id, currency_code)
       DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
      [randomUUID(), adminWalletId, toCurrency, fee]
    );

    // 4. Registrar transacción
    const txId = randomUUID();
    await client.query(
      `INSERT INTO transactions (id, type, status, from_wallet_id, to_wallet_id, from_currency, to_currency, from_amount, to_amount, fee, exchange_rate, description)
       VALUES ($1, 'swap', 'completed', $2, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [txId, walletId, fromCurrency, toCurrency, amount, toAmount, fee, rate, `Swap de ${fromCurrency} a ${toCurrency} (Comisión 3%)`]
    );

    await client.query('COMMIT');
    
    // Enviar correo de notificación de intercambio (Swap)
    const userRes = await client.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    if (user) {
      sendEmail({
        to: user.email,
        ...getSwapTemplate(user.name, amount, fromCurrency, toAmount, toCurrency, fee, rate)
      }).catch(err => console.error('Error enviando correo de swap:', err));
    }

    // Importamos dinámicamente para evitar dependencia circular
    const { getTransactionById } = await import('./transaction.service');
    return await getTransactionById(txId, client);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
