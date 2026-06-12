import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { PublicSupportService } from '../../services/public-support.service';
import { UserSupportService } from '../../services/user-support.service';
import { config } from '../../config';

// Mockeamos los servicios de soporte
vi.mock('../../services/public-support.service', () => ({
  PublicSupportService: {
    getInformationalReply: vi.fn(),
  },
}));

vi.mock('../../services/user-support.service', () => ({
  UserSupportService: {
    getPersonalizedReply: vi.fn(),
  },
}));

describe('Pruebas de Integración de Soporte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/support/info', () => {
    it('debería responder con éxito cuando el mensaje es válido', async () => {
      const mockReply = 'Hola, soy el asistente de LatamPay. ¿En qué puedo ayudarte?';
      vi.mocked(PublicSupportService.getInformationalReply).mockResolvedValue(mockReply);

      const response = await request(app)
        .post('/api/support/info')
        .send({
          message: '¿Cómo me registro?',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.reply).toBe(mockReply);
      expect(response.body.data.updatedHistory).toHaveLength(2);
    });

    it('debería fallar con 400 si el mensaje está vacío', async () => {
      const response = await request(app)
        .post('/api/support/info')
        .send({
          message: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('debería fallar con 400 si el mensaje es demasiado largo', async () => {
      const longMessage = 'a'.repeat(501);
      const response = await request(app)
        .post('/api/support/info')
        .send({
          message: longMessage,
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('debería manejar errores del servicio de IA correctamente', async () => {
      vi.mocked(PublicSupportService.getInformationalReply).mockRejectedValue(new Error('IA Error'));

      const response = await request(app)
        .post('/api/support/info')
        .send({
          message: 'Hola',
        });

      expect(response.status).toBe(500);
      // El middleware global de error maneja esto
    });

    it('debería mantener el historial de conversación', async () => {
      const mockReply = 'Respuesta de prueba';
      vi.mocked(PublicSupportService.getInformationalReply).mockResolvedValue(mockReply);

      const history = [{ role: 'user', text: 'Hola' }, { role: 'model', text: 'Hola, ¿qué tal?' }];
      
      const response = await request(app)
        .post('/api/support/info')
        .send({
          message: '¿Qué monedas aceptan?',
          history: history
        });

      expect(response.status).toBe(200);
      expect(response.body.data.updatedHistory).toHaveLength(4);
      expect(response.body.data.updatedHistory[0]).toEqual(history[0]);
    });

    it('debería fallar con 400 si el historial tiene un formato inválido', async () => {
      const response = await request(app)
        .post('/api/support/info')
        .send({
          message: 'Hola',
          history: [{ role: 'admin', text: 'Soy un intruso' }] // 'admin' no es un rol válido
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/support/chat', () => {
    it('debería responder con éxito y contexto personalizado para usuarios logueados', async () => {
      // Generamos un token manual para saltar el login real
      const token = jwt.sign(
        { id: '44444444-4444-4444-4444-444444444444', email: 'facundo@latampay.com', role: 'user' },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      
      const mockReply = 'Hola Facundo, tu saldo es de 5000 ARS.';
      vi.mocked(UserSupportService.getPersonalizedReply).mockResolvedValue(mockReply);

      const response = await request(app)
        .post('/api/support/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '¿Cuánto dinero tengo?',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.reply).toBe(mockReply);
    });

    it('debería fallar con 401 si no hay token', async () => {
      const response = await request(app)
        .post('/api/support/chat')
        .send({
          message: 'Hola',
        });

      expect(response.status).toBe(401);
    });
  });
});
