import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('App Root', () => {
  it('should return 200 and welcome message at /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('¡Hola Facu!');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
  });
});
