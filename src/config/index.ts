import dotenv from 'dotenv';

// 1. Cargamos las variables de entorno del archivo .env
dotenv.config();

// 2. Validamos que las variables de entorno obligatorias estén presentes al iniciar el servidor
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ [config-error]: Falta la variable de entorno obligatoria '${envVar}' en el archivo .env.`);
    process.exit(1); // Detiene el servidor inmediatamente para que no corra con configuraciones corruptas
  }
}

// 3. Exportamos las configuraciones limpias y tipadas
export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;