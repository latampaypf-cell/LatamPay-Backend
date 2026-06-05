import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app';
import * as db from '../db';

// Mockeamos el módulo de base de datos
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

// Mockeamos bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Mockeamos jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked_token'),
    verify: vi.fn().mockReturnValue({ id: '123', email: 'test@test.com', role: 'user' }),
  },
}));

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // 1. Mock de la verificación de email duplicado (no existe)
      (db.query as any).mockResolvedValueOnce({ rows: [] });

      // 2. Mock de la transacción y las inserciones
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: '123', name: 'Test', email: 'test@test.com', role: 'user' }] }) // INSERT user
          .mockResolvedValueOnce({ rows: [{ id: 'w123', cbu: '123...', alias: 'latampay.test' }] }) // INSERT wallet
          .mockResolvedValueOnce({ rows: [{ code: 'ARS' }, { code: 'USD' }] }) // SELECT currencies
          .mockResolvedValue({ rows: [] }), // INSERT balances y COMMIT
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@test.com');
      expect(mClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '', // Nombre vacío (asumiendo que falla validación)
          email: 'not-an-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should return 409 if email already exists', async () => {
      // Mock de que el email ya existe
      (db.query as any).mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('ya está registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      // 1. Mock de búsqueda de usuario
      (db.query as any).mockResolvedValueOnce({
        rows: [{
          id: '123',
          name: 'Test User',
          email: 'test@test.com',
          password_hash: 'hashed_password',
          role: 'user'
        }]
      });

      // 2. Mock de bcrypt.compare (ya está mockeado arriba para devolver true)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBe('mocked_token');
      expect(response.body.data.user.email).toBe('test@test.com');
    });

    it('should return 401 for invalid credentials', async () => {
      // Mock de usuario no encontrado
      (db.query as any).mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info if token is valid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.user.id).toBe('123');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No se proporcionó un token');
    });
  });
});
