import { describe, it, expect, vi, beforeEach } from 'vitest';

// Seteamos variables de entorno ficticias
process.env.EXCHANGE_RATE_API_KEY = 'mock_api_key';
process.env.JWT_SECRET = 'a_very_long_and_secure_secret_for_testing_32_chars';
process.env.DATABASE_URL = 'postgresql://localhost:5432/mock';

import request from 'supertest';
import app from '../app';
import { syncExchangeRates } from '../services/exchange.service';
import * as db from '../db';

// Mock del pool de base de datos
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

// Mock de autenticación
vi.mock('../middlewares/auth.middleware', () => ({
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

  describe('POST /api/wallets/swap', () => {
    it('debería realizar el cambio de divisa exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) // SELECT wallet
          .mockResolvedValueOnce({ rows: [{ amount: 2000 }] }) // SELECT balance
          .mockResolvedValueOnce({ rows: [{ rate: 5 }] }) // SELECT exchange rate
          .mockResolvedValueOnce({ rows: [] }) // UPDATE from balance
          .mockResolvedValueOnce({ rows: [] }) // INSERT/UPDATE to balance
          .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
          .mockResolvedValueOnce({ rows: [] }), // COMMIT
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/wallets/swap')
        .send({ from_currency: 'ARS', to_currency: 'COP', amount: 100 });

      expect(response.status).toBe(200);
      expect(response.body.data.toAmount).toBe(500);
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
        .post('/api/wallets/swap')
        .send({ from_currency: 'ARS', to_currency: 'COP', amount: 100 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Saldo insuficiente.');
    });
  });
});
