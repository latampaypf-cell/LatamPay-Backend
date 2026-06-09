import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import pool, { query } from '../db';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { generateCBU, generateAlias } from '../utils/generators';
import { User } from '../types/auth.types';
import { Wallet } from '../types/wallet.types';

export const loginUser = async (email: string, passwordPlana: string) => {
  // 1. Buscar usuario por email
  const result = await query<User & { password_hash: string }>(
    'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];

  // 2. Validar credenciales
  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const isPasswordValid = await bcrypt.compare(passwordPlana, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Credenciales inválidas', 401);
  }

  // 3. Generar JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const registerUser = async (name: string, email: string, passwordPlana: string) => {
  // 1. Verificar email duplicado
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new AppError('El correo electrónico ya está registrado.', 409);
  }

  // 2. Hashear la contraseña
  const passwordHash = await bcrypt.hash(passwordPlana, 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userId = randomUUID();
    const walletId = randomUUID();

    // A. Insertar usuario
    const userResult = await client.query<User>(
      `INSERT INTO users (id, name, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, 'user', NOW())
       RETURNING id, name, email, role, created_at`,
      [userId, name, email, passwordHash]
    );
    const newUser = userResult.rows[0];

    // B. Generar CBU y alias
    const cbu = generateCBU();
    const alias = generateAlias(name);

    // C. Insertar billetera
    const walletResult = await client.query<Wallet>(
      `INSERT INTO wallets (id, user_id, cbu, alias, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, cbu, alias`,
      [walletId, userId, cbu, alias]
    );
    const newWallet = walletResult.rows[0];

    // D. Inicializar balances en fiat
    const currenciesResult = await client.query(`SELECT code FROM currencies WHERE type = 'fiat'`);
    for (const currency of currenciesResult.rows) {
      await client.query(
        `INSERT INTO balances (id, wallet_id, currency_code, amount)
         VALUES ($1, $2, $3, 0.00000000)`,
        [randomUUID(), walletId, currency.code]
      );
    }

    await client.query('COMMIT');
    return { user: newUser, wallet: newWallet };
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      throw new AppError('El correo electrónico ya está registrado.', 409);
    }
    throw error;
  } finally {
    client.release();
  }
};
