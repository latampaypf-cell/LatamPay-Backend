import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import pool, { query } from '../db';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { generateCBU, generateAlias } from '../utils/generators';
import { User, UserProfile } from '../types/auth.types';
import { Wallet } from '../types/wallet.types';
import { sendEmail } from './email.service';
import { getWelcomeTemplate, getSecurityUpdateTemplate } from '../utils/email-templates';

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

    // 4. Enviar correo de bienvenida (sin bloquear la respuesta)
    sendEmail({
      to: newUser.email,
      ...getWelcomeTemplate(newUser.name)
    }).catch(err => console.error('Error enviando correo de bienvenida:', err));

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

export const updateUser = async (
  userId: string, 
  data: { name?: string; alias?: string; currentPassword?: string; newPassword?: string }
): Promise<UserProfile> => {
  const { name, alias, currentPassword, newPassword } = data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obtener datos actuales del usuario
    const userRes = await client.query<User & { password_hash: string }>(
      'SELECT email, name, password_hash FROM users WHERE id = $1',
      [userId]
    );
    
    if (userRes.rows.length === 0) throw new AppError('Usuario no encontrado.', 404);
    const user = userRes.rows[0];

    // 2. Validar cambio de contraseña si aplica
    let newPasswordHash = undefined;
    if (newPassword) {
      if (!currentPassword) {
        throw new AppError('Se requiere la contraseña actual para cambiarla.', 400);
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        throw new AppError('La contraseña actual es incorrecta.', 401);
      }
      newPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    // 3. Actualizar tabla 'users' si hay cambios
    const userUpdates: string[] = [];
    const userValues: any[] = [];
    if (name) {
      userUpdates.push(`name = $${userUpdates.length + 1}`);
      userValues.push(name);
    }
    if (newPasswordHash) {
      userUpdates.push(`password_hash = $${userUpdates.length + 1}`);
      userValues.push(newPasswordHash);
    }

    if (userUpdates.length > 0) {
      userValues.push(userId);
      await client.query(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${userValues.length}`,
        userValues
      );
    }

    // 4. Actualizar tabla 'wallets' (alias) si aplica
    if (alias) {
      // Verificar si el alias ya existe
      const aliasCheck = await client.query('SELECT id FROM wallets WHERE alias = $1 AND user_id != $2', [alias, userId]);
      if (aliasCheck.rows.length > 0) {
        throw new AppError('El alias ya está en uso por otro usuario.', 409);
      }

      await client.query(
        'UPDATE wallets SET alias = $1 WHERE user_id = $2',
        [alias, userId]
      );
    }

    if (!name && !newPasswordHash && !alias) {
      throw new AppError('No se proporcionaron datos para actualizar.', 400);
    }

    await client.query('COMMIT');

    // 5. Enviar correo de notificación de seguridad si cambió la contraseña
    if (newPasswordHash) {
      sendEmail({
        to: user.email,
        ...getSecurityUpdateTemplate(name || user.name)
      }).catch(err => console.error('Error enviando correo de seguridad:', err));
    }

    // 6. Retornar datos actualizados (unificados)
    const finalResult = await client.query(`
      SELECT u.id, u.name, u.email, u.role, w.alias, w.cbu 
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.id = $1
    `, [userId]);

    return finalResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
