import { Pool } from 'pg';
import dotenv from 'dotenv';

// Nos aseguramos de leer las variables del archivo .env
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Creamos la instancia del Pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En producción (Railway), Postgres suele requerir conexiones seguras SSL
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

/**
 * Helper para realizar consultas a la base de datos de manera fácil en tus servicios.
 * Se encarga de abrir una conexión del pool, ejecutar la query y liberarla automáticamente.
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log en consola solo para desarrollo local (para ver qué queries se ejecutan y cuánto tardan)
    if (!isProduction) {
      console.log('Query ejecutada:', { text, duration: `${duration}ms`, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Error en la base de datos:', error);
    throw error;
  }
};

export default pool;