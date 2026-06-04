import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto'; // Librería nativa de Node para UUIDs
import pool, { query } from '../db';
import { generateCBU, generateAlias } from '../utils/generators';

export const registerUser = async (name: string, email: string, passwordPlana: string) => {
  // 1. Verificamos si el email ya está registrado
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  // 2. Hasheamos la contraseña con bcryptjs
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlana, salt);

  // 3. Obtenemos un cliente del pool para manejar la transacción SQL
  const client = await pool.connect();

  try {
    // Iniciamos la Transacción SQL
    await client.query('BEGIN');

    // Generamos los UUIDs necesarios
    const userId = randomUUID();
    const walletId = randomUUID();

    // A. INSERTAR USUARIO
    const userInsertQuery = `
      INSERT INTO users (id, name, email, password_hash, role, created_at)
      VALUES ($1, $2, $3, $4, 'user', NOW())
      RETURNING id, name, email, role, created_at;
    `;
    const userResult = await client.query(userInsertQuery, [userId, name, email, passwordHash]);
    const newUser = userResult.rows[0];

    // B. GENERAR ALIAS Y CBU SIMULADOS
    const cbuSimulado = generateCBU();
    const aliasSimulado = generateAlias(name);

    // C. INSERTAR BILLETERA (Asociada al usuario)
    const walletInsertQuery = `
      INSERT INTO wallets (id, user_id, cbu, alias, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, cbu, alias;
    `;
    const walletResult = await client.query(walletInsertQuery, [walletId, userId, cbuSimulado, aliasSimulado]);
    const newWallet = walletResult.rows[0];

    // D. OBTENER LAS MONEDAS DEL SISTEMA PARA ASIGNAR SALDOS EN CERO
    const currenciesResult = await client.query('SELECT code FROM currencies');
    const currencies = currenciesResult.rows;

    // E. INSERTAR SALDO INICIAL EN CERO PARA CADA MONEDA EXISTENTE
    for (const currency of currencies) {
      const balanceId = randomUUID();
      const balanceInsertQuery = `
        INSERT INTO balances (id, wallet_id, currency_code, amount)
        VALUES ($1, $2, $3, 0.00000000);
      `;
      await client.query(balanceInsertQuery, [balanceId, walletId, currency.code]);
    }

    // Si todo salió bien, guardamos los cambios definitivamente
    await client.query('COMMIT');

    return {
      user: newUser,
      wallet: newWallet
    };

  } catch (error) {
    // Si algo falló, deshacemos todo lo hecho en la base de datos
    await client.query('ROLLBACK');
    console.error('Error durante la transacción de registro:', error);
    throw new Error('No se pudo completar el registro del usuario.');
  } finally {
    // Súper importante: devolvemos la conexión al pool
    client.release();
  }
};