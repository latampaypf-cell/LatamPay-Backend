import { Request, Response, NextFunction } from 'express';
import { updateUser } from '../services/auth.service';
import { UpdateProfileInput } from '../schemas/auth.schema';

export const update = async (
  req: Request<{}, {}, UpdateProfileInput>, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await updateUser(userId, req.body);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
