import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Middleware genérico para validar el body, query o params de una petición usando Zod.
 */
export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync(req[source]);
      
      // En Express, req.body es escribible. 
      // req.query y req.params a veces son getters read-only.
      if (source === 'body') {
        req.body = result;
      } else {
        // Para query y params, intentamos mergear los valores transformados
        // esto mantiene la referencia original pero actualiza los tipos (ej: string a number)
        for (const key in result) {
          try {
            (req[source] as any)[key] = result[key];
          } catch (e) {
            // Si la propiedad individual es read-only, no podemos hacer nada
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
