import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../middlewares/error.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../types';

describe('Error Middleware', () => {
  it('should handle AppError correctly', () => {
    const mReq = {} as Request;
    const mRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const mNext = vi.fn() as NextFunction;
    const error = new AppError('Controlled error', 400);

    errorHandler(error, mReq, mRes, mNext);

    expect(mRes.status).toHaveBeenCalledWith(400);
    expect(mRes.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Controlled error',
    });
  });

  it('should handle generic Error with 500 status', () => {
    const mReq = {} as Request;
    const mRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const mNext = vi.fn() as NextFunction;
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

describe('Admin Middleware', () => {
  it('should allow access if user is admin', () => {
    const mReq = {
      user: { id: '1', email: 'admin@test.com', role: 'admin' }
    } as AuthenticatedRequest;
    const mRes = {} as Response;
    const mNext = vi.fn() as NextFunction;

    requireAdmin(mReq, mRes, mNext);

    expect(mNext).toHaveBeenCalledWith();
  });

  it('should deny access if user is not admin', () => {
    const mReq = {
      user: { id: '1', email: 'user@test.com', role: 'user' }
    } as AuthenticatedRequest;
    const mRes = {} as Response;
    const mNext = vi.fn() as NextFunction;

    requireAdmin(mReq, mRes, mNext);

    const error = mNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.message).toContain('permisos de administrador');
  });

  it('should deny access if no user is present', () => {
    const mReq = {} as AuthenticatedRequest;
    const mRes = {} as Response;
    const mNext = vi.fn() as NextFunction;

    requireAdmin(mReq, mRes, mNext);

    const error = mNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
  });
});

describe('Auth Middleware', () => {
  it('should allow access and attach user if token is valid', () => {
    const mReq = {
      headers: { authorization: 'Bearer valid_token' }
    } as AuthenticatedRequest;
    const mRes = {} as Response;
    const mNext = vi.fn() as NextFunction;

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

  it('should deny access if no token is provided', () => {
    const mReq = { headers: {} } as AuthenticatedRequest;
    const mRes = {} as Response;
    const mNext = vi.fn() as NextFunction;

    requireAuth(mReq, mRes, mNext);

    const error = mNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('No se proporcionó un token');
  });

  it('should deny access if token is invalid', () => {
    const mReq = {
      headers: { authorization: 'Bearer invalid_token' }
    } as AuthenticatedRequest;
    const mRes = {} as Response;
    const mNext = vi.fn() as NextFunction;

    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    requireAuth(mReq, mRes, mNext);

    const error = mNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('Token inválido');
  });
});
