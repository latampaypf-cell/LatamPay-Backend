import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log('--------------------------------------------------');
  console.log(`⚡️ [server]: LatamPay corriendo en http://localhost:${config.port}`);
  console.log('--------------------------------------------------');
});