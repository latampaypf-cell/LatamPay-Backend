import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import * as db from '../../db';
import { ENV_VARS } from '../utils/test-constants';
import { createMockClient } from '../utils/db-mock-factory';

// Configuración de entorno
Object.assign(process.env, ENV_VARS);

// Mocks
vi.mock('../../db', () => ({
  default: { connect: vi.fn(), query: vi.fn() },
  query: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked_token'),
    verify: vi.fn().mockReturnValue({ id: '123', email: 'test@test.com', role: 'user' }),
  },
}));

describe('Autenticación - Registro de Usuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería registrar un nuevo usuario exitosamente', async () => {
    (db.query as any).mockResolvedValueOnce({ rows: [] });

    const mClient = createMockClient();
    mClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: '123', name: 'Test', email: 'test@test.com', role: 'user' }] }) // INSERT user
      .mockResolvedValueOnce({ rows: [{ id: 'w123', cbu: '123...', alias: 'latampay.test' }] }) // INSERT wallet
      .mockResolvedValueOnce({ rows: [{ code: 'ARS' }, { code: 'USD' }] }) // SELECT currencies
      .mockResolvedValue({ rows: [] }); // INSERT balances y COMMIT

    (db.default.connect as any).mockResolvedValueOnce(mClient);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@test.com',
        password: 'Password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.user.email).toBe('test@test.com');
    expect(mClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('debería retornar 409 si el email ya existe', async () => {
    (db.query as any).mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'existing@test.com',
        password: 'Password123'
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('ya está registrado');
  });
});
