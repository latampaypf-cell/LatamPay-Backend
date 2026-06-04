import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types'; // 1. Importamos la interfaz limpia desde types

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // 1. Buscamos el token en la cabecera de la petición (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'fail',
        message: 'Acceso denegado. No se proporcionó un token de autenticación.'
      });
      return;
    }

    // 2. Extraemos el token limpio (quitando la palabra "Bearer ")
    const token = authHeader.split(' ')[1];

    // 3. Verificamos la firma del token usando la clave secreta del .env
    const jwtSecret = process.env.JWT_SECRET || 'tu_secreto_super_seguro_de_desarrollo';
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: string };

    // 4. Guardamos los datos decodificados en el objeto 'req' para que los controladores lo puedan usar
    req.user = decoded;

    // 5. ¡Paso concedido! Dejamos continuar al controlador
    next();

  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Token inválido o expirado.'
    });
  }
};