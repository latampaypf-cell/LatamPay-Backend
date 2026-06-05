import { Request, Response, NextFunction } from 'express';
import { loginUser } from '../services/login.service';
import { loginSchema } from '../schemas/auth.schema';
import { AppError } from '../utils/AppError';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Validar input con Zod
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const { email, password } = parsed.data;

    // 2. Llamar al servicio exclusivo de login
    const result = await loginUser(email, password);

    // 3. Responder exitosamente
    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error) {
    next(error);
  }
};