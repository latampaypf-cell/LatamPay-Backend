import { Router } from 'express';
import { getRates, triggerSync, swap } from '../controllers/exchange.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { swapSchema } from '../schemas/wallet.schema';

const router = Router();

/**
 * @swagger
 * /api/exchange/rates:
 *   get:
 *     summary: Obtener las tasas de cambio actuales
 *     tags: [Exchange]
 *     responses:
 *       200:
 *         description: Lista de tasas de cambio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       from_currency: { type: string, example: ARS }
 *                       to_currency: { type: string, example: COP }
 *                       rate: { type: number, example: 0.0035 }
 *                       updated_at: { type: string, format: date-time }
 */
router.get('/rates', getRates);

/**
 * @swagger
 * /api/exchange/swap:
 *   post:
 *     summary: Cambiar divisas (ej. ARS a COP)
 *     tags: [Exchange]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from_currency
 *               - to_currency
 *               - amount
 *             properties:
 *               from_currency:
 *                 type: string
 *                 example: ARS
 *               to_currency:
 *                 type: string
 *                 example: COP
 *               amount:
 *                 type: number
 *                 example: 500
 *               description:
 *                 type: string
 *                 example: "Ahorro en pesos colombianos"
 *     responses:
 *       200:
 *         description: Cambio de divisa exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Transaction' }
 */
router.post('/swap', requireAuth, validate(swapSchema), swap);

/**
 * @swagger
 * /api/exchange/sync:
 *   post:
 *     summary: Forzar sincronización de tasas (Admin solamente)
 *     tags: [Exchange]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sincronización exitosa
 */
router.post('/sync', requireAuth, requireAdmin, triggerSync);

export default router;
