import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types'; // 1. Importación limpia desde types

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Verificamos si los datos del usuario guardados por el middleware anterior indican que es admin
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      status: 'fail',
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
    return;
  }

  // Si es admin, lo dejamos pasar al controlador exclusivo de administración
  next();
};