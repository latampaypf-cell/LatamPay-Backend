import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    next(new AppError('Acceso denegado. Se requieren permisos de administrador.', 403));
    return;
  }

  next();
};