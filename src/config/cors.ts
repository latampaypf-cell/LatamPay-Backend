import { CorsOptions } from 'cors';
import { config } from './index';

const allowedOrigins = (config.frontendUrl ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    
    // En desarrollo permitimos todo
    if (!config.isProduction) return callback(null, true);
    
    // Validar orígenes permitidos
    if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
};
