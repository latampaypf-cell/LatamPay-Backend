import { z } from 'zod';

export const publicChatSchema = z.object({
  message: z.string({
    message: "El mensaje es requerido",
  })
  .min(1, "El mensaje no puede estar vacío")
  .max(500, "El mensaje es demasiado largo para un asistente virtual (máximo 500 caracteres)"),
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      text: z.string()
    })
  ).optional()
});
