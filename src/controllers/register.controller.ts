import { Request, Response, NextFunction } from 'express';
import { registerUser } from '../services/register.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

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