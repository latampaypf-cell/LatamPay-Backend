import dotenv from 'dotenv';
import { z } from 'zod';

// 1. Cargamos las variables de entorno del archivo .env
dotenv.config();

// 2. Validamos las variables de entorno con Zod
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'Falta la variable de entorno obligatoria DATABASE_URL.'),
  JWT_SECRET:   z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres.'),
  PORT:         z.coerce.number().default(3000),
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    console.error(`❌ [config-error]: en el campo ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

// 3. Exportamos las configuraciones limpias y tipadas
export const config = {
  port:         parsed.data.PORT,
  databaseUrl:  parsed.data.DATABASE_URL,
  jwtSecret:    parsed.data.JWT_SECRET,
  nodeEnv:      parsed.data.NODE_ENV,
  isProduction: parsed.data.NODE_ENV === 'production',
  frontendUrl:  parsed.data.FRONTEND_URL,
} as const;

export default config;