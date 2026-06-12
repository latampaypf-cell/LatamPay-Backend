import { describe, it, expect, vi, Mock } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../middlewares/error.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { JwtPayload } from '../types/auth.types';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

describe('Middleware de Errores', () => {
  it('debería manejar AppError correctamente', () => {
    const mReq = {} as Request;
    const mRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const mNext = vi.fn() as unknown as NextFunction;
    const error = new AppError('Controlled error', 400);

    errorHandler(error, mReq, mRes, mNext);

    expect(mRes.status).toHaveBeenCalledWith(400);
    expect(mRes.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Controlled error',
    });
  });

  it('debería manejar un Error genérico con estado 500', () => {
    const mReq = {} as Request;
    const mRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const mNext = vi.fn() as unknown as NextFunction;
    const error = new Error('Unexpected error');

    // Espiamos console.error para no ensuciar la salida del test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, mReq, mRes, mNext);

    expect(mRes.status).toHaveBeenCalledWith(500);
    expect(mRes.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
    }));
    
    consoleSpy.mockRestore();
  });
});

describe('Middleware de Administrador', () => {
  it('debería permitir el acceso si el usuario es administrador', () => {
    const mReq = {
      user: { id: '1', email: 'admin@test.com', role: 'admin' }
    } as unknown as Request;
    const mRes = {} as Response;
    const mNext = vi.fn() as unknown as NextFunction;

    requireAdmin(mReq, mRes, mNext);

    expect(mNext).toHaveBeenCalledWith();
  });

  it('debería denegar el acceso si el usuario no es administrador', () => {
    const mReq = {
      user: { id: '1', email: 'user@test.com', role: 'user' }
    } as unknown as Request;
    const mRes = {} as Response;
    const mNext = vi.fn() as unknown as NextFunction;

    requireAdmin(mReq, mRes, mNext);

    const error = (mNext as unknown as Mock).mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.message).toContain('permisos de administrador');
  });

  it('debería denegar el acceso si no hay usuario presente', () => {
    const mReq = {} as unknown as Request;
    const mRes = {} as Response;
    const mNext = vi.fn() as unknown as NextFunction;

    requireAdmin(mReq, mRes, mNext);

    const error = (mNext as unknown as Mock).mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
  });
});

describe('Middleware de Autenticación', () => {
  it('debería permitir el acceso y adjuntar el usuario si el token es válido', () => {
    const mReq = {
      headers: { authorization: 'Bearer valid_token' }
    } as unknown as AuthenticatedRequest;
    const mRes = {} as Response;
    const mNext = vi.fn() as unknown as NextFunction;

    // JWT ya está mockeado en vitest globalmente (en este archivo o a través de setup)
    // Pero aquí podemos mockearlo localmente para este test si es necesario.
    // Como ya lo mockeamos en auth.integration.test.ts, vamos a ver si necesitamos repetirlo.
    // En este archivo NO lo mockeamos aún.

    vi.spyOn(jwt, 'verify').mockReturnValue({ id: '1', email: 'test@test.com', role: 'user' } as any);

    requireAuth(mReq, mRes, mNext);

    expect(mNext).toHaveBeenCalledWith();
    expect(mReq.user).toBeDefined();
    expect(mReq.user?.email).toBe('test@test.com');
  });

  it('debería denegar el acceso si no se proporciona un token', () => {
    const mReq = { headers: {} } as unknown as Request;
    const mRes = {} as Response;
    const mNext = vi.fn() as unknown as NextFunction;

    requireAuth(mReq, mRes, mNext);

    const error = (mNext as unknown as Mock).mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('No se proporcionó un token');
  });

  it('debería denegar el acceso si el token es inválido', () => {
    const mReq = {
      headers: { authorization: 'Bearer invalid_token' }
    } as unknown as Request;
    const mRes = {} as Response;
    const mNext = vi.fn() as unknown as NextFunction;

    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Token inválido');
    });

    requireAuth(mReq, mRes, mNext);

    const error = (mNext as unknown as Mock).mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('Token inválido');
  });
});
