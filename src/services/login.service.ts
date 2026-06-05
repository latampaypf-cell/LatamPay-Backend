import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { config } from '../config';
import { AppError } from '../utils/AppError';

export const loginUser = async (email: string, passwordPlana: string) => {

  // 1. Buscar usuario por email — solo las columnas necesarias
  const result = await query(
    'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];

  // 2. Si no existe el email o la contraseña es incorrecta — mismo mensaje
  //    para no dar pistas de qué campo falló (seguridad)
  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const isPasswordValid = await bcrypt.compare(passwordPlana, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Credenciales inválidas', 401);
  }

  // 3. Generar JWT usando config (falla al arrancar si no existe, nunca usa fallback)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  // 4. Retornar datos sin exponer password_hash
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