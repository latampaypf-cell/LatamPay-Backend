import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import * as db from '../../db';
import { ENV_VARS, TEST_USER } from '../utils/test-constants';
import { createMockClient } from '../utils/db-mock-factory';

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

describe('Operaciones Financieras - Depósito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería depositar fondos exitosamente', async () => {
    const mClient = createMockClient();
    mClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
      .mockResolvedValueOnce({ rows: [] }) // INSERT/UPDATE balance
      .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
      .mockResolvedValueOnce({ rows: [] }) // COMMIT
      .mockResolvedValueOnce({ rows: [{ email: 'test@test.com', name: 'Test' }] }) // SELECT user email
      .mockResolvedValueOnce({ rows: [{ id: 'tx-123', amount: 1000, type: 'deposit' }] }); // getTransactionById

    (db.default.connect as any).mockResolvedValueOnce(mClient);

    const response = await request(app)
      .post('/api/transactions/deposit')
      .send({ amount: 1000, currency_code: 'ARS' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.amount).toBe(1000);
  });
});
