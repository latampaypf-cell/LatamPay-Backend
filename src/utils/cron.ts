import cron from 'node-cron';
import { syncExchangeRates } from '../services/exchange.service';

/**
 * Configura todas las tareas programadas del backend.
 */
export const setupCronJobs = () => {
  // Ejecutar cada hora: '0 * * * *'
  // Para pruebas rápidas podrías usar cada 5 minutos: '*/5 * * * *'
  cron.schedule('0 * * * *', async () => {
    try {
      await syncExchangeRates();
    } catch (error) {
      console.error('Error en el cron job de sincronización de tasas:', error);
    }
  });

  console.log('⏰ Tareas programadas configuradas (Sincronización de tasas cada hora).');
};
