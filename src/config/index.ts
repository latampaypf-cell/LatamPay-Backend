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
  SERVER_URL:   z.string().url().optional(),
  EXCHANGE_RATE_API_KEY: z.string().min(1, 'Falta la API Key de ExchangeRate-API.'),
  GEMINI_API_KEY: z.string().min(1, 'Falta la API Key de Google Gemini.'),
  MOCK_BOT: z.string().optional().transform(val => val === 'true'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SES_FROM_EMAIL: z.string().email().optional(),
  ENABLE_EMAIL_MOCK: z.string().optional().transform(val => val !== 'false'), // Default true if not specified as 'false'
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && process.env.NODE_ENV !== 'test') {
  parsed.error.issues.forEach((issue) => {
    console.error(`❌ [config-error]: en el campo ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

// 3. Exportamos las configuraciones limpias y tipadas (con fallback para tests)
export const config = {
  port:         parsed.data?.PORT ?? 3000,
  databaseUrl:  parsed.data?.DATABASE_URL ?? '',
  jwtSecret:    parsed.data?.JWT_SECRET ?? 'secret_for_testing_purposes_only_32_chars',
  nodeEnv:      parsed.data?.NODE_ENV ?? 'development',
  isProduction: parsed.data?.NODE_ENV === 'production',
  frontendUrl:  parsed.data?.FRONTEND_URL,
  serverUrl:    parsed.data?.SERVER_URL,
  exchangeRateApiKey: parsed.data?.EXCHANGE_RATE_API_KEY ?? 'mock_key',
  geminiApiKey: parsed.data?.GEMINI_API_KEY ?? '',
  mockBot:      parsed.data?.MOCK_BOT ?? false,
  aws: {
    region: parsed.data?.AWS_REGION ?? 'us-east-1',
    accessKeyId: parsed.data?.AWS_ACCESS_KEY_ID,
    secretAccessKey: parsed.data?.AWS_SECRET_ACCESS_KEY,
    fromEmail: parsed.data?.AWS_SES_FROM_EMAIL,
  },
  enableEmailMock: parsed.data?.ENABLE_EMAIL_MOCK ?? true,
} as const;

export default config;