import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../app';
import * as db from '../../db';

// Mock del módulo de base de datos
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
    query: mPool.query,
  };
});

// Mock de bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('new_hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Mock de jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked_token'),
    verify: vi.fn().mockReturnValue({ id: 'user-123', email: 'test@test.com', role: 'user' }),
  },
}));

describe('Pruebas de Integración del Perfil de Usuario', () => {
  const mockToken = 'valid-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH /api/auth/profile', () => {
    it('debería actualizar el nombre exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ email: 'test@test.com', name: 'Old Name', password_hash: 'old_hash' }] }) // SELECT current user
          .mockResolvedValueOnce({ rows: [] }) // UPDATE users
          .mockResolvedValueOnce({ rows: [] }) // COMMIT
          .mockResolvedValueOnce({ rows: [{ id: 'user-123', name: 'New Name', email: 'test@test.com', alias: 'test.alias' }] }), // SELECT final result
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('New Name');
      expect(mClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('debería actualizar el alias exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ email: 'test@test.com', name: 'Test', password_hash: 'old_hash' }] }) // SELECT current user
          .mockResolvedValueOnce({ rows: [] }) // SELECT alias check (not taken)
          .mockResolvedValueOnce({ rows: [] }) // UPDATE wallets
          .mockResolvedValueOnce({ rows: [] }) // COMMIT
          .mockResolvedValueOnce({ rows: [{ id: 'user-123', name: 'Test', email: 'test@test.com', alias: 'new.alias' }] }), // SELECT final result
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ alias: 'new.alias' });

      expect(response.status).toBe(200);
      expect(response.body.data.alias).toBe('new.alias');
    });

    it('debería fallar si el alias ya está en uso', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ email: 'test@test.com', name: 'Test', password_hash: 'old_hash' }] }) // SELECT current user
          .mockResolvedValueOnce({ rows: [{ id: 'other-wallet' }] }) // SELECT alias check (TAKEN)
          .mockResolvedValueOnce({ rows: [] }), // ROLLBACK
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ alias: 'taken.alias' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('ya está en uso');
    });

    it('debería actualizar la contraseña exitosamente', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ email: 'test@test.com', name: 'Test', password_hash: 'old_hash' }] }) // SELECT current user
          .mockResolvedValueOnce({ rows: [] }) // UPDATE users (password)
          .mockResolvedValueOnce({ rows: [] }) // COMMIT
          .mockResolvedValueOnce({ rows: [{ id: 'user-123', name: 'Test', email: 'test@test.com' }] }), // SELECT final result
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);
      (bcrypt.compare as any).mockResolvedValueOnce(true);

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ 
          currentPassword: 'OldPassword123', 
          newPassword: 'NewPassword123' 
        });

      expect(response.status).toBe(200);
      expect(bcrypt.compare).toHaveBeenCalledWith('OldPassword123', 'old_hash');
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123', 10);
    });

    it('debería fallar si la contraseña actual es incorrecta', async () => {
      const mClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [{ email: 'test@test.com', name: 'Test', password_hash: 'old_hash' }] }) // SELECT current user
          .mockResolvedValueOnce({ rows: [] }), // ROLLBACK
        release: vi.fn(),
      };
      (db.default.connect as any).mockResolvedValueOnce(mClient);
      (bcrypt.compare as any).mockResolvedValueOnce(false); // WRONG PASSWORD

      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ 
          currentPassword: 'WrongPassword', 
          newPassword: 'NewPassword123' 
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('incorrecta');
    });

    it('debería fallar si falta la contraseña actual al querer cambiar la nueva', async () => {
      // Este caso lo debería atrapar la validación de Zod antes de entrar al servicio
      const response = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ 
          newPassword: 'NewPassword123' 
        });

      expect(response.status).toBe(400);
    });
  });
});
