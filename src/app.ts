import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

const app: Application = express();

// ====================================================================
// MIDDLEWARES GLOBALES
// ====================================================================

// Permite conectar tu backend con el frontend de tus compañeros
app.use(cors({
  origin: '*', // Permitimos todas las conexiones en desarrollo
  credentials: true
}));

// Permite a Express entender JSON en el body de las peticiones
app.use(express.json());

// ====================================================================
// INTEGRACIÓN DE RUTAS DE LA API
// ====================================================================

// Registramos las rutas de autenticación con el prefijo /api/auth
app.use('/api/auth', authRoutes);

// Endpoint de prueba (Hola Mundo) en la raíz
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: '¡Hola Facu! El backend de LatamPay está activo 🚀',
    status: 'success',
    timestamp: new Date()
  });
});

export default app;