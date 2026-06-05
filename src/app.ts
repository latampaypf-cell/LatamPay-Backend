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

const allowedOrigins = config.frontendUrl ? config.frontendUrl.split(',') : '*';

app.use(cors({
  origin: config.isProduction
    ? allowedOrigins  // En producción acepta las URLs definidas (ej: localhost y Vercel)
    : '*',            // En desarrollo acepta cualquier origen
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