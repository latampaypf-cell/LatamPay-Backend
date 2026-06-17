import { Router } from 'express';
import { handlePublicChat } from '../controllers/public-support.controller';
import { handleUserChat } from '../controllers/user-support.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { publicChatSchema } from '../schemas/support.schema';

const router = Router();

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
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SupportResponse' }
 */
router.post('/info', validate(publicChatSchema), handlePublicChat);

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
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SupportResponse' }
 */
router.post('/chat', requireAuth, validate(publicChatSchema), handleUserChat);

export default router;
