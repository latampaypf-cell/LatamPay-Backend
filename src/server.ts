import app from './app';
import { config } from './config';
import { setupCronJobs } from './utils/cron';
import { syncExchangeRates } from './services/exchange.service';

app.listen(config.port, async () => {
  console.log('--------------------------------------------------');
  console.log(`⚡️ [server]: LatamPay corriendo en http://localhost:${config.port}`);
  
  // Inicializamos tareas en segundo plano
  setupCronJobs();
  
  // Sincronización inicial de tasas (sin bloquear el inicio del servidor)
  syncExchangeRates().catch(console.error);

  console.log('--------------------------------------------------');
});