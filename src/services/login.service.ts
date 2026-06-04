import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';

export const loginUser = async (email: string, passwordPlana: string) => {
  // 1. Buscamos al usuario en la base de datos por email
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  // 2. Si no existe, lanzamos un error
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // 3. Comparamos la contraseña enviada con el hash guardado en la BD
  const isPasswordValid = await bcrypt.compare(passwordPlana, user.password_hash);
  
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  // 4. Si todo es correcto, generamos el JWT
  const jwtSecret = process.env.JWT_SECRET || 'tu_secreto_super_seguro_de_desarrollo';
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '24h' }
  );

  // 5. Retornamos los datos estructurados
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};