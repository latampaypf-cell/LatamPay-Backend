import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import * as db from '../../db';
import { config } from '../../config';

// Mock de base de datos
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

describe('Pruebas de Enriquecimiento de Transacciones', () => {
  const mockUserId = 'user-123';
  const mockToken = jwt.sign({ id: mockUserId, email: 'test@test.com', role: 'user' }, config.jwtSecret);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/transactions/transfer', () => {
    it('debería devolver el objeto de transacción enriquecido con nombres y CBUs al transferir', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-from-id' }] }) // SELECT from wallet
          .mockResolvedValueOnce({ rows: [{ amount: 1000 }] }) // SELECT balance
          .mockResolvedValueOnce({ rows: [{ id: 'wallet-to-id' }] }) // SELECT to wallet
          .mockResolvedValueOnce({ rows: [] }) // UPDATE from balance
          .mockResolvedValueOnce({ rows: [] }) // UPDATE/INSERT to balance
          .mockResolvedValueOnce({ rows: [] }) // INSERT transaction
          .mockResolvedValueOnce({ rows: [] }) // COMMIT
          .mockResolvedValueOnce({ rows: [
            { email: 'from@test.com', name: 'Facundo Origen', wallet_id: 'wallet-from-123' },
            { email: 'to@test.com', name: 'Juan Destino', wallet_id: 'wallet-to-456' }
          ] }) // SELECT user emails
          // Mock de getTransactionById (La consulta enriquecida)
          .mockResolvedValueOnce({ 
            rows: [{ 
              id: 'tx-123', 
              type: 'transfer', 
              from_name: 'Facundo Origen', 
              from_alias: 'facu.origen',
              from_cbu: '1111111111111111111111',
              to_name: 'Juan Destino',
              to_alias: 'juan.dest',
              to_cbu: '2222222222222222222222',
              from_amount: 500,
              to_amount: 500,
              description: 'Pago de prueba'
            }] 
          }),
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          to_identifier: 'juan.dest',
          amount: 500,
          currency_code: 'ARS',
          description: 'Pago de prueba'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.from_name).toBe('Facundo Origen');
      expect(response.body.data.to_name).toBe('Juan Destino');
      expect(response.body.data.from_cbu).toBeDefined();
      expect(response.body.data.description).toBe('Pago de prueba');
    });
  });

  describe('GET /api/transactions/history', () => {
    it('debería devolver el historial con información de identidad en cada fila', async () => {
      // Mock de la búsqueda de billetera
      (db.query as any).mockResolvedValueOnce({ rows: [{ id: 'wallet-id' }] });
      
      // Mock del historial enriquecido
      (db.query as any).mockResolvedValueOnce({ 
        rows: [
          { 
            id: 'tx-1', 
            type: 'transfer', 
            direction: 'received',
            from_name: 'Maria Recibe', 
            from_alias: 'maria.rec',
            to_name: 'Facundo (Yo)',
            amount: 1000,
            description: 'Depósito de Maria'
          }
        ] 
      });

      // Mock del count
      (db.query as any).mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const response = await request(app)
        .get('/api/transactions/history')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.transactions[0].from_name).toBe('Maria Recibe');
      expect(response.body.data.transactions[0].from_alias).toBe('maria.rec');
    });
  });
});
