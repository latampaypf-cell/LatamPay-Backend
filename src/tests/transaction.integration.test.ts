import { describe, it, expect, vi, beforeEach } from 'vitest';

// Seteamos variables de entorno ficticias
process.env.EXCHANGE_RATE_API_KEY = 'mock_api_key_for_testing_purposes_only';
process.env.JWT_SECRET = 'a_very_long_and_secure_secret_for_testing_32_chars';
process.env.DATABASE_URL = 'postgresql://localhost:5432/mock';

import request from 'supertest';
import app from '../app';
import * as db from '../db';

// Mockeamos el pool de la base de datos
vi.mock('../db', () => {
  const mPool = {
    connect: vi.fn(() => ({
      query: vi.fn(),
      release: vi.fn(),
    })),
    query: vi.fn(),
  };
  return {
    default: mPool,
    query: vi.fn(),
  };
});

// Mockeamos el middleware de autenticación
vi.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@latampay.com', role: 'user' };
    next();
  },
}));

describe('Pruebas de Transacciones (Depósitos, Retiros, Transferencias e Historial)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/wallets/deposit', () => {
    it('debería depositar fondos exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [] }) // INSERT/UPDATE balance
          .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
          .mockResolvedValueOnce({ rows: [] }), // COMMIT
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/wallets/deposit')
        .send({ amount: 1000, currency_code: 'ARS' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.amount).toBe(1000);
    });
  });

  describe('POST /api/wallets/withdraw', () => {
    it('debería retirar fondos exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [{ amount: 1000 }] }) // SELECT balance (suficiente)
          .mockResolvedValueOnce({ rows: [] }) // UPDATE balance
          .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
          .mockResolvedValueOnce({ rows: [] }), // COMMIT
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/wallets/withdraw')
        .send({ amount: 500, currency_code: 'ARS' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.amount).toBe(500);
    });

    it('debería fallar si no hay saldo suficiente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [{ amount: 100 }] }) // SELECT balance (insuficiente)
          .mockResolvedValueOnce({ rows: [] }), // ROLLBACK
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/wallets/withdraw')
        .send({ amount: 500, currency_code: 'ARS' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Saldo insuficiente');
    });
  });

  describe('POST /api/wallets/transfer', () => {
    it('debería transferir fondos exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-origin' }] }) // SELECT origin wallet
          .mockResolvedValueOnce({ rows: [{ amount: 1000 }] }) // SELECT balance
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-dest' }] }) // SELECT dest wallet
          .mockResolvedValueOnce({ rows: [] }) // UPDATE origin balance
          .mockResolvedValueOnce({ rows: [] }) // INSERT/UPDATE dest balance
          .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
          .mockResolvedValueOnce({ rows: [] }), // COMMIT
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/wallets/transfer')
        .send({ to_identifier: 'latampay.dest.123', amount: 500, currency_code: 'ARS' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(mClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('debería fallar si el destinatario no existe', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-origin' }] }) // SELECT origin wallet
          .mockResolvedValueOnce({ rows: [{ amount: 1000 }] }) // SELECT balance
          .mockResolvedValueOnce({ rows: [] }) // SELECT dest wallet (VACÍO)
          .mockResolvedValueOnce({ rows: [] }), // ROLLBACK
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/wallets/transfer')
        .send({ to_identifier: 'inexistente', amount: 100, currency_code: 'ARS' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Destinatario no encontrado');
    });
  });

  describe('GET /api/wallets/history', () => {
    it('debería obtener el historial de transacciones con paginación', async () => {
      (db.query as any)
        .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) 
        .mockResolvedValueOnce({ rows: [
          { id: 'tx-1', type: 'deposit', from_amount: 100, direction: 'received', created_at: new Date() },
          { id: 'tx-2', type: 'transfer', from_amount: 50, direction: 'sent', created_at: new Date() }
        ] }) 
        .mockResolvedValueOnce({ rows: [{ count: '2' }] });

      const response = await request(app).get('/api/wallets/history?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.transactions).toHaveLength(2);
      expect(response.body.data.pagination.totalItems).toBe(2);
    });
  });
});
