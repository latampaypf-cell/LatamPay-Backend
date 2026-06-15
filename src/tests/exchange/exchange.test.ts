import { describe, it, expect, vi, beforeEach } from 'vitest';

// Seteamos variables de entorno ficticias
process.env.EXCHANGE_RATE_API_KEY = 'mock_api_key';
process.env.JWT_SECRET = 'a_very_long_and_secure_secret_for_testing_32_chars';
process.env.DATABASE_URL = 'postgresql://localhost:5432/mock';

import request from 'supertest';
import app from '../../app';
import { syncExchangeRates } from '../../services/exchange.service';
import * as db from '../../db';

// Mock del pool de base de datos
vi.mock('../../db', () => {
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

// Mock de autenticación
vi.mock('../../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@latampay.com', role: 'user' };
    next();
  },
}));

describe('Servicio de Intercambio (Exchange & Swaps)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sincronización de Tasas', () => {
    it('debería sincronizar las tasas de cambio exitosamente y calcular tasas cruzadas', async () => {
      const mockApiResponse = {
        result: 'success',
        conversion_rates: { ARS: 1, COP: 5.0, VES: 0.1 },
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockApiResponse),
      });

      const mClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      await syncExchangeRates();
      expect(mClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('POST /api/exchange/swap', () => {
    it('debería realizar el cambio de divisa exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [{ amount: 2000 }] }) // SELECT balance
          .mockResolvedValueOnce({ rows: [{ rate: 5 }] }) // SELECT exchange rate
          .mockResolvedValueOnce({ rows: [] }) // UPDATE from balance (usuario)
          .mockResolvedValueOnce({ rows: [] }) // INSERT/UPDATE to balance (usuario)
          .mockResolvedValueOnce({ rows: [{ id: 'admin-wallet' }] }) // SELECT admin wallet
          .mockResolvedValueOnce({ rows: [] }) // INSERT/UPDATE admin balance (commission)
          .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
          .mockResolvedValueOnce({ rows: [] }) // COMMIT
          .mockResolvedValueOnce({ rows: [{ email: 'test@test.com', name: 'Test' }] }) // SELECT user email
          .mockResolvedValueOnce({ rows: [{ id: 'tx-123', type: 'swap', from_amount: 100, to_amount: 485, fee: 15 }] }), // getTransactionById (100 * 5 = 500. 500 * 0.97 = 485)
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/exchange/swap')
        .send({ from_currency: 'ARS', to_currency: 'COP', amount: 100 });

      expect(response.status).toBe(200);
      expect(response.body.data.to_amount).toBe(485);
      expect(response.body.data.fee).toBe(15);
    });

    it('debería fallar si el monto es insuficiente para cubrir la comisión', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [{ amount: 10 }] }) // SELECT balance
          .mockResolvedValueOnce({ rows: [{ rate: 0.01 }] }), // Tasa muy baja (100 * 0.01 = 1)
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/exchange/swap')
        .send({ from_currency: 'ARS', to_currency: 'VES', amount: 100 });

      // 100 * 0.01 = 1.00 (Monto convertido)
      // 1.00 * 0.03 = 0.03 (Comisión)
      // 1.00 - 0.03 = 0.97 (toAmount)
      // En este caso 0.97 > 0, así que pasaría. Probemos con un monto que de <= 0.
      
      const mClientFail = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [{ amount: 1 }] }) // SELECT balance
          .mockResolvedValueOnce({ rows: [{ rate: 0.0001 }] }), // Tasa ínfima
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClientFail);

      const resFail = await request(app)
        .post('/api/exchange/swap')
        .send({ from_currency: 'ARS', to_currency: 'VES', amount: 1 });

      expect(resFail.status).toBe(400);
      expect(resFail.body.message).toContain('demasiado bajo');
    });

    it('debería fallar si el saldo es insuficiente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [{ amount: 10 }] }) // SELECT balance (insuficiente)
          .mockResolvedValueOnce({ rows: [] }), // ROLLBACK
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/exchange/swap')
        .send({ from_currency: 'ARS', to_currency: 'COP', amount: 100 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Saldo insuficiente.');
    });
  });
});
