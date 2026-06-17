import { Router } from 'express';
import { getRates, triggerSync, swap, getHistory } from '../controllers/exchange.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { validate } from '../middlewares/validate.middleware';
import { swapSchema, exchangeHistorySchema } from '../schemas/wallet.schema';

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
 *                   items: { $ref: '#/components/schemas/ExchangeRate' }
 */
router.get('/rates', getRates);

/**
 * @swagger
 * /api/exchange/history:
 *   get:
 *     summary: Obtener el historial mensual de cotización para un par de monedas
 *     tags: [Exchange]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         example: ARS
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         example: COP
 *     responses:
 *       200:
 *         description: Historial de cotizaciones
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
 *                       rate: { type: number, example: 4.25 }
 *                       created_at: { type: string, format: date-time }
 */
router.get('/history', validate(exchangeHistorySchema, 'query'), getHistory);

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
