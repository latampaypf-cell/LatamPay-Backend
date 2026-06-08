import { describe, it, expect, vi, beforeEach } from 'vitest';

// Seteamos variables de entorno ficticias para que la validación de config no falle
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

// Mockeamos el middleware de autenticación para que siempre deje pasar
vi.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@latampay.com', role: 'user' };
    next();
  },
}));

describe('Funcionalidades de la Billetera (Información, Búsqueda y Contactos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/wallets/me', () => {
    it('debería obtener los datos de la billetera del usuario', async () => {
      (db.query as any).mockResolvedValueOnce({
        rows: [{ 
          id: 'wallet-123', 
          cbu: '12345', 
          alias: 'mi.alias', 
          balances: [{ currency: 'ARS', amount: 100 }] 
        }]
      });

      const response = await request(app).get('/api/wallets/me');

      expect(response.status).toBe(200);
      expect(response.body.data.cbu).toBe('12345');
    });
  });

  describe('GET /api/wallets/lookup/:identifier', () => {
    it('debería encontrar un destinatario por CBU o Alias', async () => {
      (db.query as any).mockResolvedValueOnce({
        rows: [{ name: 'Juan Perez', cbu: '12345', alias: 'juan.perez' }]
      });

      const response = await request(app).get('/api/wallets/lookup/12345');

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Juan Perez');
    });

    it('debería devolver 404 si el destinatario no existe', async () => {
      (db.query as any).mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/wallets/lookup/noexiste');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('No se encontró');
    });
  });

  describe('GET /api/wallets/contacts', () => {
    it('debería obtener la lista de contactos recientes', async () => {
      (db.query as any)
        .mockResolvedValueOnce({ rows: [{ id: 'wallet-123' }] }) 
        .mockResolvedValueOnce({
          rows: [
            { name: 'Amigo 1', cbu: '111', alias: 'amigo.1' },
            { name: 'Amigo 2', cbu: '222', alias: 'amigo.2' }
          ]
        });

      const response = await request(app).get('/api/wallets/contacts');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Amigo 1');
    });
  });
});
