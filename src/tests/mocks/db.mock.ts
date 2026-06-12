import { vi } from 'vitest';

export const mClient = {
  query: vi.fn(),
  release: vi.fn(),
};

export const mPool = {
  connect: vi.fn(() => mClient),
  query: vi.fn(),
};

vi.mock('../db', () => ({
  default: mPool,
  query: mPool.query,
}));
