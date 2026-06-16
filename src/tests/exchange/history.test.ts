import { describe, it, expect, vi, beforeEach } from 'vitest';
import pool from '../mocks/db.mock';
import { getExchangeHistory, syncExchangeRates } from '../../services/exchange.service';
import { ExchangeHistory } from '../../types/exchange.types';

// Mockear el módulo de base de datos para que use el mock centralizado
vi.mock('../../db', () => ({
  default: pool,
  query: pool.query,
}));

describe('Exchange History Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe recuperar el historial de cotizaciones en orden ascendente', async () => {
    const mockHistory: ExchangeHistory[] = [
      { rate: 4.20, created_at: new Date('2024-03-01T10:00:00Z') },
      { rate: 4.25, created_at: new Date('2024-03-01T11:00:00Z') }
    ];

    (pool.query as any).mockResolvedValueOnce({ rows: mockHistory });

    const history = await getExchangeHistory('ARS', 'COP');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT rate, created_at'),
      ['ARS', 'COP']
    );
    expect(history).toHaveLength(2);
    expect(history[0].rate).toBe(4.20);
    expect(history[0].created_at).toBeInstanceOf(Date);
  });

  it('debe limpiar datos de más de 30 días durante la sincronización', async () => {
    // Mock de fetch para la API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'success',
        conversion_rates: { ARS: 1, COP: 4.25, VES: 0.04 }
      })
    });

    const clientMock = {
      query: vi.fn().mockResolvedValue({}),
      release: vi.fn(),
    };
    (pool.connect as any).mockResolvedValue(clientMock);

    await syncExchangeRates();

    // Verificar que se llamó a la eliminación de datos viejos
    expect(clientMock.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM exchange_rates WHERE created_at < NOW() - INTERVAL '30 days'")
    );
  });
});
