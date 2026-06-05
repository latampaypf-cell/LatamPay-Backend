import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { config } from './config';

const app: Application = express();

// ====================================================================
// MIDDLEWARES GLOBALES
// ====================================================================

app.set('trust proxy', 1);

const allowedOrigins = (config.frontendUrl ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!config.isProduction) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (vercelPreviewRegex.test(origin)) return callback(null, true);
    return callback(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ====================================================================
// DOCUMENTACIÓN SWAGGER
// ====================================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ====================================================================
// RUTAS
// ====================================================================

app.use('/api/auth', authRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '¡Hola Facu! El backend de LatamPay está activo 🚀',
    status: 'success',
    timestamp: new Date(),
  });
});

// ====================================================================
// MIDDLEWARE DE ERRORES — siempre al final, después de todas las rutas
// ====================================================================

app.use(errorHandler);

export default app;