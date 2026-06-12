import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import * as db from '../../db';
import { ENV_VARS, TEST_USER } from '../utils/test-constants';

// Configuración de entorno
Object.assign(process.env, ENV_VARS);

// Mocks
vi.mock('../../db', () => ({
  default: { connect: vi.fn(), query: vi.fn() },
  query: vi.fn(),
}));

vi.mock('../../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = TEST_USER;
    next();
  },
}));

describe('Operaciones Financieras - Historial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería obtener el historial de transacciones con paginación', async () => {
    (db.query as any)
      .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) 
      .mockResolvedValueOnce({ rows: [
        { id: 'tx-1', type: 'deposit', from_amount: 100, direction: 'received', created_at: new Date() },
        { id: 'tx-2', type: 'transfer', from_amount: 50, direction: 'sent', created_at: new Date() }
      ] }) 
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const response = await request(app).get('/api/transactions/history?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.transactions).toHaveLength(2);
    expect(response.body.data.pagination.totalItems).toBe(2);
  });
});
