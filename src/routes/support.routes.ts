import { Router } from 'express';
import { handlePublicChat } from '../controllers/public-support.controller';
import { handleUserChat } from '../controllers/user-support.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { publicChatSchema } from '../schemas/support.schema';
import rateLimit from 'express-rate-limit';

const router = Router();

// Seguridad: Limitar a 5 consultas cada 10 minutos por IP para evitar abusos del API de IA
const botLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  skip: () => process.env.NODE_ENV === 'test', // No limitar durante los tests
  message: {
    status: 'error',
    message: 'Has alcanzado el límite de consultas permitidas. Intenta de nuevo en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/support/info:
 *   post:
 *     summary: Chatbot informativo para personas sin cuenta
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "¿Cómo puedo cargar saldo?"
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, model] }
 *                     text: { type: string }
 *     responses:
 *       200:
 *         description: Respuesta del bot exitosa
 */
router.post('/info', botLimiter, validate(publicChatSchema), handlePublicChat);

/**
 * @swagger
 * /api/support/chat:
 *   post:
 *     summary: Chatbot personalizado para usuarios registrados
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "¿Cuál es mi saldo actual?"
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, model] }
 *                     text: { type: string }
 *     responses:
 *       200:
 *         description: Respuesta personalizada del bot
 */
router.post('/chat', requireAuth, botLimiter, validate(publicChatSchema), handleUserChat);

export default router;
