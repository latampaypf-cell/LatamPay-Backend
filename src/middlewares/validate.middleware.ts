import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Middleware genérico para validar el body, query o params de una petición usando Zod.
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync(req[source]) as Record<string, unknown>;
      
      if (source === 'body') {
        req.body = result;
      } else {
        // Para query y params, intentamos actualizar los valores transformados
        const target = req[source] as Record<string, unknown>;
        for (const key in result) {
          try {
            target[key] = result[key];
          } catch (e) {
            // Silenciamos errores si la propiedad es read-only
          }
        }
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0].message;
        next(new AppError(message, 400));
        return;
      }
      next(error);
    }
  };
};
