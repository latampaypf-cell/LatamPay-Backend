import { Request, Response, NextFunction } from 'express';
import { UserSupportService } from '../services/user-support.service';
import { SupportChatRequest, SupportChatResponse } from '../types/support.types';
import { ApiResponse } from '../types/common.types';

/**
 * Maneja el chat personalizado para usuarios autenticados (Información de cuenta).
 */
export const handleUserChat = async (
  req: Request<{}, {}, SupportChatRequest>, 
  res: Response<ApiResponse<SupportChatResponse>>, 
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    const { message, history = [] } = req.body;

    const reply = await UserSupportService.getPersonalizedReply(userId, message, history);

    // Filtramos el historial previo para asegurar alternancia en el resultado
    const baseHistory = (history || []).filter((msg, idx, self) => {
      if (idx === self.length - 1 && msg.role === 'user') return false;
      return true;
    });

    res.status(200).json({
      status: 'success',
      data: {
        reply,
        updatedHistory: [
          ...baseHistory,
          { role: 'user', text: message },
          { role: 'model', text: reply }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
