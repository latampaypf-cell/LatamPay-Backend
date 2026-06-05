import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { config } from '../config';
import { AppError } from '../utils/AppError';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // 1. Verificar header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Acceso denegado. No se proporcionó un token de autenticación.', 401);
    }

    // 2. Extraer y verificar el token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };

    // 3. Adjuntar el payload al request para los controllers
    req.user = decoded;

    next();

  } catch (error) {
    // JWT expirado o inválido — jsonwebtoken lanza su propio error
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError('Token inválido o expirado.', 401));
  }
};