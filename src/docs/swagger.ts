import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';
import { swaggerComponents } from './components';

const apiFiles = config.isProduction
     ? ['./dist/routes/*.js', './dist/schemas/*.js']
  : ['./src/routes/*.ts', './src/schemas/*.ts'];

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LatamPay API Documentation',
      version: '1.0.0',
      description: 'Documentación oficial de la API de LatamPay - Plataforma de pagos y transferencias.',
      contact: {
        name: 'LatamPay Team',
      },
    },
    servers: [
      {
        url: config.isProduction ? (config.serverUrl || '/') : `http://localhost:${config.port}`,
        description: config.isProduction ? 'Servidor de Producción' : 'Servidor de desarrollo',
      },
    ],
    components: swaggerComponents,
  },
  apis: apiFiles,
};

export const swaggerSpec = swaggerJsdoc(options);
