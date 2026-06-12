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

describe('Operaciones Financieras - Transferencia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería transferir fondos exitosamente', async () => {
    const mClient = createMockClient();
    mClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'wallet-origin' }] }) // SELECT origin wallet
      .mockResolvedValueOnce({ rows: [{ amount: 1000 }] }) // SELECT balance
      .mockResolvedValueOnce({ rows: [{ id: 'wallet-dest' }] }) // SELECT dest wallet
      .mockResolvedValueOnce({ rows: [] }) // UPDATE origin balance
      .mockResolvedValueOnce({ rows: [] }) // INSERT/UPDATE dest balance
      .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
      .mockResolvedValueOnce({ rows: [] }) // COMMIT
      .mockResolvedValueOnce({ rows: [
        { email: 'from@test.com', name: 'From', wallet_id: 'wallet-origin' },
        { email: 'to@test.com', name: 'To', wallet_id: 'wallet-dest' }
      ] }) // SELECT user emails
      .mockResolvedValueOnce({ rows: [{ id: 'tx-123', amount: 500, type: 'transfer' }] }); // getTransactionById

    (db.default.connect as any).mockResolvedValueOnce(mClient);

    const response = await request(app)
      .post('/api/transactions/transfer')
      .send({ to_identifier: 'latampay.dest.123', amount: 500, currency_code: 'ARS' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(mClient.query).toHaveBeenCalledWith('COMMIT');
  });

  it('debería fallar si el destinatario no existe', async () => {
    const mClient = createMockClient();
    mClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'wallet-origin' }] }) // SELECT origin wallet
      .mockResolvedValueOnce({ rows: [{ amount: 1000 }] }) // SELECT balance
      .mockResolvedValueOnce({ rows: [] }) // SELECT dest wallet (VACÍO)
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    (db.default.connect as any).mockResolvedValueOnce(mClient);

    const response = await request(app)
      .post('/api/transactions/transfer')
      .send({ to_identifier: 'inexistente', amount: 100, currency_code: 'ARS' });

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Destinatario no encontrado');
  });
});
