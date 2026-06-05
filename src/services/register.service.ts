import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import pool, { query } from '../db';
import { generateCBU, generateAlias } from '../utils/generators';
import { AppError } from '../utils/AppError';

export const registerUser = async (name: string, email: string, passwordPlana: string) => {

  // 1. Verificar email duplicado antes de abrir la transacción
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new AppError('El correo electrónico ya está registrado.', 409);
  }

  // 2. Hashear la contraseña
  const passwordHash = await bcrypt.hash(passwordPlana, 10);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userId   = randomUUID();
    const walletId = randomUUID();

    // A. Insertar usuario
    const userResult = await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, 'user', NOW())
       RETURNING id, name, email, role, created_at`,
      [userId, name, email, passwordHash]
    );
    const newUser = userResult.rows[0];

    // B. Generar CBU y alias
    const cbu   = generateCBU();
    const alias = generateAlias(name);

    // C. Insertar billetera
    const walletResult = await client.query(
      `INSERT INTO wallets (id, user_id, cbu, alias, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, cbu, alias`,
      [walletId, userId, cbu, alias]
    );
    const newWallet = walletResult.rows[0];

    // D. Obtener solo monedas fiat para asignar saldos iniciales
    const currenciesResult = await client.query(
      `SELECT code FROM currencies WHERE type = 'fiat'`
    );

    // E. Insertar saldo en cero para cada moneda fiat
    for (const currency of currenciesResult.rows) {
      await client.query(
        `INSERT INTO balances (id, wallet_id, currency_code, amount)
         VALUES ($1, $2, $3, 0.00000000)`,
        [randomUUID(), walletId, currency.code]
      );
    }

    await client.query('COMMIT');

    return { user: newUser, wallet: newWallet };

  } catch (error: any) {
    await client.query('ROLLBACK');

    // Error de constraint UNIQUE en la BD (race condition de registro simultáneo)
    if (error.code === '23505') {
      throw new AppError('El correo electrónico ya está registrado.', 409);
    }

    throw error; // Error inesperado — lo maneja el middleware global
  } finally {
    client.release();
  }
};