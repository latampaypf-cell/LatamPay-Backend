import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Ruta Raíz de la App', () => {
  it('debería retornar 200 y el mensaje de bienvenida en /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('¡Hola Facu!');
  });

  it('debería retornar 404 para rutas desconocidas', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
  });
});
