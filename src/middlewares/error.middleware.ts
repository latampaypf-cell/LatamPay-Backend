import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { config } from '../config';

// Agregamos ErrorRequestHandler para que TypeScript valide los 4 parámetros correctamente
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  // Error controlado — lanzado intencionalmente desde un servicio
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
    return;
  }

  // Error inesperado — bug real, no filtrar detalles al cliente
  console.error(`[error]: ${err.message}`, err.stack);

  res.status(500).json({
    status: 'error',
    message: config.isProduction
      ? 'Ocurrió un error interno en el servidor.'
      : err.message, // En desarrollo mostramos el mensaje real para debuggear
  });
};