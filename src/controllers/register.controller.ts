import { Request, Response, NextFunction } from 'express';
import { registerUser } from '../services/register.service';
import { registerSchema } from '../schemas/auth.schema';
import { AppError } from '../utils/AppError';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Validar input con Zod
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const { name, email, password } = parsed.data;

    // 2. Llamar al servicio
    const result = await registerUser(name, email, password);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente junto a su billetera y balances 🚀',
      data: result,
    });

  } catch (error) {
    next(error);
  }
};