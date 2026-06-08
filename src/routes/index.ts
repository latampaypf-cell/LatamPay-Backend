import { Router } from 'express';
import authRoutes from './auth.routes';
import exchangeRoutes from './exchange.routes';
import walletRoutes from './wallet.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/exchange', exchangeRoutes);
router.use('/wallets', walletRoutes);

export default router;
