import { Router } from 'express';
import { deposit, withdraw, transfer, getHistory } from '../controllers/transaction.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { depositSchema, withdrawSchema, transferSchema } from '../schemas/wallet.schema';
import { paginationSchema } from '../schemas/common.schema';

const router = Router();

// Todas las rutas de transacciones requieren autenticación
router.use(requireAuth);

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Cargar saldo en la billetera
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency_code
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000.50
 *               currency_code:
 *                 type: string
 *                 example: ARS
 *               description:
 *                 type: string
 *                 example: "Carga de saldo mensual"
 *     responses:
 *       200:
 *         description: Depósito exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Transaction' }
 */
router.post('/deposit', validate(depositSchema), deposit);

/**
 * @swagger
 * /api/transactions/withdraw:
 *   post:
 *     summary: Retirar fondos de la billetera
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency_code
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500.00
 *               currency_code:
 *                 type: string
 *                 example: ARS
 *               description:
 *                 type: string
 *                 example: "Retiro para efectivo"
 *     responses:
 *       200:
 *         description: Retiro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Transaction' }
 */
router.post('/withdraw', validate(withdrawSchema), withdraw);

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transferir fondos a otro usuario por CBU o Alias
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to_identifier
 *               - amount
 *               - currency_code
 *             properties:
 *               to_identifier:
 *                 type: string
 *                 example: latampay.facundo.123
 *               amount:
 *                 type: number
 *                 example: 1500
 *               currency_code:
 *                 type: string
 *                 example: ARS
 *               description:
 *                 type: string
 *                 example: "Mitad del asado"
 *     responses:
 *       200:
 *         description: Transferencia exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Transaction' }
 */
router.post('/transfer', validate(transferSchema), transfer);

/**
 * @swagger
 * /api/transactions/history:
 *   get:
 *     summary: Obtener el historial de transacciones del usuario
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Historial de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Transaction' }
 *                     pagination: { $ref: '#/components/schemas/PaginationInfo' }
 */
router.get('/history', validate(paginationSchema, 'query'), getHistory);

export default router;
