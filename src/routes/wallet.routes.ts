import { Router } from 'express';
import { getWallet, lookupRecipient, getContacts } from '../controllers/wallet.controller';
import { requireAuth } from '../middlewares/auth.middleware';

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

export default router;
