import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import authRoutes from './routes/auth.routes';
import exchangeRoutes from './routes/exchange.routes';
import walletRoutes from './routes/wallet.routes';
import transactionRoutes from './routes/transaction.routes';
import { errorHandler } from './middlewares/error.middleware';
import { corsOptions } from './config/cors';

const app: Application = express();

// ====================================================================
// MIDDLEWARES GLOBALES
// ====================================================================

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json());

// ====================================================================
// DOCUMENTACIÓN SWAGGER
// ====================================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ====================================================================
// RUTAS
// ====================================================================

app.use('/api/auth', authRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '¡Hola El backend de LatamPay está activo 🚀!' ,
    status: 'success',
    timestamp: new Date(),
  });
});

// ====================================================================
// MIDDLEWARE DE ERRORES — siempre al final, después de todas las rutas
// ====================================================================

app.use(errorHandler);

export default app;