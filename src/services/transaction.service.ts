import { randomUUID } from 'crypto';
import pool, { query } from '../db';
import { AppError } from '../utils/AppError';

import { generateAlias, generateCBU } from '../utils/generators';
import { Transaction } from '../types/transaction.types';

/**
 * Devuelve el wallet_id del usuario. Si el usuario no tiene wallet,
 * la crea junto con los balances en cero para cada moneda fiat.
 * Pensado para cuentas legacy creadas antes del autobootstrap del register.
 *
 * Nota: tipamos `client` como `any` para no depender de @types/pg en el
 * build de Railway (que instala solo dependencies, no devDependencies).
 */
const ensureWallet = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  userId: string,
): Promise<string> => {
  const existing = await client.query(
    'SELECT id FROM wallets WHERE user_id = $1',
    [userId],
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const userRes = await client.query(
    'SELECT name FROM users WHERE id = $1',
    [userId],
  );
  if (userRes.rows.length === 0) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  const walletId = randomUUID();
  const cbu = generateCBU();
  const alias = generateAlias(userRes.rows[0].name ?? 'user');

  await client.query(
    `INSERT INTO wallets (id, user_id, cbu, alias, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [walletId, userId, cbu, alias],
  );

  const fiats = await client.query(
    `SELECT code FROM currencies WHERE type = 'fiat'`,
  );
  for (const row of fiats.rows) {
    await client.query(
      `INSERT INTO balances (id, wallet_id, currency_code, amount)
       VALUES ($1, $2, $3, 0)`,
      [randomUUID(), walletId, row.code],
    );
  }

  return walletId;
};


export const depositFunds = async (userId: string, amount: number, currencyCode: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const walletId = await ensureWallet(client, userId);

    await client.query(
      `INSERT INTO balances (id, wallet_id, currency_code, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (wallet_id, currency_code)
       DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
      [randomUUID(), walletId, currencyCode, amount]
    );

    const txId = randomUUID();
    await client.query(
      `INSERT INTO transactions (id, type, status, to_wallet_id, to_currency, from_amount, to_amount, from_currency)
       VALUES ($1, 'deposit', 'completed', $2, $3, $4, $4, $3)`,
      [txId, walletId, currencyCode, amount]
    );

    await client.query('COMMIT');
    return { transactionId: txId, amount, currency: currencyCode };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const withdrawFunds = async (userId: string, amount: number, currencyCode: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const walletRes = await client.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
    if (walletRes.rows.length === 0) throw new AppError('Billetera no encontrada.', 404);
    const walletId = walletRes.rows[0].id;

    const balanceRes = await client.query(
      'SELECT amount FROM balances WHERE wallet_id = $1 AND currency_code = $2',
      [walletId, currencyCode]
    );
    const currentBalance = balanceRes.rows[0]?.amount || 0;
    if (Number(currentBalance) < amount) throw new AppError('Saldo insuficiente para el retiro.', 400);

    await client.query(
      'UPDATE balances SET amount = amount - $1 WHERE wallet_id = $2 AND currency_code = $3',
      [amount, walletId, currencyCode]
    );

    const txId = randomUUID();
    await client.query(
      `INSERT INTO transactions (id, type, status, from_wallet_id, from_currency, from_amount, to_amount, to_currency)
       VALUES ($1, 'withdraw', 'completed', $2, $3, $4, $4, $3)`,
      [txId, walletId, currencyCode, amount]
    );

    await client.query('COMMIT');
    return { transactionId: txId, amount, currency: currencyCode };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const transferFunds = async (userId: string, toIdentifier: string, amount: number, currencyCode: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fromWalletRes = await client.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
    const fromWalletId = fromWalletRes.rows[0].id;

    const balanceRes = await client.query(
      'SELECT amount FROM balances WHERE wallet_id = $1 AND currency_code = $2',
      [fromWalletId, currencyCode]
    );
    if ((balanceRes.rows[0]?.amount || 0) < amount) throw new AppError('Saldo insuficiente.', 400);

    const toWalletRes = await client.query(
      'SELECT id FROM wallets WHERE cbu = $1 OR alias = $1',
      [toIdentifier]
    );
    if (toWalletRes.rows.length === 0) throw new AppError('Destinatario no encontrado.', 404);
    const toWalletId = toWalletRes.rows[0].id;

    if (fromWalletId === toWalletId) throw new AppError('No puedes transferirte a ti mismo.', 400);

    await client.query(
      'UPDATE balances SET amount = amount - $1 WHERE wallet_id = $2 AND currency_code = $3',
      [amount, fromWalletId, currencyCode]
    );

    await client.query(
      `INSERT INTO balances (id, wallet_id, currency_code, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (wallet_id, currency_code)
       DO UPDATE SET amount = balances.amount + EXCLUDED.amount`,
      [randomUUID(), toWalletId, currencyCode, amount]
    );

    const txId = randomUUID();
    await client.query(
      `INSERT INTO transactions (id, type, status, from_wallet_id, to_wallet_id, from_currency, to_currency, from_amount, to_amount)
       VALUES ($1, 'transfer', 'completed', $2, $3, $4, $4, $5, $5)`,
      [txId, fromWalletId, toWalletId, currencyCode, amount]
    );

    await client.query('COMMIT');
    return { transactionId: txId, to: toIdentifier, amount };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getTransactionHistory = async (userId: string, page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const walletRes = await query<{ id: string }>('SELECT id FROM wallets WHERE user_id = $1', [userId]);
  if (walletRes.rows.length === 0) throw new AppError('Billetera no encontrada.', 404);
  const walletId = walletRes.rows[0].id;

  const historyRes = await query<Transaction & { direction: 'sent' | 'received' }>(
    `SELECT 
      t.id, t.type, t.status, t.from_currency, t.to_currency, 
      t.from_amount, t.to_amount, t.exchange_rate, t.created_at,
      CASE 
        WHEN t.from_wallet_id = $1 THEN 'sent'
        WHEN t.to_wallet_id = $1 THEN 'received'
      END as direction
     FROM transactions t
     WHERE t.from_wallet_id = $1 OR t.to_wallet_id = $1
     ORDER BY t.created_at DESC
     LIMIT $2 OFFSET $3`,
    [walletId, limit, offset]
  );

   const countRes = await query<{ count: string }>(
    'SELECT COUNT(*) FROM transactions WHERE from_wallet_id = $1 OR to_wallet_id = $1',
    [walletId]
  );
  const totalItems = parseInt(countRes.rows[0].count);

  return {
    transactions: historyRes.rows,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    }
  };
};
