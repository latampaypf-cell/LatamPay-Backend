import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import * as db from '../../db';
import { ENV_VARS } from '../utils/test-constants';

// Configuración de entorno
Object.assign(process.env, ENV_VARS);

// Mocks
vi.mock('../../db', () => ({
  default: { connect: vi.fn(), query: vi.fn() },
  query: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked_token'),
  },
}));

describe('Autenticación - Inicio de Sesión', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería iniciar sesión exitosamente con credenciales correctas', async () => {
    (db.query as any).mockResolvedValueOnce({
      rows: [{
        id: '123',
        name: 'Test User',
        email: 'test@test.com',
        password_hash: 'hashed_password',
        role: 'user'
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'Password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.token).toBe('mocked_token');
    expect(response.body.data.user.email).toBe('test@test.com');
  });

  it('debería retornar 401 para credenciales inválidas', async () => {
    (db.query as any).mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@test.com',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Credenciales inválidas');
  });
});
