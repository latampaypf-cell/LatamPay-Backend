import { Request, Response, NextFunction } from 'express';
import { loginUser } from '../services/login.service';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

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