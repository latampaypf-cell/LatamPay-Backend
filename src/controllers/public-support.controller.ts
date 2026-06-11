import { Request, Response, NextFunction } from 'express';
import { PublicSupportService } from '../services/public-support.service';
import { SupportChatRequest, SupportChatResponse } from '../types/support.types';
import { ApiResponse } from '../types/common.types';

/**
 * Maneja el chat para personas que no han iniciado sesión (Información general).
 */
export const handlePublicChat = async (
  req: Request<{}, {}, SupportChatRequest>, 
  res: Response<ApiResponse<SupportChatResponse>>, 
  next: NextFunction
) => {
  try {
    const { message, history = [] } = req.body;

    const reply = await PublicSupportService.getInformationalReply(message, history);

    // Filtramos el historial previo para asegurar que no termine en 'user' 
    // antes de agregar el nuevo par (pregunta/respuesta)
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
