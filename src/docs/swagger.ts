import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';

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
        url: config.isProduction ? '/' : `http://localhost:${config.port}`,
        description: config.isProduction ? 'Servidor de Producción' : 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/schemas/*.ts'], // Archivos donde buscaremos las anotaciones
};

export const swaggerSpec = swaggerJsdoc(options);
