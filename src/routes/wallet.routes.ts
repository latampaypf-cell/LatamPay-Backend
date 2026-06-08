import { Router } from 'express';
import { getWallet, lookupRecipient, getContacts, deposit, withdraw, swap, transfer, getHistory } from '../controllers/wallet.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { depositSchema, withdrawSchema, swapSchema, transferSchema, historyQuerySchema } from '../schemas/wallet.schema';

const router = Router();

// Todas las rutas de billetera requieren autenticación
router.use(requireAuth);

/**
 * @swagger
 * /api/wallets/me:
 *   get:
 *     summary: Obtener datos de la billetera y balances del usuario
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de la billetera y saldos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data: { $ref: '#/components/schemas/Wallet' }
 *       401:
 *         description: No autorizado
 */
router.get('/me', getWallet);

/**
 * @swagger
 * /api/wallets/lookup/{identifier}:
 *   get:
 *     summary: Buscar un destinatario por CBU o Alias
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: CBU o Alias del destinatario
 *     responses:
 *       200:
 *         description: Datos del destinatario encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     name: { type: string, example: "Juan Perez" }
 *                     cbu: { type: string, example: "1234567890123456789012" }
 *                     alias: { type: string, example: "juan.perez.lp" }
 *       404:
 *         description: No encontrado
 */
router.get('/lookup/:identifier', lookupRecipient);

/**
 * @swagger
 * /api/wallets/contacts:
 *   get:
 *     summary: Obtener lista de contactos recientes (personas a las que ya se transfirió)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contactos frecuentes
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
 *                       name: { type: string }
 *                       cbu: { type: string }
 *                       alias: { type: string }
 */
router.get('/contacts', getContacts);

/**
 * @swagger
 * /api/wallets/deposit:
 *   post:
 *     summary: Cargar saldo en la billetera
 *     tags: [Wallet]
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
 *     responses:
 *       200:
 *         description: Depósito exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId: { type: string }
 *                     amount: { type: number }
 *                     currency: { type: string }
 *       401:
 *         description: No autorizado
 */
router.post('/deposit', validate(depositSchema), deposit);

/**
 * @swagger
 * /api/wallets/withdraw:
 *   post:
 *     summary: Retirar fondos de la billetera
 *     tags: [Wallet]
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
 *     responses:
 *       200:
 *         description: Retiro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId: { type: string }
 *                     amount: { type: number }
 *                     currency: { type: string }
 *       400:
 *         description: Saldo insuficiente o datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: No autorizado
 */
router.post('/withdraw', validate(withdrawSchema), withdraw);

/**
 * @swagger
 * /api/wallets/swap:
 *   post:
 *     summary: Cambiar divisas (ej. ARS a COP)
 *     tags: [Wallet]
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
 *     responses:
 *       200:
 *         description: Cambio de divisa exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId: { type: string }
 *                     fromAmount: { type: number }
 *                     toAmount: { type: number }
 *                     rate: { type: number }
 *       400:
 *         description: Saldo insuficiente o datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: No autorizado
 */
router.post('/swap', validate(swapSchema), swap);

/**
 * @swagger
 * /api/wallets/transfer:
 *   post:
 *     summary: Transferir fondos a otro usuario por CBU o Alias
 *     tags: [Wallet]
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
 *     responses:
 *       200:
 *         description: Transferencia exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId: { type: string }
 *                     to: { type: string }
 *                     amount: { type: number }
 *       400:
 *         description: Saldo insuficiente o datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Destinatario no encontrado
 */
router.post('/transfer', validate(transferSchema), transfer);

/**
 * @swagger
 * /api/wallets/history:
 *   get:
 *     summary: Obtener el historial de transacciones del usuario
 *     tags: [Wallet]
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
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems: { type: integer }
 *                         totalPages: { type: integer }
 *                         currentPage: { type: integer }
 *                         limit: { type: integer }
 */
router.get('/history', validate(historyQuerySchema, 'query'), getHistory);

export default router;
