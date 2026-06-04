import app from './app';
import dotenv from 'dotenv';

// Cargar las variables de entorno del archivo .env en process.env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Levanta el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log('--------------------------------------------------');
  console.log(`⚡️ [server]: LatamPay corriendo en http://localhost:${PORT}`);
  console.log('--------------------------------------------------');
});